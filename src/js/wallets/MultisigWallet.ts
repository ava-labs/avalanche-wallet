import { ava, bintools } from '@/AVA'
import { AvaWalletCore, ChainAlias, WalletNameType } from './types'
import { ChainIdType } from '../../constants'
import { WalletCore } from './WalletCore'
import { BN, Buffer } from '@c4tplatform/caminojs/dist'
import { PayloadBase, privateKeyStringToBuffer } from '@c4tplatform/caminojs/dist/utils'
import {
    Tx as AVMTx,
    UnsignedTx as AVMUnsignedTx,
    UTXO as AVMUTXO,
    UTXOSet as AVMUTXOSet,
} from '@c4tplatform/caminojs/dist/apis/avm'
import {
    KeyPair,
    Owner,
    PlatformVMConstants,
    Tx as PlatformTx,
    UnsignedTx as PlatformUnsignedTx,
    UTXO as PlatformUTXO,
    UTXOSet as PlatformUTXOSet,
} from '@c4tplatform/caminojs/dist/apis/platformvm'
import {
    MultisigKeyChain,
    MultisigKeyPair,
    OutputOwners,
    SECP256k1KeyPair,
    SignerKeyPair,
    SignerKeyChain,
    SignatureError,
    StandardBaseTx,
    StandardTx,
    StandardUnsignedTx,
} from '@c4tplatform/caminojs/dist/common'

import { Tx as EVMTx, UnsignedTx as EVMUnsignedTx } from '@c4tplatform/caminojs/dist/apis/evm'
import Erc20Token from '@/js/Erc20Token'
import { Transaction } from '@ethereumjs/tx'
import { ITransaction } from '@/components/wallet/transfer/types'
import { buildUnsignedTransaction } from '../TxHelper'
import createHash from 'create-hash'

const NotImplementedError = new Error('Not implemented in MultisigWwallet')

interface KeyData {
    alias: Buffer
    memo: string
    owner: Owner
}

type AbstractUnsignedTx = StandardUnsignedTx<
    SignerKeyPair,
    SignerKeyChain,
    StandardBaseTx<SignerKeyPair, SignerKeyChain>
>

type AbstractTx = StandardTx<SignerKeyPair, SignerKeyChain, AbstractUnsignedTx>

class MultisigWallet extends WalletCore implements AvaWalletCore {
    type: WalletNameType = 'multisig'
    chainId = ava.XChain().getBlockchainAlias()
    pchainId = ava.PChain().getBlockchainAlias()
    ethAddress = ''
    ethBalance = new BN(0)

    keyData: KeyData
    wallets: WalletCore[] = []
    unlinkedOwners: string[] = []

    constructor(alias?: Buffer, memo?: string, owner?: Owner) {
        super()
        this.name = 'Multisig Wallet'
        this.keyData = {
            alias: alias ?? Buffer.alloc(0),
            memo: memo ?? '',
            owner: owner ?? ({ addresses: [], threshold: 0, locktime: '0' } as Owner),
        }
        this.ethAddress = this.keyData.alias.toString('hex')
        this.isInit = true
    }

    getKey(): string {
        return JSON.stringify(this.keyData)
    }

    setKey(key: string): void {
        this.keyData = JSON.parse(key)
        // The JSON buffer is not our "AvalancheBuffer"
        this.keyData.alias = Buffer.from(this.keyData.alias)
        this.ethAddress = this.keyData.alias.toString('hex')
    }

    outputOwners(): OutputOwners {
        return new OutputOwners(
            this.keyData.owner.addresses.map((a) => bintools.stringToAddress(a)),
            new BN(this.keyData.owner.locktime),
            this.keyData.owner.threshold
        )
    }

    alias(): Buffer {
        return this.keyData.alias
    }

    updateWallets(wallets: WalletCore[]) {
        this.wallets = []
        this.unlinkedOwners = []
        const lookup = new Set()
        for (const wallet of wallets) {
            const staticKey = wallet.getStaticAddress('P')
            if (this.keyData.owner.addresses.includes(staticKey)) {
                this.wallets.push(wallet)
                lookup.add(staticKey)
            }
        }
        for (const key of this.keyData.owner.addresses) {
            if (!lookup.has(key)) this.unlinkedOwners.push(key)
        }
    }

    onnetworkchange(): void {
        this.chainId = ava.XChain().getBlockchainAlias()
        this.pchainId = ava.PChain().getBlockchainAlias()
    }

    async updateUTXOsX(): Promise<AVMUTXOSet> {
        const response = await ava.XChain().getUTXOs([this._aliasAddress(this.chainId)])
        this.utxoset = response.utxos
        return this.utxoset
    }

    async updateUTXOsP(): Promise<PlatformUTXOSet> {
        const response = await ava.PChain().getUTXOs([this._aliasAddress(this.pchainId)])
        this.platformUtxoset = response.utxos
        return this.platformUtxoset
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

    async getStake(): Promise<BN> {
        return this.stakeAmount
    }

    getPlatformUTXOSet(): PlatformUTXOSet {
        return this.platformUtxoset
    }

    async createNftFamily(name: string, symbol: string, groupNum: number): Promise<string> {
        throw NotImplementedError
    }

    async mintNft(mintUtxo: AVMUTXO, payload: PayloadBase, quantity: number): Promise<string> {
        throw NotImplementedError
    }

    async getEthBalance(): Promise<BN> {
        return new BN(0)
    }

    async sendEth(to: string, amount: BN, gasPrice: BN, gasLimit: number): Promise<string> {
        throw NotImplementedError
    }

    async sendERC20(
        to: string,
        amount: BN,
        gasPrice: BN,
        gasLimit: number,
        token: Erc20Token
    ): Promise<string> {
        throw NotImplementedError
    }

    async estimateGas(to: string, amount: BN, token: Erc20Token): Promise<number> {
        throw NotImplementedError
    }

    async signX(unsignedTx: AVMUnsignedTx): Promise<AVMTx> {
        throw NotImplementedError
    }

    async signP(unsignedTx: PlatformUnsignedTx, additionalSigners?: string[]): Promise<PlatformTx> {
        return this._sign(unsignedTx, additionalSigners) as PlatformTx
    }

    async signC(unsignedTx: EVMUnsignedTx): Promise<EVMTx> {
        throw NotImplementedError
    }

    async signEvm(tx: Transaction): Promise<Transaction> {
        throw NotImplementedError
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
        throw NotImplementedError
    }

    async delegate(
        nodeID: string,
        amt: BN,
        start: Date,
        end: Date,
        rewardAddress?: string,
        utxos?: PlatformUTXO[]
    ): Promise<string> {
        throw NotImplementedError
    }

    async issueBatchTx(
        orders: (AVMUTXO | ITransaction)[],
        addr: string,
        memo?: Buffer
    ): Promise<string> {
        throw NotImplementedError
    }

    async buildUnsignedTransaction(
        orders: (ITransaction | AVMUTXO)[],
        addr: string,
        memo?: Buffer
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

    async signMessage(msg: string, address: string): Promise<string> {
        throw NotImplementedError
    }

    getCurrentAddressAvm(): string {
        return this._aliasAddress(this.chainId)
    }

    getCurrentAddressPlatform(): string {
        return this._aliasAddress(this.pchainId)
    }

    getStaticAddress(chainID: ChainAlias): string {
        return this._aliasAddress(chainID)
    }

    getStaticKeyPair(): SECP256k1KeyPair | undefined {
        return undefined
    }

    getDerivedAddresses(): string[] {
        return this.getAllAddressesX()
    }

    getDerivedAddressesP(): string[] {
        return this.getAllAddressesP()
    }

    getAllDerivedExternalAddresses(): string[] {
        return []
    }

    getAllAddressesX(): string[] {
        return [this._aliasAddress(this.chainId)]
    }
    getAllAddressesP(): string[] {
        return [this._aliasAddress(this.pchainId)]
    }

    getChangeAddressAvm(): string {
        return this.getCurrentAddressAvm()
    }

    getChangeAddressPlatform(): string {
        return this.getCurrentAddressPlatform()
    }

    getHistoryAddresses(): string[] {
        return this.getAllAddressesX()
    }

    getPlatformRewardAddress(): string {
        return this.getCurrentAddressPlatform()
    }

    getBaseAddress(): string {
        return this.getCurrentAddressAvm()
    }

    getEvmAddress(): string {
        return this.ethAddress
    }

    getEvmAddressBech(): string {
        return ''
    }

    getFirstAvailableAddressPlatform(): string {
        return this.getCurrentAddressPlatform()
    }

    getSignerAddresses(chainID: ChainIdType): string[] {
        if (chainID !== 'P') throw NotImplementedError
        return this.keyData.owner.addresses
    }

    /******************** INTERNAL *******************************/

    _aliasAddress(chainID: string) {
        const hrp = ava.getHRP()
        return bintools.addressToString(hrp, chainID, this.keyData.alias)
    }

    _sign(utx: AbstractUnsignedTx, additionalSigners?: string[]): AbstractTx {
        // Create the hash from the tx
        const txbuff = utx.toBuffer()
        const msg: Buffer = Buffer.from(createHash('sha256').update(txbuff).digest())

        const outputOwner = this.outputOwners()

        // Crreate Multisig KeyChain
        const msKeyChain = new MultisigKeyChain(
            ava.getHRP(),
            ava.getNetwork().P.alias,
            msg,
            PlatformVMConstants.SECPMULTISIGCREDENTIAL,
            (utx as PlatformUnsignedTx).getTransaction().getOutputOwners(),
            new Map([[this.keyData.alias.toString('hex'), outputOwner]])
        )

        // Insert all signatures
        this.wallets.forEach((w) => {
            const key = w.getStaticKeyPair()
            if (key) {
                const signature = key.sign(msg)
                msKeyChain.addKey(new MultisigKeyPair(msKeyChain, key.getAddress(), signature))
            }
        })

        // Additional signers
        if (additionalSigners) {
            const key = new KeyPair('', '')
            additionalSigners.forEach((pk) => {
                key.importKey(privateKeyStringToBuffer(pk))
                const signature = key.sign(msg)
                msKeyChain.addKey(new MultisigKeyPair(msKeyChain, key.getAddress(), signature))
            })
        }

        // Create signature indices (throws if not able to do so)
        try {
            msKeyChain.buildSignatureIndices()
            // No exception, we can sign directly and issue tx
            return utx.sign(msKeyChain)
        } catch (e) {
            // Signmature errors are thrown if not enough signers are present
            if (!(e instanceof SignatureError)) throw e
        }

        // This is the place where we can need to do some signavault activities
        // - check if the tx is already in signavault
        // - if so:
        // -- pull signatures, and insert them into mskeychain
        // -- call buildSignatureIndices again
        // -- if successful, tx can be signed
        // - if not:
        // -- serialize tx into hex bytes (hexm)
        // -- serialize utx.getTransaction().getOutputOwners (hexo)
        // -- send hexbytes, transaction.outputowners, txID to signavault
        // -- for every wallet here send the signature (loop)

        // txbuff <- the unsigned transac
        // msg <- the hash of unsigned tx (key in signavault)
        // OutputOwners.toArray((utx.getTransaction() as PlatformBaseTx).getOutputOwners())

        // Throw to supress issueTx
        throw new SignatureError('Transaction added into signavault')
    }
}

export { MultisigWallet }
