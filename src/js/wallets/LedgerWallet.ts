// import AppBtc from "@ledgerhq/hw-app-btc";
//@ts-ignore
import AppAvax from '@obsidiansystems/hw-app-avalanche'
//@ts-ignore
import Eth from '@ledgerhq/hw-app-eth'

import EthereumjsCommon from '@ethereumjs/common'
import { Transaction } from '@ethereumjs/tx'

import Transport from '@ledgerhq/hw-transport'
import moment from 'moment'
import { Buffer as BufferAvax, BN } from 'avalanche'
import HDKey from 'hdkey'
import { ava, bintools } from '@/AVA'
//@ts-ignore
import bippath from 'bip32-path'
import createHash from 'create-hash'
import store from '@/store'
import { importPublic, publicToAddress, bnToRlp, rlp } from 'ethereumjs-util'
import { UTXO as AVMUTXO } from 'avalanche/dist/apis/avm/utxos'
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
} from 'avalanche/dist/apis/avm'

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
} from 'avalanche/dist/apis/platformvm'

import {
    UnsignedTx as EVMUnsignedTx,
    ImportTx as EVMImportTx,
    ExportTx as EVMExportTx,
    Tx as EvmTx,
    EVMConstants,
    EVMInput,
    SelectCredentialClass as EVMSelectCredentialClass,
} from 'avalanche/dist/apis/evm'

import { Credential, SigIdx, Signature, UTXOResponse, Address } from 'avalanche/dist/common'
import { getPreferredHRP, PayloadBase } from 'avalanche/dist/utils'
import { AbstractHdWallet } from '@/js/wallets/AbstractHdWallet'
import { WalletNameType } from '@/js/wallets/types'
import { AbiParsed, decodeTxData } from '@/js/AbiDecoder'
import { web3 } from '@/evm'
import { AVA_ACCOUNT_PATH, ETH_ACCOUNT_PATH, LEDGER_ETH_ACCOUNT_PATH } from './MnemonicWallet'
import { ChainIdType } from '@/constants'
import { ParseableAvmTxEnum, ParseablePlatformEnum, ParseableEvmTxEnum } from '../TxHelper'
import { ILedgerBlockMessage } from '../../store/modules/ledger/types'
import Erc20Token from '@/js/Erc20Token'
import { WalletHelper } from '@/helpers/wallet_helper'
import {
    avalanche,
    bnToBig,
    chainIdFromAlias,
    getLedgerProvider,
    LedgerProvider,
} from '@avalabs/avalanche-wallet-sdk'
import { getTxOutputAddresses } from '@/utils/getAddressFromTx'

class LedgerWallet extends AbstractHdWallet implements AvaWalletCore {
    provider: LedgerProvider
    ethApp: Eth
    type: WalletNameType

    ethAddress: string
    version: string
    ethHdNode: HDKey

    constructor(
        provider: LedgerProvider,
        hdkey: HDKey,
        version: string,
        hdEth: HDKey,
        ethApp: Eth
    ) {
        super(hdkey, hdEth)
        this.provider = provider
        this.ethApp = ethApp
        this.type = 'ledger'
        this.version = version
        this.ethHdNode = hdEth

        if (hdEth) {
            const ethKey = hdEth
            const ethPublic = importPublic(ethKey.publicKey)
            this.ethAddress = publicToAddress(ethPublic).toString('hex')
        } else {
            this.ethAddress = ''
        }
    }

    getTransport() {
        return this.ethApp.transport
    }

    static async fromTransport(t: Transport) {
        const prov = await getLedgerProvider(t)
        const version = await prov.getVersion(t)

        const xpub = await prov.getXPUB(t, AVA_ACCOUNT_PATH)
        const hd = new HDKey()
        hd.publicKey = xpub.pubKey
        hd.chainCode = xpub.chainCode

        const eth = new Eth(t, 'w0w')
        const ethRes = await eth.getAddress(LEDGER_ETH_ACCOUNT_PATH, false, true)
        const hdEth = new HDKey()
        // @ts-ignore
        hdEth.publicKey = BufferAvax.from(ethRes.publicKey, 'hex')
        // @ts-ignore
        hdEth.chainCode = BufferAvax.from(ethRes.chainCode, 'hex')

        return new LedgerWallet(prov, hd, version, hdEth, eth)
    }

    // Returns an array of derivation paths that need to sign this transaction
    // Used with signTransactionHash and signTransactionParsable
    getTransactionPaths<UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx>(
        unsignedTx: UnsignedTx,
        chainId: ChainIdType
    ): { paths: string[]; isAvaxOnly: boolean } {
        // TODO: This is a nasty fix. Remove when AJS is updated.
        unsignedTx.toBuffer()
        const tx = unsignedTx.getTransaction()
        const txType = tx.getTxType()

        const ins = tx.getIns()
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

        const hrp = getPreferredHRP(ava.getNetworkID())
        const paths: string[] = []

        let isAvaxOnly = true

        // Collect derivation paths for source addresses
        for (let i = 0; i < items.length; i++) {
            const item = items[i]

            const assetId = bintools.cb58Encode(item.getAssetID())
            // @ts-ignore
            if (assetId !== store.state.Assets.AVA_ASSET_ID) {
                isAvaxOnly = false
            }

            const sigidxs: SigIdx[] = item.getInput().getSigIdxs()
            const sources = sigidxs.map((sigidx) => sigidx.getSource())
            const addrs: string[] = sources.map((source) => {
                return bintools.addressToString(hrp, chainId, source)
            })

            for (let j = 0; j < addrs.length; j++) {
                const srcAddr = addrs[j]
                const pathStr = this.getPathFromAddress(srcAddr) // returns change/index

                paths.push(pathStr)
            }
        }

        // Do the Same for operational inputs, if there are any...
        for (let i = 0; i < operations.length; i++) {
            const op = operations[i]
            const sigidxs: SigIdx[] = op.getOperation().getSigIdxs()
            const sources = sigidxs.map((sigidx) => sigidx.getSource())
            const addrs: string[] = sources.map((source) => {
                return bintools.addressToString(hrp, chainId, source)
            })

            for (let j = 0; j < addrs.length; j++) {
                const srcAddr = addrs[j]
                const pathStr = this.getPathFromAddress(srcAddr) // returns change/index

                paths.push(pathStr)
            }
        }

        return { paths, isAvaxOnly }
    }

    pathsToUniqueBipPaths(paths: string[]) {
        const uniquePaths = paths.filter((val: any, i: number) => {
            return paths.indexOf(val) === i
        })

        const bip32Paths = uniquePaths.map((path) => {
            return bippath.fromString(path, false)
        })

        return bip32Paths
    }

    /**
     * Given an array of addresses, get derivation paths of [change, index] for owned addresses
     * @param addresses
     */
    getAddressPaths(addresses: string[]): bippath.Bip32Path[] {
        const externalAddrs = this.externalHelper.getAllDerivedAddresses()
        const internalAddrs = this.internalHelper.getAllDerivedAddresses()
        const platformAddrs = this.platformHelper.getAllDerivedAddresses()

        const paths: Set<string> = new Set()

        addresses.forEach((address) => {
            const extIndex = externalAddrs.indexOf(address)
            const intIndex = internalAddrs.indexOf(address)
            const platformIndex = platformAddrs.indexOf(address)

            if (extIndex >= 0) {
                paths.add(`0/${extIndex}`)
            } else if (intIndex >= 0) {
                paths.add(`1/${intIndex}`)
            } else if (platformIndex >= 0) {
                paths.add(`0/${platformIndex}`)
            } else if (address[0] === 'C') {
                paths.add('0/0')
            }
        })
        return [...paths].map((path) => bippath.fromString(path))
    }

    getChangeBipPath<UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx | EVMUnsignedTx>(
        unsignedTx: UnsignedTx,
        chainId: ChainIdType
    ) {
        if (chainId === 'C') {
            return null
        }

        const tx = unsignedTx.getTransaction()
        const txType = tx.getTxType()

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
        sigMap: Map<string, Buffer>,
        chainId: ChainIdType
    ): Credential[] {
        const creds: Credential[] = []
        const tx = unsignedTx.getTransaction()
        const txType = tx.getTxType()

        // @ts-ignore
        const ins = tx.getIns ? tx.getIns() : []
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
                const pathIndex = i + j
                const pathStr = paths[pathIndex]

                const sigRaw = sigMap.get(pathStr)
                if (!sigRaw) throw new Error('Missing signature.')
                const sigBuff = BufferAvax.from(sigRaw)
                const sig: Signature = new Signature()
                sig.fromBuffer(sigBuff)
                cred.addSignature(sig)
            }
            creds.push(cred)
        }

        for (let i = 0; i < operations.length; i++) {
            const op = operations[i].getOperation()
            const sigidxs: SigIdx[] = op.getSigIdxs()
            const cred: Credential = CredentialClass(op.getCredentialID())

            for (let j = 0; j < sigidxs.length; j++) {
                const pathIndex = items.length + i + j
                const pathStr = paths[pathIndex]

                const sigRaw = sigMap.get(pathStr)
                if (!sigRaw) throw new Error('Missing signature.')
                const sigBuff = BufferAvax.from(sigRaw)
                const sig: Signature = new Signature()
                sig.fromBuffer(sigBuff)
                cred.addSignature(sig)
            }
            creds.push(cred)
        }

        for (let i = 0; i < evmInputs.length; i++) {
            const evmInput = evmInputs[i]
            const sigidxs: SigIdx[] = evmInput.getSigIdxs()
            const cred: Credential = CredentialClass(evmInput.getCredentialID())

            for (let j = 0; j < sigidxs.length; j++) {
                const pathIndex = items.length + i + j
                const pathStr = paths[pathIndex]

                const sigRaw = sigMap.get(pathStr)
                if (!sigRaw) throw new Error('Missing signature.')
                const sigBuff = BufferAvax.from(sigRaw)
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
        const txbuff = unsignedTx.toBuffer()
        const msg: BufferAvax = BufferAvax.from(createHash('sha256').update(txbuff).digest())

        try {
            store.commit('Ledger/openModal', {
                title: 'Sign Hash',
                warning:
                    'Ledger is unable display this transaction because it is too large. Try entering a lower amount.',
                messages: [],
                info: msg.toString('hex').toUpperCase(),
            })

            const bip32Paths = this.pathsToUniqueBipPaths(paths)

            // Sign the msg with ledger
            const accountPathSource = chainId === 'C' ? ETH_ACCOUNT_PATH : AVA_ACCOUNT_PATH
            const accountPath = bippath.fromString(`${accountPathSource}`)
            const sigMap = await this.provider.signHash(
                this.getTransport(),
                Buffer.from(msg),
                accountPath,
                bip32Paths
            )
            store.commit('Ledger/closeModal')

            const creds: Credential[] = this.getCredentials<UnsignedTx>(
                unsignedTx,
                paths,
                sigMap.signatures,
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
        const tx = unsignedTx.getTransaction()
        const txType = tx.getTxType()
        const parseableTxs = {
            X: ParseableAvmTxEnum,
            P: ParseablePlatformEnum,
            C: ParseableEvmTxEnum,
        }[chainId]

        const title = `Sign ${parseableTxs[txType]}`

        const bip32Paths = this.pathsToUniqueBipPaths(paths)

        const accountPath =
            chainId === 'C'
                ? bippath.fromString(`${ETH_ACCOUNT_PATH}`)
                : bippath.fromString(`${AVA_ACCOUNT_PATH}`)
        const txbuff = unsignedTx.toBuffer()

        const outputAddrs = getTxOutputAddresses<UnsignedTx>(unsignedTx)

        // Get their paths, for owned ones
        const changePaths = this.getAddressPaths(outputAddrs)

        const messages = this.getTransactionMessages<UnsignedTx>(
            unsignedTx,
            chainId,
            changePaths[0]
        )

        try {
            store.commit('Ledger/openModal', {
                title: title,
                messages: messages,
                info: null,
            })
            const ledgerSignedTx = await this.provider.signTx(
                this.getTransport(),
                Buffer.from(txbuff),
                accountPath,
                bip32Paths,
                changePaths
            )

            const sigMap = ledgerSignedTx.signatures
            const creds = this.getCredentials<UnsignedTx>(unsignedTx, paths, sigMap, chainId)

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
        changePath: null | bippath.Bip32Path
    ): ILedgerBlockMessage[] {
        const messages: ILedgerBlockMessage[] = []
        const hrp = getPreferredHRP(ava.getNetworkID())
        const tx = unsignedTx.getTransaction()
        const txType = tx.getTxType()

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
                    value: `${addr} - ${amt.toString()} AVAX`,
                })
            }
        } else {
            const changeIdx = changePath?.toPathArray()[changePath?.toPathArray().length - 1]
            const changeAddr = this.getChangeFromIndex(changeIdx, destinationChain)

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
        const tx =
            ((unsignedTx as
                | AVMUnsignedTx
                | PlatformUnsignedTx).getTransaction() as AddValidatorTx) || AddDelegatorTx
        const txType = tx.getTxType()
        const messages: ILedgerBlockMessage[] = []

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
            const hrp = ava.getHRP()
            const rewardAddrs = rewardOwners
                .getOutput()
                .getAddresses()
                .map((addr) => {
                    return bintools.addressToString(hrp, chainId, addr)
                })

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
        const tx = unsignedTx.getTransaction()
        const txType = tx.getTxType()
        const messages = []

        if (
            (txType === AVMConstants.BASETX && chainId === 'X') ||
            (txType === AVMConstants.EXPORTTX && chainId === 'X') ||
            (txType === AVMConstants.IMPORTTX && chainId === 'X') ||
            (txType === PlatformVMConstants.EXPORTTX && chainId === 'P') ||
            (txType === PlatformVMConstants.IMPORTTX && chainId === 'P') ||
            (txType === EVMConstants.EXPORTTX && chainId === 'C') ||
            (txType === EVMConstants.IMPORTTX && chainId === 'C')
        ) {
            messages.push({ title: 'Fee', value: `${0.001} AVAX` })
        }

        return messages
    }

    // Given the unsigned transaction returns an array of messages that will be displayed on ledgegr window
    getTransactionMessages<UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx | EVMUnsignedTx>(
        unsignedTx: UnsignedTx,
        chainId: ChainIdType,
        changePath: null | bippath.Bip32Path
    ): ILedgerBlockMessage[] {
        const messages: ILedgerBlockMessage[] = []

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
        const gasPrice = tx.gasPrice
        const gasLimit = tx.gasLimit
        const totFee = gasPrice.mul(gasLimit)
        const feeNano = bnToBig(new BN(totFee.toString()), 9)

        let msgs: ILedgerBlockMessage[] = []
        try {
            const txData = '0x' + tx.data.toString('hex')
            const data: AbiParsed = decodeTxData(txData, tx.value)

            const contractAddr: ILedgerBlockMessage = {
                title: 'Contract',
                value: tx.to ? tx.to.toString() : 'unknown',
            }
            const callMsg: ILedgerBlockMessage = {
                title: 'Method',
                value: data.name,
            }
            const paramMsgs: ILedgerBlockMessage[] = data.params.map((param: any) => {
                return {
                    title: param.name,
                    value: param.value,
                }
            })

            const feeMsg: ILedgerBlockMessage = {
                title: 'Fee',
                value: feeNano.toLocaleString() + ' nAVAX',
            }

            msgs = [contractAddr, callMsg, ...paramMsgs, feeMsg]
        } catch (e) {
            console.log(e)
        }
        return msgs
    }

    async signX(unsignedTx: AVMUnsignedTx): Promise<AVMTx> {
        const chainId: ChainIdType = 'X'
        const { paths } = this.getTransactionPaths<AVMUnsignedTx>(unsignedTx, chainId)

        // We dont know the number of change paths but can assume worst case and use number of signer paths
        const canSign = this.provider.canParseTx(
            unsignedTx.toBuffer().length,
            paths.length,
            paths.length
        )

        let signedTx
        if (canSign) {
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
        const chainId: ChainIdType = 'P'

        const { paths } = this.getTransactionPaths<PlatformUnsignedTx>(unsignedTx, chainId)

        // We dont know the number of change paths but can assume worst case and use number of signer paths
        const canSign = this.provider.canParseTx(
            unsignedTx.toBuffer().length,
            paths.length,
            paths.length
        )

        let signedTx
        if (canSign) {
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
        const tx = unsignedTx.getTransaction()
        const typeId = tx.getTxType()

        let paths = ['0/0']
        if (typeId === EVMConstants.EXPORTTX) {
            const ins = (tx as EVMExportTx).getInputs()
            paths = ins.map((input) => '0/0')
        } else if (typeId === EVMConstants.IMPORTTX) {
            const ins = (tx as EVMImportTx).getImportInputs()
            paths = ins.map((input) => '0/0')
        }

        const txSigned = (await this.signTransactionParsable(unsignedTx, paths, 'C')) as EvmTx
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
            const msgs = this.getEvmTransactionMessages(tx)

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

    async getUTXOs(): Promise<void> {
        // TODO: Move to shared file
        this.isFetchUtxos = true
        // If we are waiting for helpers to initialize delay the call
        const isInit =
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
        const externalAddrs = this.externalHelper.getExtendedAddresses()
        const internalAddrs = this.internalHelper.getExtendedAddresses()
        const platformAddrs = this.platformHelper.getExtendedAddresses()

        const extIndex = externalAddrs.indexOf(address)
        const intIndex = internalAddrs.indexOf(address)
        const platformIndex = platformAddrs.indexOf(address)

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
        memo: BufferAvax | undefined
    ): Promise<string> {
        return await WalletHelper.issueBatchTx(this, orders, addr, memo)
    }

    async signHashByExternalIndex(index: number, hash: BufferAvax) {
        const pathStr = `0/${index}`
        const addressPath = bippath.fromString(pathStr, false)
        const accountPath = bippath.fromString(`${AVA_ACCOUNT_PATH}`)

        store.commit('Ledger/openModal', {
            title: `Sign Hash`,
            info: hash.toString('hex').toUpperCase(),
        })

        try {
            const sigMap = await this.provider.signHash(
                this.getTransport(),
                Buffer.from(hash),
                accountPath,
                [addressPath]
            )
            store.commit('Ledger/closeModal')
            const signed = sigMap.signatures.get(pathStr)
            if (!signed) throw new Error('Unable to get signature fro the given path.')
            return bintools.cb58Encode(BufferAvax.from(signed))
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

    /**
     * Display the given address index on the device to prove ownership.
     */
    async verifyAddress(index: number, internal = false, chainAlias?: ChainIdType) {
        const hrp = avalanche.getHRP()
        const change = internal ? '1' : '0'
        const path = `${AVA_ACCOUNT_PATH}/${change}/${index}`
        const chainId = chainAlias ? chainIdFromAlias(chainAlias) : undefined
        return await this.provider.getAddress(this.getTransport(), bippath.fromString(path), {
            show: true,
            hrp: hrp,
            chainId: chainId,
        })
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
