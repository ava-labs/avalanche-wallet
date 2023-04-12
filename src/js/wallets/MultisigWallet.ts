import { ava, bintools } from '@/AVA'
import { AxiosError } from 'axios'
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
    BaseTx as PlatformBaseTx,
    UnsignedTx as PlatformUnsignedTx,
    UTXO as PlatformUTXO,
    UTXOSet as PlatformUTXOSet,
    KeyChain,
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

import { ModelMultisigTx, SignaVault } from '@/signavault_api'

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

interface KeyChainResult {
    kc: MultisigKeyChain
    signers: Set<string>
}

// BitMask of current tx signatures
enum SignatureStatus {
    AlreadySigned = 0,
    NeedSignature = 1,
    CanExecute = 2,
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
    unlinkedOwners: Buffer[] = []
    hrp: string = ''

    constructor(alias?: Buffer, memo?: string, owner?: Owner) {
        super()
        const parsedMemo = memo ? Buffer.from(memo.slice(2), 'hex').toString() : ''
        this.name = 'Multisig Wallet' + (memo ? ` (${parsedMemo})` : '')
        this.keyData = {
            alias: alias ?? Buffer.alloc(0),
            memo: parsedMemo,
            owner: owner ?? ({ addresses: [], threshold: 0, locktime: '0' } as Owner),
        }
        this.ethAddress = this.keyData.alias.toString('hex')
        this.isInit = true
        this.hrp = ava.getHRP()
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

    ownerAddresses(): Buffer[] {
        return this.keyData.owner.addresses.map((a) => bintools.stringToAddress(a))
    }

    outputOwners(): OutputOwners {
        return new OutputOwners(
            this.ownerAddresses(),
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
        const addrs = this.ownerAddresses()

        for (const wallet of wallets) {
            const addr = wallet.getStaticKeyPair()?.getAddress()
            if (addr && addrs.find((a) => a.compare(addr) == 0)) {
                this.wallets.push(wallet)
                lookup.add(addr.toString('hex'))
            }
        }

        for (const addr of addrs) {
            if (!lookup.has(addr.toString('hex'))) this.unlinkedOwners.push(addr)
        }
    }

    getUnlinkedOwners(): string[] {
        return this.unlinkedOwners.map((o) => bintools.addressToString(this.hrp, 'X', o))
    }

    onNetworkChange(): void {
        this.chainId = ava.XChain().getBlockchainAlias()
        this.pchainId = ava.PChain().getBlockchainAlias()
        this.hrp = ava.getHRP()
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

    async signP(
        unsignedTx: PlatformUnsignedTx,
        additionalSigners?: string[],
        expirationTime?: number
    ): Promise<PlatformTx> {
        return (await this._sign(unsignedTx, additionalSigners, expirationTime)) as PlatformTx
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

    getSignatureStatus(tx: ModelMultisigTx): SignatureStatus {
        const kcData = this._buildMultisigKeychain(tx)

        var signerFound = false
        const emptyBuffer = new Buffer(0)
        this.wallets.forEach((w) => {
            const key = w.getStaticKeyPair()
            if (key) {
                const address = key.getAddress()
                if (!kcData.signers.has(address.toString('hex'))) {
                    signerFound = true
                    kcData.kc.addKey(new MultisigKeyPair(kcData.kc, address, emptyBuffer))
                }
            }
        })

        // If no new signer found, we can exit early
        if (!signerFound) return SignatureStatus.AlreadySigned

        // Try to build the TX without this wallet
        try {
            kcData.kc.buildSignatureIndices()
            // success -> executable without outr sigs
            return SignatureStatus.CanExecute | SignatureStatus.NeedSignature
        } catch (e: any) {
            if (!(e instanceof SignatureError)) throw e
        }

        // Default: not executable, even with our signature(s)
        return SignatureStatus.NeedSignature
    }

    async addSignatures(tx: ModelMultisigTx): Promise<void> {
        const sv = SignaVault()
        const msg = Buffer.from(tx.id, 'hex')
        for (const w of this.wallets) {
            const staticKey = w.getStaticKeyPair()
            const privKey = staticKey?.getPrivateKeyString()
            const keychain = new KeyChain(
                ava.getHRP(),
                ava.PChain().getBlockchainAlias() || ava.PChain().getBlockchainID()
            )
            const key = keychain.importKey(privKey ?? '')

            if (key) {
                const addrStr = bintools.addressToString(this.hrp, 'P', key.getAddress())
                const owner = tx.owners.find((o) => o.address === addrStr)
                if (owner && !owner.signature) {
                    const signature = key.sign(msg)
                    await sv.signMultisigTx(tx.id, {
                        signature: signature.toString('hex'),
                    })
                }
            }
        }
    }

    async issueExternal(tx: ModelMultisigTx): Promise<void> {
        // Recover data from tx
        const kcData = this._buildMultisigKeychain(tx)
        // Add our own signatures. we usw the last for signing external rq
        const msg = Buffer.from(tx.id, 'hex')
        // This wallet signs the signed TX for verification
        var signer: SECP256k1KeyPair | undefined = undefined
        for (const w of this.wallets) {
            const key = w.getStaticKeyPair()
            if (key) {
                signer = key
                kcData.kc.addKey(new MultisigKeyPair(kcData.kc, key.getAddress(), key.sign(msg)))
            }
        }
        if (!signer) throw Error('No signing wallets available')
        // This prepares signatureIndices in kexChain for signing.
        // Sign will provide them in a MultisigCredential structure to the node
        kcData.kc.buildSignatureIndices()

        const utx = new PlatformUnsignedTx()
        utx.fromBuffer(Buffer.from(tx.unsignedTx, 'hex'))
        const signedTx = utx.sign(kcData.kc)
        const signedTxBytes = signedTx.toBuffer()

        const signedTxHash = Buffer.from(createHash('sha256').update(signedTxBytes).digest())
        const signature = signer.sign(signedTxHash)

        const sv = SignaVault()
        await sv.issueMultisigTx({
            signature: signature.toString('hex'),
            signedTx: signedTxBytes.toString('hex'),
        })
    }

    /******************** INTERNAL *******************************/

    _aliasAddress(chainID: string) {
        return bintools.addressToString(this.hrp, chainID, this.keyData.alias)
    }

    async _sign(
        utx: AbstractUnsignedTx,
        additionalSigners?: string[],
        expirationTime?: number
    ): Promise<AbstractTx> {
        // Create the hash from the tx
        const txbuff = utx.toBuffer()
        const msg: Buffer = Buffer.from(createHash('sha256').update(txbuff).digest())

        const outputOwner = this.outputOwners()

        // Crreate Multisig KeyChain
        const msKeyChain = new MultisigKeyChain(
            this.hrp,
            ava.getNetwork().P.alias,
            msg,
            PlatformVMConstants.SECPMULTISIGCREDENTIAL,
            (utx as PlatformUnsignedTx).getTransaction().getOutputOwners(),
            new Map([[this.keyData.alias.toString('hex'), outputOwner]])
        )

        // Insert all signatures
        const walletSigs: Buffer[] = []
        this.wallets.forEach((w) => {
            const key = w.getStaticKeyPair()
            if (key) {
                const signature = key.sign(msg)
                walletSigs.push(signature)
                msKeyChain.addKey(new MultisigKeyPair(msKeyChain, key.getAddress(), signature))
            }
        })

        // Additional signers
        var metadata = ''
        if (additionalSigners) {
            const key = new KeyPair('', '')
            additionalSigners.forEach((pk) => {
                key.importKey(privateKeyStringToBuffer(pk))
                const signature = key.sign(msg)
                metadata = metadata.concat(
                    key.getAddress().toString('hex'),
                    '#',
                    signature.toString('hex'),
                    '|'
                )
                msKeyChain.addKey(new MultisigKeyPair(msKeyChain, key.getAddress(), signature))
            })
        }

        // Create signature indices (throws if not able to do so)
        try {
            msKeyChain.buildSignatureIndices()
            // No exception, we can sign directly and issue tx
            utx.sign(msKeyChain)
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

        // ToDo: On init time there should be set if this is an existing
        // or new TX, for this little test we assume new TX
        const sv = SignaVault()
        try {
            await sv.createMultisigTx({
                alias: this._aliasAddress('P'),
                unsignedTx: txbuff.toString('hex'),
                signature: walletSigs[0].toString('hex'),
                outputOwners: OutputOwners.toArray(
                    (utx.getTransaction() as PlatformBaseTx).getOutputOwners()
                ).toString('hex'),
                // we send node's signature as metadata so it can be used form the issuer
                metadata: metadata,
                expiration: expirationTime,
            })

            walletSigs.splice(0, 1)
            for (const s of walletSigs) {
                await sv.signMultisigTx(msg.toString('hex'), {
                    signature: s.toString('hex'),
                })
            }
        } catch (e: unknown) {
            const data = (e as AxiosError).response?.data
            if (data) {
                throw new Error(data.message + ` (${data.error})`)
            }
            throw e
        }
        // Throw to supress issueTx
        throw new SignatureError('Transaction recorded for signing')
    }

    _buildMultisigKeychain(tx: ModelMultisigTx): KeyChainResult {
        // The SECP256k1 OutputOwners to sign (in general 1 msig alias)
        const outputOwners = OutputOwners.fromArray(Buffer.from(tx.outputOwners, 'hex'))
        // Msig Alias converted into OutputOwner
        const outputOwner = this.outputOwners()

        // Crreate Multisig KeyChain
        const msKeyChain = new MultisigKeyChain(
            this.hrp,
            ava.getNetwork().P.alias,
            Buffer.from(tx.unsignedTx, 'hex'),
            PlatformVMConstants.SECPMULTISIGCREDENTIAL,
            outputOwners,
            new Map([[this.keyData.alias.toString('hex'), outputOwner]])
        )

        // Read all existing signatures and add them into the new keychain
        const signedLookup = new Set<string>()
        tx.owners.forEach((o) => {
            if (o.signature) {
                const address = bintools.stringToAddress(o.address)
                signedLookup.add(address.toString('hex'))
                msKeyChain.addKey(
                    new MultisigKeyPair(msKeyChain, address, Buffer.from(o.signature, 'hex'))
                )
            }
        })

        // Add potential additional signatures
        const addSigs = (tx.metadata ?? '').split('|')
        addSigs.forEach((item) => {
            const addrSig = item.split('#')
            if (addrSig.length == 2)
                msKeyChain.addKey(
                    new MultisigKeyPair(
                        msKeyChain,
                        Buffer.from(addrSig[0], 'hex'),
                        Buffer.from(addrSig[1], 'hex')
                    )
                )
        })
        return {
            kc: msKeyChain,
            signers: signedLookup,
        }
    }
}

export { MultisigWallet }
