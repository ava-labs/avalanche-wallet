import { ava, avm, bintools, cChain, pChain } from '@/AVA'
import { ITransaction } from '@/components/wallet/transfer/types'
import { digestMessage } from '@/helpers/helper'
import { WalletNameType } from '@/store/types'
import { Buffer as BufferAvalanche } from 'avalanche'
import {
    KeyPair as AVMKeyPair,
    KeyChain as AVMKeyChain,
    UTXOSet as AVMUTXOSet,
    UTXO,
    UnsignedTx,
} from 'avalanche/dist/apis/avm'
import {
    KeyPair as PlatformKeyPair,
    KeyChain as PlatformKeyChain,
    UTXOSet as PlatformUTXOSet,
    UTXOSet,
} from 'avalanche/dist/apis/platformvm'
import { KeyChain, KeyChain as EVMKeyChain, UTXOSet as EVMUTXOSet } from 'avalanche/dist/apis/evm'
// import { iEVMUTXOResponse } from 'avalanche/dist/apis/evm/interfaces'
import { StandardTx, StandardUnsignedTx } from 'avalanche/dist/common'
import { getPreferredHRP, PayloadBase } from 'avalanche/dist/utils'
import BN from 'bn.js'
import { buildUnsignedTransaction, buildCreateNftFamilyTx, buildMintNftTx } from '../TxHelper'
import {
    AvaWalletCore,
    AvmExportChainType,
    AvmImportChainType,
    ChainAlias,
    UnsafeWallet,
} from './IAvaHdWallet'
import { UTXO as PlatformUTXO } from 'avalanche/dist/apis/platformvm/utxos'
import { privateToAddress } from 'ethereumjs-util'
import { web3 } from '@/evm'
import Web3 from 'web3'

import { ChainIdType } from '@/constants'
import { Tx as AVMTx, UnsignedTx as AVMUnsignedTx } from 'avalanche/dist/apis/avm/tx'
import {
    Tx as PlatformTx,
    UnsignedTx as PlatformUnsignedTx,
} from 'avalanche/dist/apis/platformvm/tx'
import { Tx as EvmTx, UnsignedTx as EVMUnsignedTx } from 'avalanche/dist/apis/evm/tx'
import Erc20Token from '@/js/Erc20Token'
import { WalletCore } from '@/js/wallets/WalletCore'
import { avmGetAllUTXOs, platformGetAllUTXOs, WalletHelper } from '@/helpers/wallet_helper'
import { UTXO as AVMUTXO } from 'avalanche/dist/apis/avm/utxos'
import { KeyChain as PlatformVMKeyChain } from 'avalanche/dist/apis/platformvm/keychain'
import { Transaction } from '@ethereumjs/tx'

class SingletonWallet extends WalletCore implements AvaWalletCore, UnsafeWallet {
    keyChain: AVMKeyChain
    keyPair: AVMKeyPair

    platformKeyChain: PlatformKeyChain
    platformKeyPair: PlatformKeyPair

    chainId: string
    chainIdP: string

    key: string

    stakeAmount: BN

    type: WalletNameType

    ethKey: string
    ethKeyBech: string
    ethKeyChain: EVMKeyChain
    ethAddress: string
    ethAddressBech: string
    ethBalance: BN

    constructor(pk: string) {
        super()

        this.key = pk

        this.chainId = avm.getBlockchainAlias() || avm.getBlockchainID()
        this.chainIdP = pChain.getBlockchainAlias() || pChain.getBlockchainID()

        let hrp = ava.getHRP()

        this.keyChain = new AVMKeyChain(hrp, this.chainId)
        this.keyPair = this.keyChain.importKey(pk)

        this.platformKeyChain = new PlatformKeyChain(hrp, this.chainIdP)
        this.platformKeyPair = this.platformKeyChain.importKey(pk)

        this.stakeAmount = new BN(0)

        // Derive EVM key and address
        let pkBuf = bintools.cb58Decode(pk.split('-')[1])
        let pkHex = pkBuf.toString('hex')
        this.ethKey = pkHex
        // @ts-ignore
        this.ethAddress = privateToAddress(pkBuf).toString('hex')
        this.ethBalance = new BN(0)
        this.ethAddressBech = ''

        let cPrivKey = `PrivateKey-` + bintools.cb58Encode(BufferAvalanche.from(pkBuf))
        this.ethKeyBech = cPrivKey
        let cKeyChain = new KeyChain(ava.getHRP(), 'C')
        this.ethKeyChain = cKeyChain

        let cKeypair = cKeyChain.importKey(cPrivKey)
        this.ethAddressBech = cKeypair.getAddressString()

        this.type = 'singleton'
        this.isInit = true
    }

    // async chainTransfer(
    //     amt: BN,
    //     sourceChain: string,
    //     destinationChain: ChainIdType
    // ): Promise<string> {
    //     let fee = avm.getTxFee()
    //     let amtFee = amt.add(fee)
    //     if (destinationChain === 'C') {
    //         // C Chain imports/exports do not have a fee
    //         amtFee = amt
    //     }
    //     // EXPORT
    //     let pId = pChain.getBlockchainID()
    //     let xId = avm.getBlockchainID()
    //     let txId
    //     if (sourceChain === 'X') {
    //         let destinationAddr
    //         if (destinationChain === 'P') {
    //             destinationAddr = this.getCurrentAddressPlatform()
    //         } else {
    //             // C Chain
    //             // todo: replace with shared wallet class method
    //             destinationAddr = this.ethAddressBech
    //         }
    //
    //         let fromAddresses = this.getAllAddressesX()
    //         let changeAddress = this.getChangeAddressAvm()
    //         let utxos = this.getUTXOSet()
    //         let exportTx = (await buildExportTransaction(
    //             sourceChain,
    //             destinationChain,
    //             utxos,
    //             fromAddresses,
    //             destinationAddr,
    //             amtFee,
    //             changeAddress
    //         )) as AVMUnsignedTx
    //
    //         let tx = (await this.sign<AVMUnsignedTx, AVMTx>(exportTx)) as AVMTx
    //         return avm.issueTx(tx)
    //     } else if (sourceChain === 'P') {
    //         let destinationAddr = this.getCurrentAddressAvm()
    //         let fromAddresses = this.getAllAddressesP()
    //
    //         let changeAddress = this.getCurrentAddressPlatform()
    //         let utxos = this.getPlatformUTXOSet()
    //
    //         let exportTx = (await buildExportTransaction(
    //             sourceChain,
    //             destinationChain,
    //             utxos,
    //             fromAddresses,
    //             destinationAddr,
    //             amtFee,
    //             changeAddress
    //         )) as PlatformUnsignedTx
    //
    //         let tx = (await this.sign<PlatformUnsignedTx, PlatformTx>(
    //             exportTx,
    //             false
    //         )) as PlatformTx
    //
    //         return pChain.issueTx(tx)
    //     } else if (sourceChain === 'C') {
    //         let destinationAddr = this.getCurrentAddressAvm()
    //         let fromAddresses = [this.ethAddress]
    //         let changeAddress = this.ethAddressBech
    //         let utxos = this.getPlatformUTXOSet()
    //
    //         let exportTx = (await buildExportTransaction(
    //             sourceChain,
    //             destinationChain,
    //             utxos,
    //             fromAddresses,
    //             destinationAddr,
    //             amtFee,
    //             changeAddress,
    //             this.ethAddressBech
    //         )) as EVMUnsignedTx
    //
    //         let tx = await exportTx.sign(this.ethKeyChain)
    //         return cChain.issueTx(tx)
    //     } else {
    //         throw 'Invalid source chain.'
    //     }
    // }

    getChangeAddressAvm(): string {
        return this.getCurrentAddressAvm()
    }

    getCurrentAddressAvm(): string {
        return this.keyPair.getAddressString()
    }

    getChangeAddressPlatform(): string {
        return this.getCurrentAddressPlatform()
    }

    getDerivedAddresses(): string[] {
        let addr = this.getCurrentAddressAvm()
        return [addr]
    }

    getDerivedAddressesP() {
        return [this.getCurrentAddressPlatform()]
    }

    getAllDerivedExternalAddresses(): string[] {
        return this.getDerivedAddresses()
    }

    getExtendedPlatformAddresses(): string[] {
        let addr = this.platformKeyPair.getAddressString()
        return [addr]
    }

    getHistoryAddresses(): string[] {
        let addr = this.getCurrentAddressAvm()
        return [addr]
    }

    getPlatformRewardAddress(): string {
        return this.getCurrentAddressPlatform()
    }

    getCurrentAddressPlatform(): string {
        return this.platformKeyPair.getAddressString()
    }

    getBaseAddress(): string {
        return this.getCurrentAddressAvm()
    }

    async getStake(): Promise<BN> {
        this.stakeAmount = await WalletHelper.getStake(this)
        return this.stakeAmount
    }

    getUTXOSet(): AVMUTXOSet {
        return this.utxoset
    }

    getPlatformUTXOSet(): PlatformUTXOSet {
        return this.platformUtxoset
    }
    // TODO: Move to shared class
    getEvmAddress(): string {
        return this.ethAddress
    }

    // TODO: Move to shared class
    getEvmAddressBech(): string {
        return this.ethAddressBech
    }

    async getEthBalance() {
        let bal = await WalletHelper.getEthBalance(this)
        this.ethBalance = bal
        return bal
    }

    // TODO: Move to shared class
    // async getAtomicUTXOs(chainId: ChainAlias) {
    //     // console.log(addrs);
    //     if (chainId === 'P') {
    //         let result: PlatformUTXOSet = (
    //             await pChain.getUTXOs(this.getExtendedPlatformAddresses(), avm.getBlockchainID())
    //         ).utxos
    //         return result
    //     } else {
    //         let result: AVMUTXOSet = (
    //             await avm.getUTXOs(this.getDerivedAddresses(), pChain.getBlockchainID())
    //         ).utxos
    //
    //         let resultC: AVMUTXOSet = (
    //             await avm.getUTXOs(this.getDerivedAddresses(), cChain.getBlockchainID())
    //         ).utxos
    //
    //         return result.merge(resultC)
    //     }
    // }

    async updateUtxos(
        // TODO, type
        chainId: ChainAlias
    ): Promise<AVMUTXOSet | PlatformUTXOSet> {
        let result: AVMUTXOSet | PlatformUTXOSet

        if (chainId === 'X') {
            result = await avmGetAllUTXOs([this.getCurrentAddressAvm()])
            this.utxoset = result // we can use local copy of utxos as cache for some functions
        } else {
            result = await platformGetAllUTXOs([this.getCurrentAddressPlatform()])
            this.platformUtxoset = result
        }

        return result
    }

    async getUTXOs(): Promise<void> {
        this.isFetchUtxos = true
        let setInternal = (await this.updateUtxos('X')) as AVMUTXOSet
        // platform utxos are updated but not returned by function
        let setPlatform = (await this.updateUtxos('P')) as PlatformUTXOSet

        await this.getStake()
        await this.getEthBalance()

        this.isFetchUtxos = false

        return
    }

    // async platformGetAllUTXOsForAddresses(
    //     addrs: string[],
    //     endIndex: any = undefined
    // ): Promise<PlatformUTXOSet> {
    //     let response
    //     if (!endIndex) {
    //         response = await pChain.getUTXOs(addrs)
    //     } else {
    //         response = await pChain.getUTXOs(addrs, undefined, 0, endIndex)
    //     }
    //
    //     let utxoSet = response.utxos
    //     let nextEndIndex = response.endIndex
    //     let len = response.numFetched
    //
    //     if (len >= 1024) {
    //         let subUtxos = await this.platformGetAllUTXOsForAddresses(addrs, nextEndIndex)
    //         return utxoSet.merge(subUtxos)
    //     }
    //
    //     return utxoSet
    // }

    // async avmGetAllUTXOsForAddresses(
    //     addrs: string[],
    //     endIndex: any = undefined
    // ): Promise<AVMUTXOSet> {
    //     let response
    //     if (!endIndex) {
    //         response = await avm.getUTXOs(addrs)
    //     } else {
    //         response = await avm.getUTXOs(addrs, undefined, 0, endIndex)
    //     }
    //
    //     let utxoSet = response.utxos
    //     let utxos = utxoSet.getAllUTXOs()
    //     let nextEndIndex = response.endIndex
    //     let len = response.numFetched
    //
    //     if (len >= 1024) {
    //         let subUtxos = await this.avmGetAllUTXOsForAddresses(addrs, nextEndIndex)
    //         return utxoSet.merge(subUtxos)
    //     }
    //     return utxoSet
    // }

    async exportFromPChain(amt: BN) {
        return await WalletHelper.exportFromPChain(this, amt)
    }

    async exportFromXChain(amt: BN, destinationChain: AvmExportChainType) {
        return await WalletHelper.exportFromXChain(this, amt, destinationChain)
    }

    async exportFromCChain(amt: BN) {
        return await WalletHelper.exportFromCChain(this, amt)
    }

    async importToPlatformChain(): Promise<string> {
        return await WalletHelper.importToPlatformChain(this)
        //
        // // await this.platformHelper.findHdIndex();
        // const utxoSet = (await this.getAtomicUTXOs('P')) as PlatformUTXOSet
        //
        // if (utxoSet.getAllUTXOs().length === 0) {
        //     throw new Error('Nothing to import.')
        // }
        //
        // let keyChain = this.platformKeyChain as PlatformKeyChain
        // let pAddrs = keyChain.getAddressStrings()
        // // Owner addresses, the addresses we exported to
        // let pToAddr = this.getCurrentAddressPlatform()
        //
        // const unsignedTx = await pChain.buildImportTx(
        //     utxoSet,
        //     pAddrs,
        //     avm.getBlockchainID(),
        //     [pToAddr],
        //     [pToAddr],
        //     [pToAddr],
        //     undefined,
        //     undefined
        // )
        // const tx = unsignedTx.sign(keyChain)
        //
        // return pChain.issueTx(tx)
    }

    async importToXChain(sourceChain: AvmImportChainType): Promise<string> {
        return await WalletHelper.importToXChain(this, sourceChain)

        // const utxoSet = (await this.getAtomicUTXOs('X')) as AVMUTXOSet
        //
        // if (utxoSet.getAllUTXOs().length === 0) {
        //     throw new Error('Nothing to import.')
        // }
        //
        // let keyChain = this.keyChain as AVMKeyChain
        // let xAddrs = keyChain.getAddressStrings()
        // let xToAddr = this.getCurrentAddressAvm()
        //
        // let sourceChainId
        // if (sourceChain === 'P') {
        //     sourceChainId = pChain.getBlockchainID()
        // } else {
        //     sourceChainId = cChain.getBlockchainID()
        // }
        // // Owner addresses, the addresses we exported to
        // const unsignedTx = await avm.buildImportTx(
        //     utxoSet,
        //     xAddrs,
        //     sourceChainId,
        //     [xToAddr],
        //     xAddrs,
        //     [xToAddr]
        // )
        // const tx = unsignedTx.sign(keyChain)
        //
        // return avm.issueTx(tx)
    }

    async importToCChain(): Promise<string> {
        return await WalletHelper.importToCChain(this)

        // const utxoResponse = await cChain.getUTXOs(this.ethAddressBech, avm.getBlockchainID())
        // const utxoSet: EVMUTXOSet = utxoResponse.utxos
        //
        // if (utxoSet.getAllUTXOs().length === 0) {
        //     throw new Error('Nothing to import.')
        // }
        //
        // let toAddress = '0x' + this.ethAddress
        // let ownerAddresses = [this.ethAddressBech]
        // let fromAddresses = ownerAddresses
        // let sourceChain = avm.getBlockchainID()
        //
        // const unsignedTx = await cChain.buildImportTx(
        //     utxoSet,
        //     toAddress,
        //     ownerAddresses,
        //     sourceChain,
        //     fromAddresses
        // )
        // let keyChain = this.ethKeyChain
        // const tx = unsignedTx.sign(keyChain)
        // let id = await cChain.issueTx(tx)
        //
        // return id
    }

    async buildUnsignedTransaction(
        orders: (ITransaction | UTXO)[],
        addr: string,
        memo?: BufferAvalanche
    ) {
        const changeAddress = this.getChangeAddressAvm()
        const derivedAddresses = this.getDerivedAddresses()
        const utxoset = this.getUTXOSet() as AVMUTXOSet

        return buildUnsignedTransaction(
            orders,
            addr,
            derivedAddresses,
            utxoset,
            changeAddress,
            memo
        )
    }

    async issueBatchTx(
        orders: (ITransaction | AVMUTXO)[],
        addr: string,
        memo: BufferAvalanche | undefined
    ): Promise<string> {
        return await WalletHelper.issueBatchTx(this, orders, addr, memo)
    }

    getFirstAvailableAddressPlatform(): string {
        return this.getCurrentAddressPlatform()
    }

    onnetworkchange(): void {
        let hrp = ava.getHRP()

        this.keyChain = new AVMKeyChain(hrp, this.chainId)
        this.utxoset = new AVMUTXOSet()
        this.keyPair = this.keyChain.importKey(this.key)

        this.platformKeyChain = new PlatformKeyChain(hrp, this.chainIdP)
        this.platformUtxoset = new PlatformUTXOSet()
        this.platformKeyPair = this.platformKeyChain.importKey(this.key)

        // Update EVM values
        this.ethKeyChain = new EVMKeyChain(ava.getHRP(), 'C')
        let cKeypair = this.ethKeyChain.importKey(this.ethKeyBech)
        this.ethAddressBech = cKeypair.getAddressString()
        this.ethBalance = new BN(0)

        this.getUTXOs()
    }

    // async sign<
    //     UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx,
    //     SignedTx extends AVMTx | PlatformTx
    // >(unsignedTx: UnsignedTx, isAVM = true): Promise<SignedTx> {
    //     if (isAVM) {
    //         return (unsignedTx as AVMUnsignedTx).sign(this.keyChain) as SignedTx
    //     } else {
    //         return (unsignedTx as PlatformUnsignedTx).sign(this.platformKeyChain) as SignedTx
    //     }
    // }

    async signX(unsignedTx: AVMUnsignedTx): Promise<AVMTx> {
        let keychain = this.keyChain

        const tx = unsignedTx.sign(keychain)
        return tx
    }

    async signP(unsignedTx: PlatformUnsignedTx): Promise<PlatformTx> {
        let keychain = this.platformKeyChain
        const tx = unsignedTx.sign(keychain)
        return tx
    }

    async signC(unsignedTx: EVMUnsignedTx): Promise<EvmTx> {
        let keyChain = this.ethKeyChain
        return unsignedTx.sign(keyChain)
    }

    async signEvm(tx: Transaction) {
        let keyBuff = Buffer.from(this.ethKey, 'hex')
        return tx.sign(keyBuff)
        // let account = web3.eth.accounts.privateKeyToAccount(this.ethKey)
        // let signedTx = await account.signTransaction(txConfig)
        // return signedTx
    }

    async signMessage(msgStr: string): Promise<string> {
        let digest = digestMessage(msgStr)

        let digestHex = digest.toString('hex')
        let digestBuff = BufferAvalanche.from(digestHex, 'hex')
        let signed = this.keyPair.sign(digestBuff)

        return bintools.cb58Encode(signed)
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

        //
        // let keychain = this.platformKeyChain as PlatformKeyChain
        // let utxoSet: PlatformUTXOSet = this.platformUtxoset as PlatformUTXOSet
        //
        // // If given custom UTXO set use that
        // if (utxos) {
        //     utxoSet = new PlatformUTXOSet()
        //     utxoSet.addArray(utxos)
        // }
        //
        // let pAddressStrings = keychain.getAddressStrings()
        // let stakeAmount = amt
        //
        // // If reward address isn't given use index 0 address
        // if (!rewardAddress) {
        //     rewardAddress = this.getPlatformRewardAddress()
        // }
        //
        // // For change address use first available on the platform chain
        // let changeAddr = this.getCurrentAddressPlatform()
        //
        // // Stake is always returned to address at index 0
        // let stakeReturnAddr = this.getPlatformRewardAddress()
        //
        // // Convert dates to unix time
        // let startTime = new BN(Math.round(start.getTime() / 1000))
        // let endTime = new BN(Math.round(end.getTime() / 1000))
        //
        // const unsignedTx = await pChain.buildAddDelegatorTx(
        //     utxoSet,
        //     [stakeReturnAddr],
        //     pAddressStrings,
        //     [changeAddr],
        //     nodeID,
        //     startTime,
        //     endTime,
        //     stakeAmount,
        //     [rewardAddress] // reward address
        // )
        // const tx = unsignedTx.sign(keychain)
        // // Update UTXOS
        // setTimeout(async () => {
        //     this.getUTXOs()
        // }, 3000)
        //
        // return pChain.issueTx(tx)
    }

    async validate(
        nodeID: string,
        amt: BN,
        start: Date,
        end: Date,
        delegationFee: number = 0,
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

    async createNftFamily(name: string, symbol: string, groupNum: number) {
        return await WalletHelper.createNftFamily(this, name, symbol, groupNum)
    }

    async mintNft(mintUtxo: AVMUTXO, payload: PayloadBase, quantity: number) {
        return await WalletHelper.mintNft(this, mintUtxo, payload, quantity)
    }

    async sendEth(to: string, amount: BN, gasPrice: BN, gasLimit: number) {
        return await WalletHelper.sendEth(this, to, amount, gasPrice, gasLimit)

        // let receiver = to
        // let txAmount = amount
        // let fromAddr = this.ethAddress
        //
        // let account = web3.eth.accounts.privateKeyToAccount(this.ethKey)
        //
        // const txConfig = {
        //     from: fromAddr,
        //     gasPrice: gasPrice,
        //     gas: gasLimit,
        //     to: receiver,
        //     value: txAmount.toString(), // in wei
        //     data: '',
        // }
        //
        // let signedTx = await account.signTransaction(txConfig)
        // let err,
        //     receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction as string)
        //
        // if (err) {
        //     console.error(err)
        //     throw err
        // }
        //
        // return receipt.transactionHash
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
        return await WalletHelper.sendErc20(this, to, amount, gasPrice, gasLimit, token)

        // let from = '0x' + this.ethAddress
        // let tx = token.createTransferTx(to, amount)
        //
        // const txConfig = {
        //     from: from,
        //     gasPrice: gasPrice,
        //     gas: gasLimit,
        //     to: token.data.address,
        //     data: tx.encodeABI(),
        // }
        //
        // let account = web3.eth.accounts.privateKeyToAccount(this.ethKey)
        // let signedTx = await account.signTransaction(txConfig)
        //
        // let err,
        //     receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction as string)
        //
        // if (err) {
        //     console.error(err)
        //     throw err
        // }
        //
        // return receipt.transactionHash
    }

    getAllAddressesX() {
        return [this.getCurrentAddressAvm()]
    }

    getAllAddressesP() {
        return [this.getCurrentAddressPlatform()]
    }
}

export { SingletonWallet }
