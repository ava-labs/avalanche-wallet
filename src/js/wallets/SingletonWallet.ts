import { ava, avm, bintools, cChain, pChain } from '@/AVA'
import { ITransaction } from '@/components/wallet/transfer/types'
import { digestMessage } from '@/helpers/helper'
import { WalletNameType } from '@/store/types'
import { Buffer } from 'avalanche'
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

import { StandardTx, StandardUnsignedTx, UTXOResponse } from 'avalanche/dist/common'
import { getPreferredHRP, PayloadBase } from 'avalanche/dist/utils'
import BN from 'bn.js'
import {
    buildExportTransaction,
    buildUnsignedTransaction,
    buildCreateNftFamilyTx,
    buildMintNftTx,
} from '../TxHelper'
import { AvaWalletCore, ChainAlias, UnsafeWallet } from './IAvaHdWallet'
import { UTXO as PlatformUTXO } from 'avalanche/dist/apis/platformvm/utxos'
import { privateToAddress } from 'ethereumjs-util'
import { web3 } from '@/evm'
import { ChainIdType } from '@/constants'
import { Tx as AVMTx, UnsignedTx as AVMUnsignedTx } from 'avalanche/dist/apis/avm/tx'
import {
    Tx as PlatformTx,
    UnsignedTx as PlatformUnsignedTx,
} from 'avalanche/dist/apis/platformvm/tx'
import { UnsignedTx as EVMUnsignedTx } from 'avalanche/dist/apis/evm/tx'
var uniqid = require('uniqid')

class SingletonWallet implements AvaWalletCore, UnsafeWallet {
    id: string
    keyChain: AVMKeyChain
    keyPair: AVMKeyPair
    utxoset: AVMUTXOSet

    platformKeyChain: PlatformKeyChain
    platformKeyPair: PlatformKeyPair
    platformUtxoset: PlatformUTXOSet

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

    isFetchUtxos: boolean
    isInit: boolean
    constructor(pk: string) {
        this.id = uniqid()
        this.key = pk

        this.chainId = avm.getBlockchainAlias() || avm.getBlockchainID()
        this.chainIdP = pChain.getBlockchainAlias() || pChain.getBlockchainID()

        let hrp = ava.getHRP()

        this.keyChain = new AVMKeyChain(hrp, this.chainId)
        this.utxoset = new AVMUTXOSet()
        this.keyPair = this.keyChain.importKey(pk)

        this.platformKeyChain = new PlatformKeyChain(hrp, this.chainIdP)
        this.platformUtxoset = new PlatformUTXOSet()
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

        let cPrivKey = `PrivateKey-` + bintools.cb58Encode(Buffer.from(pkBuf))
        this.ethKeyBech = cPrivKey
        let cKeyChain = new KeyChain(ava.getHRP(), 'C')
        this.ethKeyChain = cKeyChain

        let cKeypair = cKeyChain.importKey(cPrivKey)
        this.ethAddressBech = cKeypair.getAddressString()

        this.isFetchUtxos = false

        this.type = 'singleton'
        this.isInit = true
    }

    async chainTransfer(
        amt: BN,
        sourceChain: string,
        destinationChain: ChainIdType
    ): Promise<string> {
        let fee = avm.getTxFee()
        let amtFee = amt.add(fee)
        if (destinationChain === 'C') {
            // C Chain imports/exports do not have a fee
            amtFee = amt
        }
        // EXPORT
        let pId = pChain.getBlockchainID()
        let xId = avm.getBlockchainID()
        let txId
        if (sourceChain === 'X') {
            let destinationAddr
            if (destinationChain === 'P') {
                destinationAddr = this.getCurrentPlatformAddress()
            } else {
                // C Chain
                // todo: replace with shared wallet class method
                destinationAddr = this.ethAddressBech
            }

            let fromAddresses = this.getAllAddressesX()
            let changeAddress = this.getChangeAddress()
            let utxos = this.getUTXOSet()
            let exportTx = (await buildExportTransaction(
                sourceChain,
                destinationChain,
                utxos,
                fromAddresses,
                destinationAddr,
                amtFee,
                changeAddress
            )) as AVMUnsignedTx

            let tx = (await this.sign<AVMUnsignedTx, AVMTx>(exportTx)) as AVMTx
            return avm.issueTx(tx)
        } else if (sourceChain === 'P') {
            let destinationAddr = this.getCurrentAddress()
            let fromAddresses = this.getAllAddressesP()

            let changeAddress = this.getCurrentPlatformAddress()
            let utxos = this.getPlatformUTXOSet()

            let exportTx = (await buildExportTransaction(
                sourceChain,
                destinationChain,
                utxos,
                fromAddresses,
                destinationAddr,
                amtFee,
                changeAddress
            )) as PlatformUnsignedTx

            let tx = (await this.sign<PlatformUnsignedTx, PlatformTx>(
                exportTx,
                false
            )) as PlatformTx

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

            let tx = await exportTx.sign(this.ethKeyChain)
            return cChain.issueTx(tx)
        } else {
            throw 'Invalid source chain.'
        }
    }

    getChangeAddress(): string {
        return this.getCurrentAddress()
    }

    getCurrentAddress(): string {
        return this.keyPair.getAddressString()
    }

    getDerivedAddresses(): string[] {
        let addr = this.getCurrentAddress()
        return [addr]
    }

    getAllDerivedExternalAddresses(): string[] {
        return this.getDerivedAddresses()
    }

    getExtendedPlatformAddresses(): string[] {
        let addr = this.platformKeyPair.getAddressString()
        return [addr]
    }

    getHistoryAddresses(): string[] {
        let addr = this.getCurrentAddress()
        return [addr]
    }

    getPlatformRewardAddress(): string {
        return this.getCurrentPlatformAddress()
    }

    getCurrentPlatformAddress(): string {
        return this.platformKeyPair.getAddressString()
    }

    getBaseAddress(): string {
        return this.getCurrentAddress()
    }

    async getStake(): Promise<BN> {
        let addr = this.getCurrentPlatformAddress()
        let res = await pChain.getStake([addr])

        this.stakeAmount = res
        return res
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
    async getEthBalance() {
        let bal = await web3.eth.getBalance(this.ethAddress)
        this.ethBalance = new BN(bal)
        return this.ethBalance
    }

    // TODO: Move to shared class
    async getAtomicUTXOs(chainId: ChainAlias) {
        // console.log(addrs);
        if (chainId === 'P') {
            let result: PlatformUTXOSet = (
                await pChain.getUTXOs(this.getExtendedPlatformAddresses(), avm.getBlockchainID())
            ).utxos
            return result
        } else {
            let result: AVMUTXOSet = (
                await avm.getUTXOs(this.getDerivedAddresses(), pChain.getBlockchainID())
            ).utxos

            let resultC: AVMUTXOSet = (
                await avm.getUTXOs(this.getDerivedAddresses(), cChain.getBlockchainID())
            ).utxos

            return result.merge(resultC)
        }
    }

    async updateUtxos(
        // TODO, type
        chainId: ChainAlias
    ): Promise<AVMUTXOSet | PlatformUTXOSet> {
        let result: AVMUTXOSet | PlatformUTXOSet

        if (chainId === 'X') {
            result = await this.avmGetAllUTXOsForAddresses([this.getCurrentAddress()])
            this.utxoset = result // we can use local copy of utxos as cache for some functions
        } else {
            result = await this.platformGetAllUTXOsForAddresses([this.getCurrentPlatformAddress()])
            this.platformUtxoset = result
        }

        return result
    }

    async getUTXOs(): Promise<void> {
        this.isFetchUtxos = true
        let setInternal = (await this.updateUtxos('X')) as AVMUTXOSet
        // TODO
        // platform utxos are updated but not returned by function
        let setPlatform = (await this.updateUtxos('P')) as PlatformUTXOSet

        await this.getStake()
        await this.getEthBalance()

        this.isFetchUtxos = false

        return
    }

    async platformGetAllUTXOsForAddresses(
        addrs: string[],
        endIndex: any = undefined
    ): Promise<PlatformUTXOSet> {
        let response
        if (!endIndex) {
            response = await pChain.getUTXOs(addrs)
        } else {
            response = await pChain.getUTXOs(addrs, undefined, 0, endIndex)
        }

        let utxoSet = response.utxos
        let nextEndIndex = response.endIndex
        let len = response.numFetched

        if (len >= 1024) {
            let subUtxos = await this.platformGetAllUTXOsForAddresses(addrs, nextEndIndex)
            return utxoSet.merge(subUtxos)
        }

        return utxoSet
    }

    async avmGetAllUTXOsForAddresses(
        addrs: string[],
        endIndex: any = undefined
    ): Promise<AVMUTXOSet> {
        let response
        if (!endIndex) {
            response = await avm.getUTXOs(addrs)
        } else {
            response = await avm.getUTXOs(addrs, undefined, 0, endIndex)
        }

        let utxoSet = response.utxos
        let utxos = utxoSet.getAllUTXOs()
        let nextEndIndex = response.endIndex
        let len = response.numFetched

        if (len >= 1024) {
            let subUtxos = await this.avmGetAllUTXOsForAddresses(addrs, nextEndIndex)
            return utxoSet.merge(subUtxos)
        }
        return utxoSet
    }

    async importToPlatformChain(): Promise<string> {
        // await this.platformHelper.findHdIndex();
        const utxoSet = (await this.getAtomicUTXOs('P')) as PlatformUTXOSet

        if (utxoSet.getAllUTXOs().length === 0) {
            throw new Error('Nothing to import.')
        }

        let keyChain = this.platformKeyChain as PlatformKeyChain
        let pAddrs = keyChain.getAddressStrings()
        // Owner addresses, the addresses we exported to
        let pToAddr = this.getCurrentPlatformAddress()

        const unsignedTx = await pChain.buildImportTx(
            utxoSet,
            pAddrs,
            avm.getBlockchainID(),
            [pToAddr],
            [pToAddr],
            [pToAddr],
            undefined,
            undefined
        )
        const tx = unsignedTx.sign(keyChain)

        return pChain.issueTx(tx)
    }

    async importToXChain(sourceChain: ChainIdType): Promise<string> {
        const utxoSet = (await this.getAtomicUTXOs('X')) as AVMUTXOSet

        if (utxoSet.getAllUTXOs().length === 0) {
            throw new Error('Nothing to import.')
        }

        let keyChain = this.keyChain as AVMKeyChain
        let xAddrs = keyChain.getAddressStrings()
        let xToAddr = this.getCurrentAddress()

        let sourceChainId
        if (sourceChain === 'P') {
            sourceChainId = pChain.getBlockchainID()
        } else {
            sourceChainId = cChain.getBlockchainID()
        }
        // Owner addresses, the addresses we exported to
        const unsignedTx = await avm.buildImportTx(
            utxoSet,
            xAddrs,
            sourceChainId,
            [xToAddr],
            xAddrs,
            [xToAddr]
        )
        const tx = unsignedTx.sign(keyChain)

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

        let toAddress = '0x' + this.ethAddress
        let ownerAddresses = [this.ethAddressBech]
        let fromAddresses = ownerAddresses
        let sourceChain = avm.getBlockchainID()

        const unsignedTx = await cChain.buildImportTx(
            utxoSet,
            toAddress,
            ownerAddresses,
            sourceChain,
            fromAddresses
        )
        let keyChain = this.ethKeyChain
        const tx = unsignedTx.sign(keyChain)
        let id = await cChain.issueTx(tx)

        return id
    }

    async buildUnsignedTransaction(orders: (ITransaction | UTXO)[], addr: string, memo?: Buffer) {
        const changeAddress = this.getChangeAddress()
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
        orders: (UTXO | ITransaction)[],
        addr: string,
        memo: Buffer | undefined
    ): Promise<string> {
        let unsignedTx = await this.buildUnsignedTransaction(orders, addr, memo)
        const tx = unsignedTx.sign(this.keyChain as AVMKeyChain)
        const txId: string = await avm.issueTx(tx)
        return txId
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

    async sign<
        UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx,
        SignedTx extends AVMTx | PlatformTx
    >(unsignedTx: UnsignedTx, isAVM = true): Promise<SignedTx> {
        if (isAVM) {
            return (unsignedTx as AVMUnsignedTx).sign(this.keyChain) as SignedTx
        } else {
            return (unsignedTx as PlatformUnsignedTx).sign(this.platformKeyChain) as SignedTx
        }
    }

    async signMessage(msgStr: string): Promise<string> {
        let digest = digestMessage(msgStr)

        let digestHex = digest.toString('hex')
        let digestBuff = Buffer.from(digestHex, 'hex')
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
        let keychain = this.platformKeyChain as PlatformKeyChain
        let utxoSet: PlatformUTXOSet = this.platformUtxoset as PlatformUTXOSet

        // If given custom UTXO set use that
        if (utxos) {
            utxoSet = new PlatformUTXOSet()
            utxoSet.addArray(utxos)
        }

        let pAddressStrings = keychain.getAddressStrings()
        let stakeAmount = amt

        // If reward address isn't given use index 0 address
        if (!rewardAddress) {
            rewardAddress = this.getPlatformRewardAddress()
        }

        // For change address use first available on the platform chain
        let changeAddr = this.getCurrentPlatformAddress()

        // Stake is always returned to address at index 0
        let stakeReturnAddr = this.getPlatformRewardAddress()

        // Convert dates to unix time
        let startTime = new BN(Math.round(start.getTime() / 1000))
        let endTime = new BN(Math.round(end.getTime() / 1000))

        const unsignedTx = await pChain.buildAddDelegatorTx(
            utxoSet,
            [stakeReturnAddr],
            pAddressStrings,
            [changeAddr],
            nodeID,
            startTime,
            endTime,
            stakeAmount,
            [rewardAddress] // reward address
        )
        const tx = unsignedTx.sign(keychain)
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
        delegationFee: number = 0,
        rewardAddress?: string,
        utxos?: PlatformUTXO[]
    ): Promise<string> {
        let keychain = this.platformKeyChain as PlatformKeyChain
        let utxoSet: PlatformUTXOSet = this.platformUtxoset as PlatformUTXOSet

        // If given custom UTXO set use that
        if (utxos) {
            utxoSet = new PlatformUTXOSet()
            utxoSet.addArray(utxos)
        }

        let pAddressStrings = keychain.getAddressStrings()

        let stakeAmount = amt

        // If reward address isn't given use index 0 address
        if (!rewardAddress) {
            rewardAddress = this.getPlatformRewardAddress()
        }

        // For change address use first available on the platform chain
        let changeAddress = this.getCurrentPlatformAddress()

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
        let tx = unsignedTx.sign(keychain)

        // Update UTXOS
        setTimeout(async () => {
            this.getUTXOs()
        }, 3000)
        return pChain.issueTx(tx)
    }

    async buildCreateNftFamilyTx(name: string, symbol: string, groupNum: number) {
        let fromAddresses = this.getDerivedAddresses()
        let changeAddress = this.getChangeAddress()

        let minterAddress = this.getCurrentAddress()

        let unsignedTx = await buildCreateNftFamilyTx(
            name,
            symbol,
            groupNum,
            fromAddresses,
            minterAddress,
            changeAddress,
            this.utxoset
        )
        return unsignedTx
    }

    async createNftFamily(name: string, symbol: string, groupNum: number) {
        let tx = await this.buildCreateNftFamilyTx(name, symbol, groupNum)
        let signed = (await this.sign<AVMUnsignedTx, AVMTx>(tx)) as AVMTx
        return await avm.issueTx(signed)
    }

    async buildMintNftTx(
        mintUtxo: UTXO,
        payload: PayloadBase,
        quantity: number,
        ownerAddress: string,
        changeAddress: string
    ): Promise<UnsignedTx> {
        let sourceAddresses = this.getDerivedAddresses()

        let mintTx = buildMintNftTx(
            mintUtxo,
            payload,
            quantity,
            ownerAddress,
            changeAddress,
            sourceAddresses,
            this.utxoset
        )

        return mintTx
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
        let receiver = to
        let txAmount = amount
        let fromAddr = this.ethAddress

        let account = web3.eth.accounts.privateKeyToAccount(this.ethKey)

        const txConfig = {
            from: fromAddr,
            gasPrice: gasPrice,
            gas: gasLimit,
            to: receiver,
            value: txAmount.toString(), // in wei
            data: '',
        }

        let signedTx = await account.signTransaction(txConfig)
        let err,
            receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction as string)

        if (err) {
            console.error(err)
            throw err
        }

        return receipt.transactionHash
    }

    getAllAddressesX() {
        return [this.getCurrentAddress()]
    }

    getAllAddressesP() {
        return [this.getCurrentPlatformAddress()]
    }
}

export { SingletonWallet }
