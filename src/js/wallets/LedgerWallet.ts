// import AppBtc from "@ledgerhq/hw-app-btc";
//@ts-ignore
import AppAvax from '@obsidiansystems/hw-app-avalanche'

import moment from 'moment'
import { Buffer, BN } from 'avalanche'
import HDKey from 'hdkey'
import { ava, avm, bintools, cChain, pChain } from '@/AVA'
var bippath = require('bip32-path')
import createHash from 'create-hash'
import store from '@/store'

import { UTXO, UTXOSet as AVMUTXOSet } from 'avalanche/dist/apis/avm/utxos'
import { AvaWalletCore, ChainAlias } from '@/js/wallets/IAvaHdWallet'
import { ITransaction } from '@/components/wallet/transfer/types'
import {
    AVMConstants,
    OperationTx,
    SelectCredentialClass,
    TransferableOperation,
    TransferableOutput as AVMTransferableOutput,
    Tx as AVMTx,
    UnsignedTx as AVMUnsignedTx,
} from 'avalanche/dist/apis/avm'

import {
    ImportTx,
    ExportTx,
    TransferableOutput as PlatformTransferableOutput,
    Tx as PlatformTx,
    UTXO as PlatformUTXO,
    UnsignedTx as PlatformUnsignedTx,
    UTXOSet as PlatformUTXOSet,
    PlatformVMConstants,
} from 'avalanche/dist/apis/platformvm'

import { Credential, SigIdx, Signature } from 'avalanche/dist/common'
import { getPreferredHRP, PayloadBase } from 'avalanche/dist/utils'
import { HdWalletCore } from '@/js/wallets/HdWalletCore'
import { ILedgerAppConfig, WalletNameType } from '@/store/types'
import { bnToBig, digestMessage } from '@/helpers/helper'
import { web3 } from '@/evm'
import { AVA_ACCOUNT_PATH } from './AvaHdWallet'
import { ChainIdType } from '@/constants'
import { ParseableAvmTxEnum, ParseablePlatformEnum } from '../TxHelper'
import { ILedgerBlockMessage } from '../../store/modules/ledger/types'

class LedgerWallet extends HdWalletCore implements AvaWalletCore {
    app: AppAvax
    type: WalletNameType

    ethAddress: string
    ethBalance: BN
    ethAddressBech: string
    config: ILedgerAppConfig

    constructor(app: AppAvax, hdkey: HDKey, config: ILedgerAppConfig) {
        super(hdkey)
        this.app = app
        this.type = 'ledger'
        this.config = config

        // TODO: Add actual values
        this.ethAddress = ''
        this.ethBalance = new BN(0)
        this.ethAddressBech = ''
    }

    static async fromApp(app: AppAvax, config: ILedgerAppConfig) {
        let res = await app.getWalletExtendedPublicKey(AVA_ACCOUNT_PATH)

        let hd = new HDKey()
        hd.publicKey = res.public_key
        hd.chainCode = res.chain_code

        return new LedgerWallet(app, hd, config)
    }

    // Returns an array of derivation paths that need to sign this transaction
    // Used with signTransactionHash and signTransactionParsable
    getTransactionPaths<UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx>(
        unsignedTx: UnsignedTx,
        isAVM: boolean = true
    ): { paths: string[]; isAvaxOnly: boolean } {
        let tx = unsignedTx.getTransaction()
        let txType = tx.getTxType()

        let ins = tx.getIns()
        let operations: TransferableOperation[] = []

        // Try to get operations, it will fail if there are none, ignore and continue
        try {
            operations = (tx as OperationTx).getOperations()
        } catch (e) {
            console.log(e)
        }

        let items = ins
        if (txType === AVMConstants.IMPORTTX || txType === PlatformVMConstants.IMPORTTX) {
            items = (tx as ImportTx).getImportInputs()
        }

        let hrp = getPreferredHRP(ava.getNetworkID())
        let chainId = isAVM ? 'X' : 'P'

        let paths: string[] = []

        let isAvaxOnly = true
        // Collect paths derivation paths for source addresses
        for (let i = 0; i < items.length; i++) {
            let item = items[i]

            let assetId = bintools.cb58Encode(item.getAssetID())
            // @ts-ignore
            if (assetId !== store.state.Assets.AVA_ASSET_ID) {
                isAvaxOnly = false
            }

            let sigidxs: SigIdx[] = item.getInput().getSigIdxs()
            let sources = sigidxs.map((sigidx) => sigidx.getSource())
            let addrs: string[] = sources.map((source) => {
                return bintools.addressToString(hrp, chainId, source)
            })

            for (let j = 0; j < addrs.length; j++) {
                let srcAddr = addrs[j]
                let pathStr = this.getPathFromAddress(srcAddr) // returns change/index

                paths.push(pathStr)
            }
        }

        // Do the Same for operational inputs, if there are any...
        for (let i = 0; i < operations.length; i++) {
            let op = operations[i]
            let sigidxs: SigIdx[] = op.getOperation().getSigIdxs()
            let sources = sigidxs.map((sigidx) => sigidx.getSource())
            let addrs: string[] = sources.map((source) => {
                return bintools.addressToString(hrp, chainId, source)
            })

            for (let j = 0; j < addrs.length; j++) {
                let srcAddr = addrs[j]
                let pathStr = this.getPathFromAddress(srcAddr) // returns change/index

                paths.push(pathStr)
            }
        }

        return { paths, isAvaxOnly }
    }

    pathsToUniqueBipPaths(paths: string[]) {
        let uniquePaths = paths.filter((val: any, i: number) => {
            return paths.indexOf(val) === i
        })

        let bip32Paths = uniquePaths.map((path) => {
            return bippath.fromString(path, false)
        })

        return bip32Paths
    }

    getChangeBipPath<UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx>(
        unsignedTx: UnsignedTx,
        chainId: ChainAlias
    ) {
        let tx = unsignedTx.getTransaction()
        let txType = tx.getTxType()

        const chainChangePath = this.getChangePath(chainId).split('m/')[1]
        let changeIdx = this.getChangeIndex(chainId)
        // If change and destination paths are the same
        // it can cause ledger to not display the destination amt.
        // Since platform helper does not have internal/external
        // path for change (it uses the next address)
        // there can be an address collisions.
        if (
            (txType === PlatformVMConstants.IMPORTTX || txType === PlatformVMConstants.EXPORTTX) &&
            this.platformHelper.hdIndex === this.externalHelper.hdIndex
        ) {
            return null
        } else if (
            txType === PlatformVMConstants.ADDVALIDATORTX ||
            txType === PlatformVMConstants.ADDDELEGATORTX
        ) {
            changeIdx = this.platformHelper.getFirstAvailableIndex()
        }

        return bippath.fromString(`${AVA_ACCOUNT_PATH}/${chainChangePath}/${changeIdx}`)
    }

    getCredentials<UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx>(
        unsignedTx: UnsignedTx,
        paths: string[],
        sigMap: any
    ): Credential[] {
        let creds: Credential[] = []
        let tx = unsignedTx.getTransaction()
        let txType = tx.getTxType()

        let ins = tx.getIns()

        let items = ins
        if (txType === AVMConstants.IMPORTTX || txType === PlatformVMConstants.IMPORTTX) {
            items = (tx as ImportTx).getImportInputs()
        }

        let operations: TransferableOperation[] = []

        // Try to get operations, it will fail if there are none, ignore and continue
        try {
            operations = (tx as OperationTx).getOperations()
        } catch (e) {
            console.log(e)
        }

        for (let i = 0; i < items.length; i++) {
            const sigidxs: SigIdx[] = items[i].getInput().getSigIdxs()
            const cred: Credential = SelectCredentialClass(items[i].getInput().getCredentialID())

            for (let j = 0; j < sigidxs.length; j++) {
                let pathIndex = i + j
                let pathStr = paths[pathIndex]

                let sigRaw = sigMap.get(pathStr)
                let sigBuff = Buffer.from(sigRaw)
                const sig: Signature = new Signature()
                sig.fromBuffer(sigBuff)
                cred.addSignature(sig)
            }
            creds.push(cred)
        }

        for (let i = 0; i < operations.length; i++) {
            let op = operations[i].getOperation()
            const sigidxs: SigIdx[] = op.getSigIdxs()
            const cred: Credential = SelectCredentialClass(op.getCredentialID())

            for (let j = 0; j < sigidxs.length; j++) {
                let pathIndex = items.length + i + j
                let pathStr = paths[pathIndex]

                let sigRaw = sigMap.get(pathStr)
                let sigBuff = Buffer.from(sigRaw)
                const sig: Signature = new Signature()
                sig.fromBuffer(sigBuff)
                cred.addSignature(sig)
            }
            creds.push(cred)
        }

        return creds
    }

    // Used for non parsable transactions.
    // Ideally we wont use this function at all, but ledger is not ready yet.
    async signTransactionHash<
        UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx,
        SignedTx extends AVMTx | PlatformTx
    >(unsignedTx: UnsignedTx, paths: string[], isAVM: boolean = true): Promise<SignedTx> {
        let txbuff = unsignedTx.toBuffer()
        const msg: Buffer = Buffer.from(createHash('sha256').update(txbuff).digest())

        try {
            store.commit('Ledger/openModal', {
                title: 'Sign Hash',
                messages: [],
                info: msg.toString('hex').toUpperCase(),
            })

            let bip32Paths = this.pathsToUniqueBipPaths(paths)

            // Sign the msg with ledger
            const accountPath = bippath.fromString(`${AVA_ACCOUNT_PATH}`)
            let sigMap = await this.app.signHash(accountPath, bip32Paths, msg)
            store.commit('Ledger/closeModal')

            let sigs: Credential[] = this.getCredentials<UnsignedTx>(unsignedTx, paths, sigMap)

            let signedTx
            if (isAVM) {
                signedTx = new AVMTx(unsignedTx as AVMUnsignedTx, sigs)
            } else {
                signedTx = new PlatformTx(unsignedTx as PlatformUnsignedTx, sigs)
            }
            return signedTx as SignedTx
        } catch (e) {
            store.commit('Ledger/closeModal')
            console.log(e)
            throw e
        }
    }

    // Used for signing transactions that are parsable
    async signTransactionParsable<
        UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx,
        SignedTx extends AVMTx | PlatformTx
    >(unsignedTx: UnsignedTx, paths: string[], isAVM: boolean = true): Promise<SignedTx> {
        let tx = unsignedTx.getTransaction()
        let txType = tx.getTxType()
        let chainId: ChainAlias = isAVM ? 'X' : 'P'
        let parseableTxs = chainId === 'X' ? ParseableAvmTxEnum : ParseablePlatformEnum

        let title = `Sign ${parseableTxs[txType]}`

        let bip32Paths = this.pathsToUniqueBipPaths(paths)

        const accountPath = bippath.fromString(`${AVA_ACCOUNT_PATH}`)
        let txbuff = unsignedTx.toBuffer()
        let changePath = this.getChangeBipPath(unsignedTx, chainId)
        let messages = this.getTransactionMessages<UnsignedTx>(unsignedTx, isAVM, changePath)

        try {
            store.commit('Ledger/openModal', {
                title: title,
                messages: messages,
                info: null,
            })

            let ledgerSignedTx = await this.app.signTransaction(
                accountPath,
                bip32Paths,
                txbuff,
                changePath
            )
            let sigMap = ledgerSignedTx.signatures

            let creds = this.getCredentials<UnsignedTx>(unsignedTx, paths, sigMap)

            let signedTx
            if (isAVM) {
                signedTx = new AVMTx(unsignedTx as AVMUnsignedTx, creds)
            } else {
                signedTx = new PlatformTx(unsignedTx as PlatformUnsignedTx, creds)
            }
            return signedTx as SignedTx
        } catch (e) {
            store.commit('Ledger/closeModal')
            console.log(e)
            throw e
        }
    }

    getOutputMessages<Outputs extends AVMTransferableOutput[] | PlatformTransferableOutput[]>(
        outs: Outputs,
        isAVM: boolean,
        changePath: null | { toPathArray: () => number[] }
    ): ILedgerBlockMessage[] {
        let messages: ILedgerBlockMessage[] = []
        let chainId: ChainAlias = isAVM ? 'X' : 'P'
        let hrp = getPreferredHRP(ava.getNetworkID())

        let changeIdx = changePath?.toPathArray()[changePath?.toPathArray().length - 1]
        let changeAddr = this.getChangeFromIndex(changeIdx, chainId)

        for (let i = 0; i < outs.length; i++) {
            outs[i]
                .getOutput()
                .getAddresses()
                .forEach((value) => {
                    const addr = bintools.addressToString(hrp, chainId, value)
                    // @ts-ignore
                    const amt = bnToBig(outs[i].getOutput().getAmount(), 9)

                    if (!changePath || changeAddr !== addr)
                        messages.push({
                            title: 'Output',
                            value: `${addr} - ${amt.toString()} AVAX`,
                        })
                })
        }

        return messages
    }

    // Given the unsigned transaction returns an array of messages that will be displayed on ledgegr window
    getTransactionMessages<UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx>(
        unsignedTx: UnsignedTx,
        isAVM: boolean = true,
        changePath: null | { toPathArray: () => number[] }
    ): ILedgerBlockMessage[] {
        let messages: ILedgerBlockMessage[] = []

        let tx = unsignedTx.getTransaction()
        let txType = tx.getTxType()
        let outs = tx.getOuts()
        let outputMessages = this.getOutputMessages(outs, isAVM, changePath)

        // regular output messages, if any
        messages.push(...outputMessages)

        if (txType === AVMConstants.EXPORTTX || txType === PlatformVMConstants.EXPORTTX) {
            outs = (tx as ExportTx).getExportOutputs()
            // export output messages, if any
            outputMessages = this.getOutputMessages(outs, isAVM, changePath)
            messages.push(...outputMessages)
        }

        // TODO: Construct the messages array depending on transaction type
        if (
            txType === PlatformVMConstants.ADDDELEGATORTX ||
            txType === PlatformVMConstants.ADDVALIDATORTX
        ) {
            const format = 'YYYY-MM-DD H:mm:ss UTC'
            // @ts-ignore
            const nodeID = bintools.cb58Encode(tx.nodeID)
            // @ts-ignore
            const startTime = moment(parseInt(tx.getStartTime()) * 1000)
                .utc()
                .format(format)
            // @ts-ignore
            const endTime = moment(parseInt(tx.getEndTime()) * 1000)
                .utc()
                .format(format)
            // @ts-ignore
            const stakeAmt = bnToBig(tx.getStakeAmount(), 9)
            messages.push({ title: 'NodeID', value: nodeID })
            messages.push({ title: 'Start Time', value: startTime })
            messages.push({ title: 'End Time', value: endTime })
            messages.push({ title: 'Total Stake', value: `${stakeAmt} AVAX` })
            messages.push({
                title: 'Stake',
                value: `${stakeAmt} to ${this.platformHelper.getCurrentAddress()}`,
            })
            messages.push({
                title: 'Reward to',
                value: `${this.platformHelper.getCurrentAddress()}`,
            })
            // @ts-ignore
            if (tx.delegationFee) {
                // @ts-ignore
                messages.push({ title: 'Delegation Fee', value: `${tx.delegationFee}%` })
            }
            messages.push({ title: 'Fee', value: '0' })
        }
        if (
            txType === AVMConstants.EXPORTTX ||
            txType === AVMConstants.IMPORTTX ||
            txType === PlatformVMConstants.EXPORTTX ||
            txType === PlatformVMConstants.IMPORTTX ||
            txType === AVMConstants.BASETX
        ) {
            messages.push({ title: 'Fee', value: `${0.001} AVAX` })
        }

        return messages
    }

    async sign<
        UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx,
        SignedTx extends AVMTx | PlatformTx
    >(unsignedTx: UnsignedTx, isAVM: boolean = true): Promise<SignedTx> {
        // Check if transaction can be parsed by ledger
        let tx = unsignedTx.getTransaction()
        let txType = tx.getTxType()
        let chainId = isAVM ? 'X' : 'P'

        let parseableTxs = chainId === 'X' ? ParseableAvmTxEnum : ParseablePlatformEnum

        let { paths, isAvaxOnly } = this.getTransactionPaths<UnsignedTx>(unsignedTx, isAVM)
        // If ledger doesnt support parsing, sign hash
        let canLedgerParse = this.config.version >= '0.3.1'
        let isParsableType = txType in parseableTxs && isAvaxOnly

        let signedTx
        if (canLedgerParse && isParsableType) {
            signedTx = await this.signTransactionParsable<UnsignedTx, SignedTx>(
                unsignedTx,
                paths,
                isAVM
            )
        } else {
            signedTx = await this.signTransactionHash<UnsignedTx, SignedTx>(
                unsignedTx,
                paths,
                isAVM
            )
        }

        store.commit('Ledger/closeModal')

        return signedTx
    }

    getEvmAddress(): string {
        return this.ethAddress
    }

    async getEthBalance() {
        console.error('Not implemented')
        // let bal = await web3.eth.getBalance(this.ethAddress)
        this.ethBalance = new BN(0)
        return this.ethBalance
    }

    async getUTXOs(): Promise<void> {
        // TODO: Move to shared file
        this.isFetchUtxos = true
        // If we are waiting for helpers to initialize delay the call
        let isInit =
            this.externalHelper.isInit && this.internalHelper.isInit && this.platformHelper.isInit
        if (!isInit) {
            setTimeout(() => {
                this.getUTXOs()
            }, 1000)
            // console.info('HD Not ready try again in 1 sec..')
            return
        }

        super.getUTXOs()
        this.getEthBalance()
        return
    }

    getPathFromAddress(address: string) {
        let externalAddrs = this.externalHelper.getExtendedAddresses()
        let internalAddrs = this.internalHelper.getExtendedAddresses()
        let platformAddrs = this.platformHelper.getExtendedAddresses()

        let extIndex = externalAddrs.indexOf(address)
        let intIndex = internalAddrs.indexOf(address)
        let platformIndex = platformAddrs.indexOf(address)

        if (extIndex >= 0) {
            return `0/${extIndex}`
        } else if (intIndex >= 0) {
            return `1/${intIndex}`
        } else if (platformIndex >= 0) {
            return `0/${platformIndex}`
        } else {
            throw 'Unable to find source address.'
        }
    }

    async issueBatchTx(
        orders: (ITransaction | UTXO)[],
        addr: string,
        memo?: Buffer
    ): Promise<string> {
        let unsignedTx = await this.buildUnsignedTransaction(orders, addr, memo)

        let tx = await this.sign<AVMUnsignedTx, AVMTx>(unsignedTx)
        const txId: string = await avm.issueTx(tx)

        // TODO: Must update index after sending a tx
        // TODO: Index will not increase but it could decrease.
        // TODO: With the current setup this can lead to gaps in index space greater than scan size.
        setTimeout(async () => {
            // Find the new HD index
            this.internalHelper.findHdIndex()
            this.externalHelper.findHdIndex()
            this.platformHelper.findHdIndex()
        }, 2000)

        return txId
    }

    async chainTransfer(amt: BN, sourceChain: string = 'X'): Promise<string> {
        let fee = avm.getTxFee()
        let amtFee = amt.add(fee)

        // EXPORT
        let pId = pChain.getBlockchainID()
        let xId = avm.getBlockchainID()
        let txId

        if (sourceChain === 'X') {
            let toAddress = this.platformHelper.getCurrentAddress()
            let xChangeAddr = this.internalHelper.getCurrentAddress()
            let fromAddrs = this.getDerivedAddresses()

            let exportTx = await avm.buildExportTx(
                this.utxoset,
                amtFee,
                pId,
                [toAddress],
                fromAddrs,
                [xChangeAddr]
            )
            let tx = await this.sign<AVMUnsignedTx, AVMTx>(exportTx)
            return avm.issueTx(tx)
        } else if (sourceChain === 'P') {
            let utxoSet = this.platformHelper.utxoSet as PlatformUTXOSet
            let toAddress = this.externalHelper.getCurrentAddress()
            let pChangeAddr = this.platformHelper.getCurrentAddress()
            let fromAddrs = this.platformHelper.getAllDerivedAddresses()

            let exportTx = await pChain.buildExportTx(
                utxoSet,
                amtFee,
                xId,
                [toAddress],
                fromAddrs,
                [pChangeAddr]
            )

            let tx = await this.sign<PlatformUnsignedTx, PlatformTx>(exportTx, false)
            return pChain.issueTx(tx)
        } else {
            throw 'Invalid source chain.'
        }
    }

    async importToPlatformChain(): Promise<string> {
        // await this.platformHelper.findHdIndex();
        const utxoSet = (await this.platformHelper.getAtomicUTXOs()) as PlatformUTXOSet

        if (utxoSet.getAllUTXOs().length === 0) {
            throw new Error('Nothing to import.')
        }

        // let pAddrs = this.platformHelper.getAllDerivedAddresses()
        // Owner addresses, the addresses we exported to
        let pToAddr = this.platformHelper.getCurrentAddress()

        let hrp = ava.getHRP()
        let utxoAddrs = utxoSet
            .getAddresses()
            .map((addr) => bintools.addressToString(hrp, 'P', addr))
        // let fromAddrs = utxoAddrs
        let ownerAddrs = utxoAddrs

        const unsignedTx = await pChain.buildImportTx(
            utxoSet,
            ownerAddrs,
            avm.getBlockchainID(),
            [pToAddr],
            [pToAddr],
            [pToAddr],
            undefined,
            undefined
        )
        const tx = await this.sign<PlatformUnsignedTx, PlatformTx>(unsignedTx, false)

        return pChain.issueTx(tx)
    }

    // TODO: Move to Core HD file
    async importToXChain(sourceChain: ChainIdType): Promise<string> {
        const utxoSet = (await this.externalHelper.getAtomicUTXOs()) as AVMUTXOSet

        if (utxoSet.getAllUTXOs().length === 0) {
            throw new Error('Nothing to import.')
        }

        // let externalIndex = this.externalHelper.hdIndex
        // let xAddrs = this.externalHelper.getAllDerivedAddresses()
        let xToAddr = this.externalHelper.getCurrentAddress()
        // let externalAddresses = this.externalHelper.getExtendedAddresses()
        // let xAddrs = this.getDerivedAddresses()
        // let xToAddr = this.externalHelper.getAllDerivedAddresses(externalIndex+10);

        let hrp = ava.getHRP()
        let utxoAddrs = utxoSet
            .getAddresses()
            .map((addr) => bintools.addressToString(hrp, 'X', addr))

        let fromAddrs = utxoAddrs
        let ownerAddrs = utxoAddrs

        let sourceChainId
        if (sourceChain === 'P') {
            sourceChainId = pChain.getBlockchainID()
        } else {
            sourceChainId = cChain.getBlockchainID()
        }

        // Owner addresses, the addresses we exported to
        const unsignedTx = await avm.buildImportTx(
            utxoSet,
            ownerAddrs,
            sourceChainId,
            [xToAddr],
            fromAddrs,
            [xToAddr]
        )

        let tx = await this.sign<AVMUnsignedTx, AVMTx>(unsignedTx)

        return avm.issueTx(tx)
    }

    async importToCChain(): Promise<string> {
        console.error('Not implemented.')
        return ''
    }

    async delegate(
        nodeID: string,
        amt: BN,
        start: Date,
        end: Date,
        rewardAddress?: string,
        utxos?: PlatformUTXO[]
    ): Promise<string> {
        // let keychain = this.platformHelper.getKeychain() as PlatformVMKeyChain;
        let utxoSet: PlatformUTXOSet = this.platformHelper.utxoSet as PlatformUTXOSet
        let pAddressStrings = this.platformHelper.getAllDerivedAddresses()
        let stakeAmount = amt

        // If given custom UTXO set use that
        if (utxos) {
            utxoSet = new PlatformUTXOSet()
            utxoSet.addArray(utxos)
        }

        // If reward address isn't given use index 0 address
        if (!rewardAddress) {
            rewardAddress = this.getPlatformRewardAddress()
        }

        let stakeReturnAddr = this.getPlatformRewardAddress()

        // For change address use first available on the platform chain
        let changeAddress = this.platformHelper.getFirstAvailableAddress()
        // Causes Ledger to crash because change and reward address are the same
        // let changeAddress = this.platformHelper.getCurrentAddress()

        // Convert dates to unix time
        let startTime = new BN(Math.round(start.getTime() / 1000))
        let endTime = new BN(Math.round(end.getTime() / 1000))

        const unsignedTx = await pChain.buildAddDelegatorTx(
            utxoSet,
            [stakeReturnAddr],
            pAddressStrings,
            [changeAddress],
            nodeID,
            startTime,
            endTime,
            stakeAmount,
            [rewardAddress] // reward address
        )

        const tx = await this.sign<PlatformUnsignedTx, PlatformTx>(unsignedTx, false)

        // Update UTXOS
        setTimeout(async () => {
            this.getUTXOs()
        }, 3000)

        return pChain.issueTx(tx)
    }

    async validate(
        nodeID: string,
        amt: BN,
        start: Date,
        end: Date,
        delegationFee: number,
        rewardAddress?: string,
        utxos?: PlatformUTXO[]
    ): Promise<string> {
        let utxoSet: PlatformUTXOSet = this.platformHelper.utxoSet as PlatformUTXOSet

        // If given custom UTXO set use that
        if (utxos) {
            utxoSet = new PlatformUTXOSet()
            utxoSet.addArray(utxos)
        }

        let pAddressStrings = this.platformHelper.getAllDerivedAddresses()

        let stakeAmount = amt

        // If reward address isn't given use index 0 address
        if (!rewardAddress) {
            rewardAddress = this.getPlatformRewardAddress()
        }

        // For change address use first available on the platform chain
        let changeAddress = this.platformHelper.getFirstAvailableAddress()
        // Causes Ledger to crash because change and reward address are the same
        // let changeAddress = this.platformHelper.getCurrentAddress()

        // Stake is always returned to address at index 0
        let stakeReturnAddr = this.getPlatformRewardAddress()

        // Convert dates to unix time
        let startTime = new BN(Math.round(start.getTime() / 1000))
        let endTime = new BN(Math.round(end.getTime() / 1000))

        const unsignedTx = await pChain.buildAddValidatorTx(
            utxoSet,
            [stakeReturnAddr],
            pAddressStrings, // from
            [changeAddress], // change
            nodeID,
            startTime,
            endTime,
            stakeAmount,
            [rewardAddress],
            delegationFee
        )

        // console.log(unsignedTx.serialize('display'));
        // console.log(unsignedTx.toBuffer().toString('hex'))

        let tx = await this.sign<PlatformUnsignedTx, PlatformTx>(unsignedTx, false)

        // console.log(tx.toBuffer().toString('hex'));
        // console.log((tx.serialize()))
        // console.log((tx.serialize('display')))
        // Update UTXOS
        setTimeout(async () => {
            this.getUTXOs()
        }, 3000)
        return pChain.issueTx(tx)
    }

    async signMessage(msgStr: string, address: string): Promise<string> {
        let index = this.externalHelper.findAddressIndex(address)

        if (index === null) throw 'Address not found.'

        let pathStr = `0/${index}`
        const addressPath = bippath.fromString(pathStr, false)
        const accountPath = bippath.fromString(`${AVA_ACCOUNT_PATH}`)

        let digest = digestMessage(msgStr)
        let digestBuff = Buffer.from(digest)
        let digestHex = digestBuff.toString('hex')

        store.commit('Ledger/openModal', {
            title: `Sign Hash`,
            info: digestHex.toUpperCase(),
        })

        try {
            let sigMap = await this.app.signHash(accountPath, [addressPath], digestBuff)
            store.commit('Ledger/closeModal')
            let signed = sigMap.get(pathStr)
            return bintools.cb58Encode(signed)
        } catch (e) {
            store.commit('Ledger/closeModal')
            throw e
        }
    }

    async createNftFamily(name: string, symbol: string, groupNum: number) {
        let tx = await this.buildCreateNftFamilyTx(name, symbol, groupNum)
        let signed = await this.sign<AVMUnsignedTx, AVMTx>(tx)
        return await avm.issueTx(signed)
    }

    async mintNft(mintUtxo: UTXO, payload: PayloadBase, quantity: number) {
        let tx = await this.buildMintNftTx(
            mintUtxo,
            payload,
            quantity,
            this.getCurrentAddress(),
            this.getChangeAddress()
        )
        let signed = await this.sign<AVMUnsignedTx, AVMTx>(tx)
        return await avm.issueTx(signed)
    }
    async sendEth(to: string, amount: BN, gasPrice: BN, gasLimit: number) {
        console.error('Not available yet.')
        return 'NOT AVAILABLE'
    }
}

export { LedgerWallet }
