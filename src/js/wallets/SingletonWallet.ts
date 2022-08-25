import { ava, bintools } from '@/AVA'
import { ITransaction } from '@/components/wallet/transfer/types'
import { digestMessage } from '@/helpers/helper'
import { WalletNameType } from '@/js/wallets/types'

import { Buffer as BufferAvalanche, BN } from '@c4tplatform/camino'
import {
    KeyPair as AVMKeyPair,
    KeyChain as AVMKeyChain,
    UTXOSet as AVMUTXOSet,
    UTXO,
} from '@c4tplatform/camino/dist/apis/avm'
import {
    KeyPair as PlatformKeyPair,
    KeyChain as PlatformKeyChain,
    UTXOSet as PlatformUTXOSet,
} from '@c4tplatform/camino/dist/apis/platformvm'
import { KeyChain, KeyChain as EVMKeyChain } from '@c4tplatform/camino/dist/apis/evm'
import { PayloadBase } from '@c4tplatform/camino/dist/utils'
import { buildUnsignedTransaction } from '../TxHelper'
import { AvaWalletCore, UnsafeWallet } from './types'
import { UTXO as PlatformUTXO } from '@c4tplatform/camino/dist/apis/platformvm/utxos'
import { privateToAddress } from 'ethereumjs-util'
import { Tx as AVMTx, UnsignedTx as AVMUnsignedTx } from '@c4tplatform/camino/dist/apis/avm/tx'
import {
    Tx as PlatformTx,
    UnsignedTx as PlatformUnsignedTx,
} from '@c4tplatform/camino/dist/apis/platformvm/tx'
import { Tx as EvmTx, UnsignedTx as EVMUnsignedTx } from '@c4tplatform/camino/dist/apis/evm/tx'
import Erc20Token from '@/js/Erc20Token'
import { WalletCore } from '@/js/wallets/WalletCore'
import { WalletHelper } from '@/helpers/wallet_helper'
import { avmGetAllUTXOs, platformGetAllUTXOs } from '@/helpers/utxo_helper'
import { UTXO as AVMUTXO } from '@c4tplatform/camino/dist/apis/avm/utxos'
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

        this.chainId = ava.XChain().getBlockchainAlias() || ava.XChain().getBlockchainID()
        this.chainIdP = ava.PChain().getBlockchainAlias() || ava.PChain().getBlockchainID()

        let hrp = ava.getHRP()

        this.keyChain = new AVMKeyChain(hrp, this.chainId)
        this.keyPair = this.keyChain.importKey(pk)

        this.platformKeyChain = new PlatformKeyChain(hrp, this.chainIdP)
        this.platformKeyPair = this.platformKeyChain.importKey(pk)

        this.stakeAmount = new BN(0)

        // Derive EVM key and address
        let pkBuf = bintools.cb58Decode(pk.split('-')[1])
        let pkHex = pkBuf.toString('hex')
        let pkBuffNative = Buffer.from(pkHex, 'hex')

        this.ethKey = pkHex
        this.ethAddress = privateToAddress(pkBuffNative).toString('hex')
        this.ethBalance = new BN(0)

        let cPrivKey = `PrivateKey-` + bintools.cb58Encode(BufferAvalanche.from(pkBuf))
        this.ethKeyBech = cPrivKey
        let cKeyChain = new KeyChain(ava.getHRP(), 'C')
        this.ethKeyChain = cKeyChain

        let cKeypair = cKeyChain.importKey(cPrivKey)
        this.ethAddressBech = cKeypair.getAddressString()

        this.type = 'singleton'
        this.isInit = true
    }

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

    getPlatformUTXOSet(): PlatformUTXOSet {
        return this.platformUtxoset
    }

    getEvmAddress(): string {
        return this.ethAddress
    }

    getEvmAddressBech(): string {
        return this.ethAddressBech
    }

    async getEthBalance() {
        let bal = await WalletHelper.getEthBalance(this)
        this.ethBalance = bal
        return bal
    }

    async updateUTXOsX(): Promise<AVMUTXOSet> {
        let result = await avmGetAllUTXOs([this.getCurrentAddressAvm()])
        this.utxoset = result
        return result
    }

    async updateUTXOsP(): Promise<PlatformUTXOSet> {
        let result = await platformGetAllUTXOs([this.getCurrentAddressPlatform()])
        this.platformUtxoset = result
        return result
    }

    async getUTXOs(): Promise<void> {
        this.isFetchUtxos = true

        await this.updateUTXOsX()
        await this.updateUTXOsP()

        await this.getStake()
        await this.getEthBalance()

        this.isFetchUtxos = false

        return
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
        return await WalletHelper.sendErc20(this, to, amount, gasPrice, gasLimit, token)
    }

    getAllAddressesX() {
        return [this.getCurrentAddressAvm()]
    }

    getAllAddressesP() {
        return [this.getCurrentAddressPlatform()]
    }
}

export { SingletonWallet }
