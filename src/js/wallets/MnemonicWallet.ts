// A simple wrapper thar combines caminojs, bip39 and HDWallet

import {
    KeyPair as AVMKeyPair,
    KeyChain as AVMKeyChain,
    UnsignedTx as AVMUnsignedTx,
    Tx as AVMTx,
    UTXO as AVMUTXO,
} from '@c4tplatform/camino/dist/apis/avm'

import { privateToAddress } from 'ethereumjs-util'

import {
    KeyChain as PlatformVMKeyChain,
    UnsignedTx as PlatformUnsignedTx,
    UTXO as PlatformUTXO,
    Tx as PlatformTx,
} from '@c4tplatform/camino/dist/apis/platformvm'

import {
    KeyChain as EVMKeyChain,
    UnsignedTx as EVMUnsignedTx,
    Tx as EvmTx,
} from '@c4tplatform/camino/dist/apis/evm'
import { PayloadBase } from '@c4tplatform/camino/dist/utils'

import * as bip39 from 'bip39'
import { BN, Buffer as BufferAvalanche } from '@c4tplatform/camino'
import { ava, bintools } from '@/AVA'
import { IAvaHdWallet } from '@/js/wallets/types'
import HDKey from 'hdkey'
import { ITransaction } from '@/components/wallet/transfer/types'
import { HdWalletCore } from '@/js/wallets/HdWalletCore'
import { WalletNameType } from '@/js/wallets/types'
import { KeyChain } from '@c4tplatform/camino/dist/apis/evm'
import Erc20Token from '@/js/Erc20Token'
import { WalletHelper } from '@/helpers/wallet_helper'
import { Transaction } from '@ethereumjs/tx'
import MnemonicPhrase from '@/js/wallets/MnemonicPhrase'

// HD WALLET
// Accounts are not used and the account index is fixed to 0
// m / purpose' / coin_type' / account' / change / address_index

const AVA_TOKEN_INDEX: string = '9000'
export const AVA_ACCOUNT_PATH: string = `m/44'/${AVA_TOKEN_INDEX}'/0'` // Change and index left out
export const ETH_ACCOUNT_PATH: string = `m/44'/60'/0'`
export const LEDGER_ETH_ACCOUNT_PATH = ETH_ACCOUNT_PATH + '/0/0'

const INDEX_RANGE: number = 20 // a gap of at least 20 indexes is needed to claim an index unused
const SCAN_SIZE: number = 70 // the total number of utxos to look at initially to calculate last index
const SCAN_RANGE: number = SCAN_SIZE - INDEX_RANGE // How many items are actually scanned

// Possible indexes for each request is
// SCAN_SIZE - INDEX_RANGE

export default class MnemonicWallet extends HdWalletCore implements IAvaHdWallet {
    seed: string
    hdKey: HDKey
    private mnemonic: MnemonicPhrase
    isLoading: boolean
    type: WalletNameType
    ethKey: string
    ethKeyBech: string
    ethKeyChain: EVMKeyChain
    ethAddress: string
    ethBalance: BN

    // TODO : Move to hd core class
    onnetworkchange() {
        super.onnetworkchange()

        // Update EVM values
        this.ethKeyChain = new EVMKeyChain(ava.getHRP(), 'C')
        let cKeypair = this.ethKeyChain.importKey(this.ethKeyBech)
        this.ethBalance = new BN(0)
    }

    // The master key from caminojs
    constructor(mnemonic: string, seedStr?: string) {
        const seed: globalThis.Buffer = seedStr
            ? Buffer.from(seedStr, 'hex')
            : bip39.mnemonicToSeedSync(mnemonic)

        let masterHdKey: HDKey = HDKey.fromMasterSeed(seed)
        let accountHdKey = masterHdKey.derive(AVA_ACCOUNT_PATH)
        let ethAccountKey = masterHdKey.derive(ETH_ACCOUNT_PATH + '/0/0')

        super(accountHdKey, ethAccountKey, false)

        // Derive EVM key and address
        let ethPrivateKey = ethAccountKey.privateKey
        this.ethKey = ethPrivateKey.toString('hex')
        this.ethAddress = privateToAddress(ethPrivateKey).toString('hex')
        this.ethBalance = new BN(0)

        let cPrivKey = `PrivateKey-` + bintools.cb58Encode(BufferAvalanche.from(ethPrivateKey))
        this.ethKeyBech = cPrivKey

        let cKeyChain = new KeyChain(ava.getHRP(), 'C')
        this.ethKeyChain = cKeyChain

        let cKeypair = cKeyChain.importKey(cPrivKey)

        this.type = 'mnemonic'
        this.seed = seed.toString('hex')
        this.hdKey = masterHdKey
        this.mnemonic = new MnemonicPhrase(mnemonic)
        this.isLoading = false
    }

    getEvmAddress(): string {
        return this.ethAddress
    }

    async getEthBalance() {
        let bal = await WalletHelper.getEthBalance(this)
        this.ethBalance = bal
        return bal
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

    getCurrentKey(): AVMKeyPair {
        return this.externalHelper.getCurrentKey() as AVMKeyPair
    }

    /**
     * Returns the mnemonic phrase of this wallet
     */
    getMnemonic(): string {
        return this.mnemonic.getValue()
    }

    getMnemonicEncrypted(): MnemonicPhrase {
        return this.mnemonic
    }

    getSeed(): string {
        return this.seed
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

    // Delegates native Asset to the given node ID
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

    async getStake(): Promise<BN> {
        this.stakeAmount = await WalletHelper.getStake(this)
        return this.stakeAmount
    }

    async issueBatchTx(
        orders: (ITransaction | AVMUTXO)[],
        addr: string,
        memo: BufferAvalanche | undefined
    ): Promise<string> {
        return await WalletHelper.issueBatchTx(this, orders, addr, memo)
    }

    // returns a keychain that has all the derived private/public keys for X chain
    getKeyChain(): AVMKeyChain {
        let internal = this.internalHelper.getAllDerivedKeys() as AVMKeyPair[]
        let external = this.externalHelper.getAllDerivedKeys() as AVMKeyPair[]

        let allKeys = internal.concat(external)
        let keychain: AVMKeyChain = new AVMKeyChain(ava.getHRP(), this.chainId)

        for (var i = 0; i < allKeys.length; i++) {
            keychain.addKey(allKeys[i])
        }
        return keychain
    }

    async signX(unsignedTx: AVMUnsignedTx): Promise<AVMTx> {
        let keychain = this.getKeyChain()

        const tx = unsignedTx.sign(keychain)
        return tx
    }

    async signP(unsignedTx: PlatformUnsignedTx): Promise<PlatformTx> {
        let keychain = this.platformHelper.getKeychain() as PlatformVMKeyChain
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

    async signHashByExternalIndex(index: number, hash: BufferAvalanche) {
        let key = this.externalHelper.getKeyForIndex(index) as AVMKeyPair
        let signed = key.sign(hash)
        return bintools.cb58Encode(signed)
    }

    async createNftFamily(name: string, symbol: string, groupNum: number) {
        return await WalletHelper.createNftFamily(this, name, symbol, groupNum)
    }

    async mintNft(mintUtxo: AVMUTXO, payload: PayloadBase, quantity: number) {
        return await WalletHelper.mintNft(this, mintUtxo, payload, quantity)
    }
}
