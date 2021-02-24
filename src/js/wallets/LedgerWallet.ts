// import AppBtc from "@ledgerhq/hw-app-btc";
//@ts-ignore
import AppAvax from '@obsidiansystems/hw-app-avalanche'
//@ts-ignore
import Eth from '@ledgerhq/hw-app-eth'

import EthereumjsCommon from '@ethereumjs/common'
import { Transaction } from '@ethereumjs/tx'

import moment from 'moment'
import { Buffer, BN } from 'avalanche'
import HDKey from 'hdkey'
import { ava, avm, bintools, cChain, pChain } from '@/AVA'
const bippath = require('bip32-path')
import createHash from 'create-hash'
import store from '@/store'
import { importPublic, publicToAddress, bnToRlp, rlp } from 'ethereumjs-util'

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

import {
    UTXOSet as EVMUTXOSet,
    UnsignedTx as EVMUnsignedTx,
    ExportTx as EVMExportTx,
    Tx as EvmTx,
    EVMConstants,
    EVMInput,
} from 'avalanche/dist/apis/evm'

import { Credential, SigIdx, Signature, UTXOResponse, Address } from 'avalanche/dist/common'
import { getPreferredHRP, PayloadBase } from 'avalanche/dist/utils'
import { HdWalletCore } from '@/js/wallets/HdWalletCore'
import { ILedgerAppConfig, WalletNameType } from '@/store/types'
import { bnToBig, digestMessage } from '@/helpers/helper'
import { web3 } from '@/evm'
import { AVA_ACCOUNT_PATH, ETH_ACCOUNT_PATH, LEDGER_ETH_ACCOUNT_PATH } from './AvaHdWallet'
import { ChainIdType } from '@/constants'
import {
    buildExportTransaction,
    ParseableAvmTxEnum,
    ParseablePlatformEnum,
    ParseableEvmTxEnum,
} from '../TxHelper'
import { ILedgerBlockMessage } from '../../store/modules/ledger/types'
import Erc20Token from '@/js/Erc20Token'

export const MIN_EVM_SUPPORT_V = '0.4.0'

const isOdd = (str: string) => str.length % 2 !== 0
const toHex = (value: BN | number) => {
    const hex = value.toString(16)

    return isOdd(hex) ? `0x0${hex}` : `0x${hex}`
}

class LedgerWallet extends HdWalletCore implements AvaWalletCore {
    app: AppAvax
    ethApp: Eth
    type: WalletNameType

    ethAddress: string
    ethBalance: BN
    ethAddressBech: string
    config: ILedgerAppConfig

    constructor(app: AppAvax, hdkey: HDKey, config: ILedgerAppConfig, hdEth?: HDKey, ethApp?: Eth) {
        super(hdkey)
        this.app = app
        this.ethApp = ethApp
        this.type = 'ledger'
        this.config = config

        if (hdEth) {
            const ethKey = hdEth
            const ethPublic = importPublic(ethKey.publicKey)
            this.ethAddress = publicToAddress(ethPublic).toString('hex')
            this.ethBalance = new BN(0)
            this.ethAddressBech = bintools.addressToString(
                ava.getHRP(),
                'C',
                // @ts-ignore
                hdEth.pubKeyHash
            )
        } else {
            this.ethAddress = ''
            this.ethAddressBech = ''
            this.ethBalance = new BN(0)
        }
    }

    static async fromApp(app: AppAvax, eth: Eth, config: ILedgerAppConfig) {
        let res = await app.getWalletExtendedPublicKey(AVA_ACCOUNT_PATH)

        let hd = new HDKey()
        hd.publicKey = res.public_key
        hd.chainCode = res.chain_code

        let hdEth
        // TODO: enable when we want users upgrading after ledger fixes a few issues
        // const versionCheck = config.version >= MIN_EVM_SUPPORT_V
        const versionCheck = false
        if (versionCheck) {
            let ethRes = await eth.getAddress(LEDGER_ETH_ACCOUNT_PATH, true, true)
            hdEth = new HDKey()
            // @ts-ignore
            hdEth.publicKey = Buffer.from(ethRes.publicKey, 'hex')
            // @ts-ignore
            hdEth.chainCode = Buffer.from(ethRes.chainCode, 'hex')
        }

        return new LedgerWallet(app, hd, config, hdEth, eth)
    }

    // Returns an array of derivation paths that need to sign this transaction
    // Used with signTransactionHash and signTransactionParsable
    getTransactionPaths<UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx>(
        unsignedTx: UnsignedTx,
        chainId: ChainIdType
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
        if (
            (txType === AVMConstants.IMPORTTX && chainId === 'X') ||
            (txType === PlatformVMConstants.IMPORTTX && chainId === 'P')
        ) {
            items = (tx as ImportTx).getImportInputs()
        }

        let hrp = getPreferredHRP(ava.getNetworkID())
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

    getChangeBipPath<UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx | EVMUnsignedTx>(
        unsignedTx: UnsignedTx,
        chainId: ChainIdType
    ) {
        if (chainId === 'C') {
            return null
        }

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

    getCredentials<UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx | EVMUnsignedTx>(
        unsignedTx: UnsignedTx,
        paths: string[],
        sigMap: any,
        chainId: ChainIdType
    ): Credential[] {
        let creds: Credential[] = []
        let tx = unsignedTx.getTransaction()
        let txType = tx.getTxType()

        // @ts-ignore
        let ins = tx.getIns ? tx.getIns() : []
        let operations: TransferableOperation[] = []
        let evmInputs: EVMInput[] = []

        let items = ins
        if (
            (txType === AVMConstants.IMPORTTX && chainId === 'X') ||
            (txType === PlatformVMConstants.IMPORTTX && chainId === 'P') ||
            (txType === EVMConstants.IMPORTTX && chainId === 'C')
        ) {
            items = (tx as ImportTx).getImportInputs()
        }

        // Try to get operations, it will fail if there are none, ignore and continue
        try {
            operations = (tx as OperationTx).getOperations()
        } catch (e) {
            console.log(e)
        }

        // Try to get evm inputs, it will fail if there are none, ignore and continue
        try {
            evmInputs = (tx as EVMExportTx).getInputs()
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

        for (let i = 0; i < evmInputs.length; i++) {
            let evmInput = evmInputs[i]
            const sigidxs: SigIdx[] = evmInput.getSigIdxs()
            const cred: Credential = SelectCredentialClass(evmInput.getCredentialID())

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
        UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx | EVMUnsignedTx,
        SignedTx extends AVMTx | PlatformTx | EvmTx
    >(unsignedTx: UnsignedTx, paths: string[], chainId: ChainIdType): Promise<SignedTx> {
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

            let creds: Credential[] = this.getCredentials<UnsignedTx>(
                unsignedTx,
                paths,
                sigMap,
                chainId
            )

            let signedTx
            switch (chainId) {
                case 'X':
                    signedTx = new AVMTx(unsignedTx as AVMUnsignedTx, creds)
                    break
                case 'P':
                    signedTx = new PlatformTx(unsignedTx as PlatformUnsignedTx, creds)
                    break
                case 'C':
                    signedTx = new EvmTx(unsignedTx as EVMUnsignedTx, creds)
                    break
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
        UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx | EVMUnsignedTx,
        SignedTx extends AVMTx | PlatformTx | EvmTx
    >(unsignedTx: UnsignedTx, paths: string[], chainId: ChainIdType): Promise<SignedTx> {
        let tx = unsignedTx.getTransaction()
        let txType = tx.getTxType()
        let parseableTxs = {
            X: ParseableAvmTxEnum,
            P: ParseablePlatformEnum,
            C: ParseableEvmTxEnum,
        }[chainId]

        let title = `Sign ${parseableTxs[txType]}`

        let bip32Paths = this.pathsToUniqueBipPaths(paths)

        const accountPath =
            chainId === 'C'
                ? bippath.fromString(`${ETH_ACCOUNT_PATH}`)
                : bippath.fromString(`${AVA_ACCOUNT_PATH}`)
        let txbuff = unsignedTx.toBuffer()
        let changePath = this.getChangeBipPath(unsignedTx, chainId)
        let messages = this.getTransactionMessages<UnsignedTx>(unsignedTx, chainId, changePath)

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
            let creds = this.getCredentials<UnsignedTx>(unsignedTx, paths, sigMap, chainId)

            let signedTx
            switch (chainId) {
                case 'X':
                    signedTx = new AVMTx(unsignedTx as AVMUnsignedTx, creds)
                    break
                case 'P':
                    signedTx = new PlatformTx(unsignedTx as PlatformUnsignedTx, creds)
                    break
                case 'C':
                    signedTx = new EvmTx(unsignedTx as EVMUnsignedTx, creds)
                    break
            }

            return signedTx as SignedTx
        } catch (e) {
            store.commit('Ledger/closeModal')
            console.log(e)
            throw e
        }
    }

    getOutputMsgs<UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx | EVMUnsignedTx>(
        unsignedTx: UnsignedTx,
        chainId: ChainIdType,
        changePath: null | { toPathArray: () => number[] }
    ): ILedgerBlockMessage[] {
        let messages: ILedgerBlockMessage[] = []
        let hrp = getPreferredHRP(ava.getNetworkID())
        let tx = unsignedTx.getTransaction()
        let txType = tx.getTxType()

        // @ts-ignore
        let outs
        if (
            (txType === AVMConstants.EXPORTTX && chainId === 'X') ||
            (txType === PlatformVMConstants.EXPORTTX && chainId === 'P')
        ) {
            outs = (tx as ExportTx).getExportOutputs()
        } else if (txType === EVMConstants.EXPORTTX && chainId === 'C') {
            outs = (tx as EVMExportTx).getExportedOutputs()
        } else {
            outs = (tx as ExportTx).getOuts()
        }

        let destinationChain = chainId
        if (chainId === 'C' && txType === EVMConstants.EXPORTTX) destinationChain = 'X'

        if (destinationChain === 'C') {
            for (let i = 0; i < outs.length; i++) {
                // @ts-ignore
                const value = outs[i].getAddress()
                const addr = bintools.addressToString(hrp, chainId, value)
                // @ts-ignore
                const amt = bnToBig(outs[i].getAmount(), 9)

                messages.push({
                    title: 'Output',
                    value: `${addr} - ${amt.toString()} AVAX`,
                })
            }
        } else {
            let changeIdx = changePath?.toPathArray()[changePath?.toPathArray().length - 1]
            let changeAddr = this.getChangeFromIndex(changeIdx, destinationChain)

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
        }

        return messages
    }

    getValidateDelegateMsgs<UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx>(
        unsignedTx: UnsignedTx,
        chainId: ChainIdType
    ): ILedgerBlockMessage[] {
        let tx = (unsignedTx as AVMUnsignedTx | PlatformUnsignedTx).getTransaction()
        let txType = tx.getTxType()
        let messages: ILedgerBlockMessage[] = []

        if (
            (txType === PlatformVMConstants.ADDDELEGATORTX && chainId === 'P') ||
            (txType === PlatformVMConstants.ADDVALIDATORTX && chainId === 'P')
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

        return messages
    }

    getFeeMsgs<UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx | EVMUnsignedTx>(
        unsignedTx: UnsignedTx,
        chainId: ChainIdType
    ): ILedgerBlockMessage[] {
        let tx = unsignedTx.getTransaction()
        let txType = tx.getTxType()
        let messages = []

        if (
            (txType === AVMConstants.BASETX && chainId === 'X') ||
            (txType === AVMConstants.EXPORTTX && chainId === 'X') ||
            (txType === AVMConstants.IMPORTTX && chainId === 'X') ||
            (txType === PlatformVMConstants.EXPORTTX && chainId === 'P') ||
            (txType === PlatformVMConstants.IMPORTTX && chainId === 'P') ||
            (txType === EVMConstants.EXPORTTX && chainId === 'C')
        ) {
            messages.push({ title: 'Fee', value: `${0.001} AVAX` })
        } else if (txType === EVMConstants.IMPORTTX && (chainId as ChainIdType) === 'C') {
            messages.push({ title: 'Fee', value: `0 AVAX` })
        }

        return messages
    }

    // Given the unsigned transaction returns an array of messages that will be displayed on ledgegr window
    getTransactionMessages<UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx | EVMUnsignedTx>(
        unsignedTx: UnsignedTx,
        chainId: ChainIdType,
        changePath: null | { toPathArray: () => number[] }
    ): ILedgerBlockMessage[] {
        let messages: ILedgerBlockMessage[] = []

        const outputMessages = this.getOutputMsgs(unsignedTx, chainId, changePath)
        messages.push(...outputMessages)

        const validateDelegateMessages = this.getValidateDelegateMsgs(
            unsignedTx as AVMUnsignedTx | PlatformUnsignedTx,
            chainId
        )
        messages.push(...validateDelegateMessages)

        const feeMessages = this.getFeeMsgs(unsignedTx, chainId)
        messages.push(...feeMessages)

        return messages
    }

    // need to add destination chain param to know if it's C Chain because obsidian
    // app does not support x => c and p => c parsing txs
    async sign<
        UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx,
        SignedTx extends AVMTx | PlatformTx
    >(unsignedTx: UnsignedTx, isAVM: boolean = true): Promise<SignedTx> {
        // Check if transaction can be parsed by ledger
        let tx = unsignedTx.getTransaction()
        let txType = tx.getTxType()
        let chainId: ChainIdType = isAVM ? 'X' : 'P'

        let parseableTxs = chainId === 'X' ? ParseableAvmTxEnum : ParseablePlatformEnum

        let { paths, isAvaxOnly } = this.getTransactionPaths<UnsignedTx>(unsignedTx, chainId)
        // If ledger doesnt support parsing, sign hash
        let canLedgerParse = this.config.version >= '0.3.1'
        let isParsableType = txType in parseableTxs && isAvaxOnly

        let signedTx
        if (canLedgerParse && isParsableType) {
            signedTx = await this.signTransactionParsable<UnsignedTx, SignedTx>(
                unsignedTx,
                paths,
                chainId
            )
        } else {
            signedTx = await this.signTransactionHash<UnsignedTx, SignedTx>(
                unsignedTx,
                paths,
                chainId
            )
        }

        store.commit('Ledger/closeModal')

        return signedTx
    }

    getEvmAddress(): string {
        return this.ethAddress
    }

    async getEthBalance() {
        if (this.ethAddress) {
            let bal = await web3.eth.getBalance(this.ethAddress)
            this.ethBalance = new BN(bal)
        } else {
            console.error('Not implemented')
            this.ethBalance = new BN(0)
        }

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
        } else if (address[0] === 'C') {
            return '0/0'
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

    async chainTransfer(
        amt: BN,
        sourceChain: string = 'X',
        destinationChain: ChainIdType
    ): Promise<string> {
        let fee = avm.getTxFee()
        let amtFee = amt.add(fee)

        if (destinationChain === 'C') {
            // C Chain imports/exports do not have a fee
            amtFee = amt
        }
        // EXPORT
        let xId = avm.getBlockchainID()

        if (sourceChain === 'X') {
            let destinationAddr
            if (destinationChain === 'P') {
                destinationAddr = this.getCurrentPlatformAddress()
            } else {
                destinationAddr = this.ethAddressBech
            }
            let fromAddresses = this.getAllAddressesX()
            let changeAddress = this.getChangeAddress()
            let exportTx = await buildExportTransaction(
                sourceChain,
                destinationChain,
                this.utxoset,
                fromAddresses,
                destinationAddr,
                amtFee,
                changeAddress
            )
            let tx = await this.sign<AVMUnsignedTx, AVMTx>(exportTx as AVMUnsignedTx)
            return avm.issueTx(tx)
        } else if (sourceChain === 'P') {
            let utxoSet = this.platformHelper.utxoSet as PlatformUTXOSet
            let destinationAddr = this.externalHelper.getCurrentAddress()

            let pChangeAddr = this.platformHelper.getCurrentAddress()
            let fromAddrs = this.platformHelper.getAllDerivedAddresses()

            let exportTx = await pChain.buildExportTx(
                utxoSet,
                amtFee,
                xId,
                [destinationAddr],
                fromAddrs,
                [pChangeAddr]
            )

            let tx = await this.sign<PlatformUnsignedTx, PlatformTx>(exportTx, false)
            return pChain.issueTx(tx)
        } else if (sourceChain === 'C') {
            let destinationAddr = this.getCurrentAddress()
            let fromAddresses = [this.ethAddress]
            let changeAddress = this.ethAddressBech
            let utxos = this.getPlatformUTXOSet()

            let exportTx = (await buildExportTransaction(
                sourceChain,
                destinationChain,
                utxos,
                fromAddresses,
                destinationAddr,
                amtFee,
                changeAddress,
                this.ethAddressBech
            )) as EVMUnsignedTx

            let tx = (await this.signTransactionParsable(exportTx, ['0/0'], 'C')) as EvmTx

            store.commit('Ledger/closeModal')

            return cChain.issueTx(tx)
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
        const utxoResponse: UTXOResponse = await cChain.getUTXOs(
            this.ethAddressBech,
            avm.getBlockchainID()
        )
        const utxoSet: EVMUTXOSet = utxoResponse.utxos

        if (utxoSet.getAllUTXOs().length === 0) {
            throw new Error('Nothing to import.')
        }

        let ownerAddresses = [this.ethAddressBech]
        let fromAddresses = ownerAddresses
        let sourceChain = avm.getBlockchainID()

        let toAddress = '0x' + this.ethAddress

        const unsignedTx = await cChain.buildImportTx(
            utxoSet,
            toAddress,
            ownerAddresses,
            sourceChain,
            fromAddresses
        )

        let tx = (await this.signTransactionParsable(
            unsignedTx,
            Array(utxoSet.getAllUTXOs().length).fill('0/0'),
            'C'
        )) as EvmTx

        store.commit('Ledger/closeModal')

        return cChain.issueTx(tx)
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
    async sendEth(to: string, amount: BN, gasPrice: BN, gasLimit: number, txParams?: any) {
        const nonce = await web3.eth.getTransactionCount(this.ethAddress)
        const chainId = await web3.eth.getChainId()
        const networkId = await web3.eth.net.getId()
        const chainParams = {
            common: EthereumjsCommon.forCustomChain('mainnet', { networkId, chainId }, 'istanbul'),
        }
        const partialTxParams = txParams || {
            to,
            nonce: toHex(nonce),
            gasPrice: toHex(gasPrice),
            gasLimit: toHex(gasLimit),
            value: toHex(amount),
        }

        const unsignedTx = Transaction.fromTxData({ ...partialTxParams }, chainParams)

        const rawUnsignedTx = rlp.encode([
            bnToRlp(unsignedTx.nonce),
            bnToRlp(unsignedTx.gasPrice),
            bnToRlp(unsignedTx.gasLimit),
            unsignedTx.to !== undefined ? unsignedTx.to.buf : Buffer.from([]),
            bnToRlp(unsignedTx.value),
            unsignedTx.data,
            bnToRlp(new BN(chainId)),
            Buffer.from([]),
            Buffer.from([]),
        ])

        // Ledger cannot parse amounts greater than 2^64
        // 2^64 = 1.8446744e+19
        // nAVAX is denominated in GWEI so obsidian adds 9 decimals
        // 20 AVAX = 20000000000 GWEI = 20000000000000000000 WEI
        // Remove when this constraint is fixed
        const MAX = '18446744000000000000'

        let signature = {} as { v: string; r: string; s: string }
        if (unsignedTx.value.gte(new BN(MAX))) {
            // let bip32Paths = this.pathsToUniqueBipPaths(['0/0'])
            // const accountPath = bippath.fromString(`${ETH_ACCOUNT_PATH}`)
            // const sigMap = await this.app.signHash(accountPath, bip32Paths, unsignedTx.hash())
            // const response = sigMap.get('0/0')
            // signature.v = '150f5'
            // signature.r = response.slice(1, 1 + 32).toString('hex')
            // signature.s = response.slice(1 + 32, 1 + 32 + 32).toString('hex')
            throw 'Amount too big. Must be less than 18 AVAX.'
        } else {
            signature = await this.ethApp.signTransaction(LEDGER_ETH_ACCOUNT_PATH, rawUnsignedTx)
        }

        const signatureBN = {
            v: new BN(signature.v, 16),
            r: new BN(signature.r, 16),
            s: new BN(signature.s, 16),
        }
        const signedTx = Transaction.fromTxData({ ...partialTxParams, ...signatureBN }, chainParams)
        let err,
            receipt = await web3.eth.sendSignedTransaction(
                '0x' + signedTx.serialize().toString('hex')
            )

        if (err) {
            console.error(err)
            throw err
        }

        return receipt.transactionHash
    }

    // TODO: Move to shared file
    async estimateGas(to: string, amount: BN, token: Erc20Token): Promise<number> {
        let from = '0x' + this.ethAddress
        let tx = token.createTransferTx(to, amount)
        let estGas = await tx.estimateGas({
            from: from,
        })
        // Return 10% more
        return Math.round(estGas * 1.1)
    }

    async sendERC20(
        to: string,
        amount: BN,
        gasPrice: BN,
        gasLimit: number,
        token: Erc20Token
    ): Promise<string> {
        const tx = token.createTransferTx(to, amount)
        let from = '0x' + this.ethAddress

        const nonce = await web3.eth.getTransactionCount(this.ethAddress)

        const partialTxParams = {
            to: token.data.address,
            from,
            nonce: toHex(nonce),
            gasPrice: toHex(gasPrice),
            gasLimit: toHex(gasLimit),
            value: toHex(0),
            data: tx.encodeABI(),
        }

        return this.sendEth(token.data.address, amount, gasPrice, gasLimit, partialTxParams)
    }
}

export { LedgerWallet }
