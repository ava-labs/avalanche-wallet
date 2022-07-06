// import AppBtc from "@ledgerhq/hw-app-btc";
//@ts-ignore
import AppAvax from '@obsidiansystems/hw-app-avalanche'
//@ts-ignore
import Eth from '@ledgerhq/hw-app-eth'

import EthereumjsCommon from '@ethereumjs/common'
import { Transaction } from '@ethereumjs/tx'

import moment from 'moment'
import { Buffer, BN } from '@c4tplatform/camino'
import HDKey from 'hdkey'
import { ava, bintools } from '@/AVA'
const bippath = require('bip32-path')
import createHash from 'create-hash'
import store from '@/store'
import { importPublic, publicToAddress, bnToRlp, rlp } from 'ethereumjs-util'

import { UTXO as AVMUTXO } from '@c4tplatform/camino/dist/apis/avm/utxos'
import { AvaWalletCore } from '@/js/wallets/types'
import { ITransaction } from '@/components/wallet/transfer/types'
import {
    AVMConstants,
    OperationTx,
    SelectCredentialClass as AVMSelectCredentialClass,
    TransferableOperation,
    Tx as AVMTx,
    UnsignedTx as AVMUnsignedTx,
    ImportTx as AVMImportTx,
} from '@c4tplatform/camino/dist/apis/avm'

import {
    ImportTx as PlatformImportTx,
    ExportTx as PlatformExportTx,
    Tx as PlatformTx,
    UTXO as PlatformUTXO,
    UnsignedTx as PlatformUnsignedTx,
    PlatformVMConstants,
    SelectCredentialClass as PlatformSelectCredentialClass,
    AddDelegatorTx,
    AddValidatorTx,
} from '@c4tplatform/camino/dist/apis/platformvm'

import {
    UnsignedTx as EVMUnsignedTx,
    ImportTx as EVMImportTx,
    ExportTx as EVMExportTx,
    Tx as EvmTx,
    EVMConstants,
    EVMInput,
    SelectCredentialClass as EVMSelectCredentialClass,
} from '@c4tplatform/camino/dist/apis/evm'

import { Credential, SigIdx, Signature } from '@c4tplatform/camino/dist/common'
import { PayloadBase } from '@c4tplatform/camino/dist/utils'
import { HdWalletCore } from '@/js/wallets/HdWalletCore'
import { ILedgerAppConfig } from '@/store/types'
import { WalletNameType } from '@/js/wallets/types'
import { bnToBig } from '@/helpers/helper'
import { abiDecoder, web3 } from '@/evm'
import { AVA_ACCOUNT_PATH, ETH_ACCOUNT_PATH, LEDGER_ETH_ACCOUNT_PATH } from './MnemonicWallet'
import { ChainIdType } from '@/constants'
import { ParseableAvmTxEnum, ParseablePlatformEnum, ParseableEvmTxEnum } from '../TxHelper'
import { ILedgerBlockMessage } from '../../store/modules/ledger/types'
import Erc20Token from '@/js/Erc20Token'
import { WalletHelper } from '@/helpers/wallet_helper'
import { idToChainAlias } from '@c4tplatform/camino-wallet-sdk'

export const MIN_EVM_SUPPORT_V = '0.5.3'

class LedgerWallet extends HdWalletCore implements AvaWalletCore {
    app: AppAvax
    ethApp: Eth
    type: WalletNameType

    ethAddress: string
    ethBalance: BN
    config: ILedgerAppConfig
    ethHdNode: HDKey
    nativeAssetSymbol: string

    constructor(app: AppAvax, hdkey: HDKey, config: ILedgerAppConfig, hdEth: HDKey, ethApp: Eth) {
        super(hdkey, hdEth)
        this.app = app
        this.ethApp = ethApp
        this.type = 'ledger'
        this.config = config
        this.ethHdNode = hdEth
        this.nativeAssetSymbol = ava.getPrimaryAssetAlias()

        if (hdEth) {
            const ethKey = hdEth
            const ethPublic = importPublic(ethKey.publicKey)
            this.ethAddress = publicToAddress(ethPublic).toString('hex')
            this.ethBalance = new BN(0)
        } else {
            this.ethAddress = ''
            this.ethBalance = new BN(0)
        }
    }

    static async fromApp(app: AppAvax, eth: Eth, config: ILedgerAppConfig) {
        let res = await app.getWalletExtendedPublicKey(AVA_ACCOUNT_PATH)

        let hd = new HDKey()
        hd.publicKey = res.public_key
        hd.chainCode = res.chain_code

        let ethRes = await eth.getAddress(LEDGER_ETH_ACCOUNT_PATH, true, true)
        let hdEth = new HDKey()
        // @ts-ignore
        hdEth.publicKey = Buffer.from(ethRes.publicKey, 'hex')
        // @ts-ignore
        hdEth.chainCode = Buffer.from(ethRes.chainCode, 'hex')

        return new LedgerWallet(app, hd, config, hdEth, eth)
    }

    // Returns an array of derivation paths that need to sign this transaction
    // Used with signTransactionHash and signTransactionParsable
    getTransactionPaths<UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx>(
        unsignedTx: UnsignedTx,
        chainId: ChainIdType
    ): { paths: string[]; isAvaxOnly: boolean } {
        // TODO: This is a nasty fix. Remove when AJS is updated.
        unsignedTx.toBuffer()
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
            items = ((tx as AVMImportTx) || PlatformImportTx).getImportInputs()
        }

        let hrp = ava.getHRP()
        let paths: string[] = []

        let isAvaxOnly = true

        // Collect derivation paths for source addresses
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
            items = ((tx as AVMImportTx) || PlatformImportTx || EVMImportTx).getImportInputs()
        }

        // Try to get operations, it will fail if there are none, ignore and continue
        try {
            operations = (tx as OperationTx).getOperations()
        } catch (e) {
            console.error(e)
        }

        let CredentialClass
        if (chainId === 'X') {
            CredentialClass = AVMSelectCredentialClass
        } else if (chainId === 'P') {
            CredentialClass = PlatformSelectCredentialClass
        } else {
            CredentialClass = EVMSelectCredentialClass
        }

        // Try to get evm inputs, it will fail if there are none, ignore and continue
        try {
            evmInputs = (tx as EVMExportTx).getInputs()
        } catch (e) {
            console.error(e)
        }

        for (let i = 0; i < items.length; i++) {
            const sigidxs: SigIdx[] = items[i].getInput().getSigIdxs()
            const cred: Credential = CredentialClass(items[i].getInput().getCredentialID())

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
            const cred: Credential = CredentialClass(op.getCredentialID())

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
            const cred: Credential = CredentialClass(evmInput.getCredentialID())

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
            const accountPathSource = chainId === 'C' ? ETH_ACCOUNT_PATH : AVA_ACCOUNT_PATH
            const accountPath = bippath.fromString(`${accountPathSource}`)
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
            console.error(e)
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
            console.error(e)
            throw e
        }
    }

    getOutputMsgs<UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx | EVMUnsignedTx>(
        unsignedTx: UnsignedTx,
        chainId: ChainIdType,
        changePath: null | { toPathArray: () => number[] }
    ): ILedgerBlockMessage[] {
        let messages: ILedgerBlockMessage[] = []
        let hrp = ava.getHRP()
        let tx = unsignedTx.getTransaction()
        let txType = tx.getTxType()

        // @ts-ignore
        let outs
        if (
            (txType === AVMConstants.EXPORTTX && chainId === 'X') ||
            (txType === PlatformVMConstants.EXPORTTX && chainId === 'P')
        ) {
            outs = (tx as PlatformExportTx).getExportOutputs()
        } else if (txType === EVMConstants.EXPORTTX && chainId === 'C') {
            outs = (tx as EVMExportTx).getExportedOutputs()
        } else {
            outs = (tx as PlatformExportTx).getOuts()
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
                    value: `${addr} - ${amt.toString()} ${this.nativeAssetSymbol}`,
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
                                value: `${addr} - ${amt.toString()} ${this.nativeAssetSymbol}`,
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
        let tx =
            ((unsignedTx as
                | AVMUnsignedTx
                | PlatformUnsignedTx).getTransaction() as AddValidatorTx) || AddDelegatorTx
        let txType = tx.getTxType()
        let messages: ILedgerBlockMessage[] = []

        if (
            (txType === PlatformVMConstants.ADDDELEGATORTX && chainId === 'P') ||
            (txType === PlatformVMConstants.ADDVALIDATORTX && chainId === 'P')
        ) {
            const format = 'YYYY-MM-DD H:mm:ss UTC'

            const nodeID = bintools.cb58Encode(tx.getNodeID())
            const startTime = moment(tx.getStartTime().toNumber() * 1000)
                .utc()
                .format(format)

            const endTime = moment(tx.getEndTime().toNumber() * 1000)
                .utc()
                .format(format)

            const stakeAmt = bnToBig(tx.getStakeAmount(), 9)

            const rewardOwners = tx.getRewardOwners()
            let hrp = ava.getHRP()
            const rewardAddrs = rewardOwners
                .getOutput()
                .getAddresses()
                .map((addr) => {
                    return bintools.addressToString(hrp, chainId, addr)
                })

            messages.push({ title: 'NodeID', value: nodeID })
            messages.push({ title: 'Start Time', value: startTime })
            messages.push({ title: 'End Time', value: endTime })
            messages.push({ title: 'Total Stake', value: `${stakeAmt} ${this.nativeAssetSymbol}` })
            messages.push({
                title: 'Stake',
                value: `${stakeAmt} to ${this.platformHelper.getCurrentAddress()}`,
            })
            messages.push({
                title: 'Reward to',
                value: `${rewardAddrs.join('\n')}`,
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
            (txType === EVMConstants.EXPORTTX && chainId === 'C') ||
            (txType === EVMConstants.IMPORTTX && chainId === 'C')
        ) {
            messages.push({ title: 'Fee', value: `${0.001} ${this.nativeAssetSymbol}` })
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

    getEvmTransactionMessages(tx: Transaction): ILedgerBlockMessage[] {
        let gasPrice = tx.gasPrice
        let gasLimit = tx.gasLimit
        let totFee = gasPrice.mul(new BN(gasLimit.toString()))
        let feeNano = bnToBig(new BN(totFee.toString()), 9)

        let msgs: ILedgerBlockMessage[] = []
        try {
            let test = '0x' + tx.data.toString('hex')
            let data = abiDecoder.decodeMethod(test)

            let callMsg: ILedgerBlockMessage = {
                title: 'Contract Call',
                value: data.name,
            }
            let paramMsgs: ILedgerBlockMessage[] = data.params.map((param: any) => {
                return {
                    title: param.name,
                    value: param.value,
                }
            })

            let feeMsg: ILedgerBlockMessage = {
                title: 'Fee',
                value: feeNano.toLocaleString() + ` n${this.nativeAssetSymbol}`,
            }

            msgs = [callMsg, ...paramMsgs, feeMsg]
        } catch (e) {
            console.log(e)
        }
        return msgs
    }

    async signX(unsignedTx: AVMUnsignedTx): Promise<AVMTx> {
        let tx = unsignedTx.getTransaction()
        let txType = tx.getTxType()
        let chainId: ChainIdType = 'X'

        let parseableTxs = ParseableAvmTxEnum
        let { paths, isAvaxOnly } = this.getTransactionPaths<AVMUnsignedTx>(unsignedTx, chainId)

        // If ledger doesnt support parsing, sign hash
        let canLedgerParse = this.config.version >= '0.3.1'
        let isParsableType = txType in parseableTxs && isAvaxOnly

        let signedTx
        if (canLedgerParse && isParsableType) {
            signedTx = await this.signTransactionParsable<AVMUnsignedTx, AVMTx>(
                unsignedTx,
                paths,
                chainId
            )
        } else {
            signedTx = await this.signTransactionHash<AVMUnsignedTx, AVMTx>(
                unsignedTx,
                paths,
                chainId
            )
        }

        store.commit('Ledger/closeModal')
        return signedTx
    }

    async signP(unsignedTx: PlatformUnsignedTx): Promise<PlatformTx> {
        let tx = unsignedTx.getTransaction()
        let txType = tx.getTxType()
        let chainId: ChainIdType = 'P'
        let parseableTxs = ParseablePlatformEnum

        let { paths, isAvaxOnly } = this.getTransactionPaths<PlatformUnsignedTx>(
            unsignedTx,
            chainId
        )
        // If ledger doesnt support parsing, sign hash
        let canLedgerParse = this.config.version >= '0.3.1'
        let isParsableType = txType in parseableTxs && isAvaxOnly

        // TODO: Remove after ledger is fixed
        // If UTXOS contain lockedStakeable funds always use sign hash
        let txIns = unsignedTx.getTransaction().getIns()
        for (var i = 0; i < txIns.length; i++) {
            let typeID = txIns[i].getInput().getTypeID()
            if (typeID === PlatformVMConstants.STAKEABLELOCKINID) {
                canLedgerParse = false
                break
            }
        }

        // TODO: Remove after ledger update
        // Ledger is not able to parse P/C atomic transactions
        if (txType === PlatformVMConstants.EXPORTTX) {
            const destChainBuff = (tx as PlatformExportTx).getDestinationChain()
            // If destination chain is C chain, sign hash
            const destChain = idToChainAlias(bintools.cb58Encode(destChainBuff))
            if (destChain === 'C') {
                canLedgerParse = false
            }
        }
        // TODO: Remove after ledger update
        if (txType === PlatformVMConstants.IMPORTTX) {
            const sourceChainBuff = (tx as PlatformImportTx).getSourceChain()
            // If destination chain is C chain, sign hash
            const sourceChain = idToChainAlias(bintools.cb58Encode(sourceChainBuff))
            if (sourceChain === 'C') {
                canLedgerParse = false
            }
        }

        let signedTx
        if (canLedgerParse && isParsableType) {
            signedTx = await this.signTransactionParsable<PlatformUnsignedTx, PlatformTx>(
                unsignedTx,
                paths,
                chainId
            )
        } else {
            signedTx = await this.signTransactionHash<PlatformUnsignedTx, PlatformTx>(
                unsignedTx,
                paths,
                chainId
            )
        }
        store.commit('Ledger/closeModal')
        return signedTx
    }

    async signC(unsignedTx: EVMUnsignedTx): Promise<EvmTx> {
        // TODO: Might need to upgrade paths array to:
        //  paths = Array(utxoSet.getAllUTXOs().length).fill('0/0'),
        let tx = unsignedTx.getTransaction()
        let typeId = tx.getTxType()

        let canLedgerParse = true

        let paths = ['0/0']
        if (typeId === EVMConstants.EXPORTTX) {
            let ins = (tx as EVMExportTx).getInputs()
            paths = ins.map((input) => '0/0')
        } else if (typeId === EVMConstants.IMPORTTX) {
            let ins = (tx as EVMImportTx).getImportInputs()
            paths = ins.map((input) => '0/0')
        }

        // TODO: Remove after ledger update
        // Ledger is not able to parse P/C atomic transactions
        if (typeId === EVMConstants.EXPORTTX) {
            const destChainBuff = (tx as EVMExportTx).getDestinationChain()
            // If destination chain is C chain, sign hash
            const destChain = idToChainAlias(bintools.cb58Encode(destChainBuff))
            if (destChain === 'P') {
                canLedgerParse = false
            }
        }
        // TODO: Remove after ledger update
        if (typeId === EVMConstants.IMPORTTX) {
            const sourceChainBuff = (tx as EVMImportTx).getSourceChain()
            // If destination chain is C chain, sign hash
            const sourceChain = idToChainAlias(bintools.cb58Encode(sourceChainBuff))
            if (sourceChain === 'P') {
                canLedgerParse = false
            }
        }

        let txSigned
        if (canLedgerParse) {
            txSigned = (await this.signTransactionParsable(unsignedTx, paths, 'C')) as EvmTx
        } else {
            txSigned = (await this.signTransactionHash(unsignedTx, paths, 'C')) as EvmTx
        }
        store.commit('Ledger/closeModal')
        return txSigned
    }

    async signEvm(tx: Transaction) {
        const rawUnsignedTx = rlp.encode([
            bnToRlp(tx.nonce),
            bnToRlp(tx.gasPrice),
            bnToRlp(tx.gasLimit),
            tx.to !== undefined ? tx.to.buf : Buffer.from([]),
            bnToRlp(tx.value),
            tx.data,
            bnToRlp(new BN(tx.getChainId())),
            Buffer.from([]),
            Buffer.from([]),
        ])

        try {
            let msgs = this.getEvmTransactionMessages(tx)

            // Open Modal Prompt
            store.commit('Ledger/openModal', {
                title: 'Transfer',
                messages: msgs,
                info: null,
            })
            const signature = await this.ethApp.signTransaction(
                LEDGER_ETH_ACCOUNT_PATH,
                rawUnsignedTx.toString('hex')
            )
            store.commit('Ledger/closeModal')

            const signatureBN = {
                v: new BN(signature.v, 16),
                r: new BN(signature.r, 16),
                s: new BN(signature.s, 16),
            }

            const chainId = await web3.eth.getChainId()
            const networkId = await web3.eth.net.getId()
            const chainParams = {
                common: EthereumjsCommon.forCustomChain(
                    'mainnet',
                    { networkId, chainId },
                    'istanbul'
                ),
            }

            const signedTx = Transaction.fromTxData(
                {
                    nonce: tx.nonce,
                    gasPrice: tx.gasPrice,
                    gasLimit: tx.gasLimit,
                    to: tx.to,
                    value: tx.value,
                    data: tx.data,
                    ...signatureBN,
                },
                chainParams
            )
            return signedTx
        } catch (e) {
            store.commit('Ledger/closeModal')
            console.error(e)
            throw e
        }
    }

    getEvmAddress(): string {
        return this.ethAddress
    }

    async getStake(): Promise<BN> {
        this.stakeAmount = await WalletHelper.getStake(this)
        return this.stakeAmount
    }

    async getEthBalance() {
        let bal = await WalletHelper.getEthBalance(this)
        this.ethBalance = bal
        return bal
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
            return
        }

        super.getUTXOs()
        this.getStake()
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
        orders: (ITransaction | AVMUTXO)[],
        addr: string,
        memo: Buffer | undefined
    ): Promise<string> {
        return await WalletHelper.issueBatchTx(this, orders, addr, memo)
    }

    async delegate(
        nodeID: string,
        amt: BN,
        start: Date,
        end: Date,
        rewardAddress?: string,
        utxos?: PlatformUTXO[]
    ): Promise<string> {
        return await WalletHelper.delegate(this, nodeID, amt, start, end, rewardAddress, utxos)
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
        return await WalletHelper.validate(
            this,
            nodeID,
            amt,
            start,
            end,
            delegationFee,
            rewardAddress,
            utxos
        )
    }

    async signHashByExternalIndex(index: number, hash: Buffer) {
        let pathStr = `0/${index}`
        const addressPath = bippath.fromString(pathStr, false)
        const accountPath = bippath.fromString(`${AVA_ACCOUNT_PATH}`)

        store.commit('Ledger/openModal', {
            title: `Sign Hash`,
            info: hash.toString('hex').toUpperCase(),
        })

        try {
            let sigMap = await this.app.signHash(accountPath, [addressPath], hash)
            store.commit('Ledger/closeModal')
            let signed = sigMap.get(pathStr)
            return bintools.cb58Encode(signed)
        } catch (e) {
            store.commit('Ledger/closeModal')
            throw e
        }
    }

    async createNftFamily(name: string, symbol: string, groupNum: number) {
        return await WalletHelper.createNftFamily(this, name, symbol, groupNum)
    }

    async mintNft(mintUtxo: AVMUTXO, payload: PayloadBase, quantity: number) {
        return await WalletHelper.mintNft(this, mintUtxo, payload, quantity)
    }

    async sendEth(to: string, amount: BN, gasPrice: BN, gasLimit: number) {
        return await WalletHelper.sendEth(this, to, amount, gasPrice, gasLimit)
    }

    async estimateGas(to: string, amount: BN, token: Erc20Token): Promise<number> {
        return await WalletHelper.estimateGas(this, to, amount, token)
    }

    async sendERC20(
        to: string,
        amount: BN,
        gasPrice: BN,
        gasLimit: number,
        token: Erc20Token
    ): Promise<string> {
        // throw 'Not Implemented'
        return await WalletHelper.sendErc20(this, to, amount, gasPrice, gasLimit, token)
    }
}

export { LedgerWallet }
