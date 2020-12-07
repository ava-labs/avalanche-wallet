import { ava, avm, bintools, pChain } from '@/AVA'
import { ITransaction } from '@/components/wallet/transfer/types'
import { digestMessage } from '@/helpers/helper'
import { WalletNameType } from '@/store/types'
import { Buffer } from 'avalanche'
import {
    KeyPair as AVMKeyPair,
    KeyChain as AVMKeyChain,
    UTXOSet as AVMUTXOSet,
    UTXO,
} from 'avalanche/dist/apis/avm'
import {
    KeyPair as PlatformKeyPair,
    KeyChain as PlatformKeyChain,
    UTXOSet as PlatformUTXOSet,
} from 'avalanche/dist/apis/platformvm'
import { StandardTx, StandardUnsignedTx } from 'avalanche/dist/common'
import { getPreferredHRP } from 'avalanche/dist/utils'
import BN from 'bn.js'
import { buildUnsignedTransaction } from '../TxHelper'
import { AvaWalletCore } from './IAvaHdWallet'

class SingletonWallet implements AvaWalletCore {
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

    constructor(pk: string) {
        this.key = pk

        this.chainId = avm.getBlockchainAlias() || avm.getBlockchainID()
        let chainIdP = pChain.getBlockchainID()
        this.chainIdP = chainIdP

        let hrp = ava.getHRP()

        this.keyChain = new AVMKeyChain(hrp, this.chainId)
        this.utxoset = new AVMUTXOSet()
        this.keyPair = this.keyChain.importKey(pk)

        this.platformKeyChain = new PlatformKeyChain(hrp, this.chainIdP)
        this.platformUtxoset = new PlatformUTXOSet()
        this.platformKeyPair = this.platformKeyChain.importKey(pk)

        this.stakeAmount = new BN(0)

        this.type = 'singleton'
    }

    async chainTransfer(amt: BN, sourceChain: string): Promise<string> {
        let fee = avm.getTxFee()
        let amtFee = amt.add(fee)

        // EXPORT
        let pId = pChain.getBlockchainID()
        let xId = avm.getBlockchainID()
        let txId
        if (sourceChain === 'X') {
            let keychain = this.keyChain
            let toAddress = this.getPlatformAddress()
            let xChangeAddr = this.getCurrentAddress()
            let fromAddrs = keychain.getAddressStrings()

            let exportTx = await avm.buildExportTx(
                this.utxoset,
                amtFee,
                pId,
                [toAddress],
                fromAddrs,
                [xChangeAddr]
            )
            let tx = exportTx.sign(keychain)
            return avm.issueTx(tx)
        } else if (sourceChain === 'P') {
            let keychain = this.platformKeyChain
            let utxoSet = this.platformUtxoset
            let toAddress = this.getCurrentAddress()
            let pChangeAddr = this.getPlatformAddress()
            let fromAddrs = keychain.getAddressStrings()

            let exportTx = await pChain.buildExportTx(
                utxoSet,
                amtFee,
                xId,
                [toAddress],
                fromAddrs,
                [pChangeAddr]
            )

            let tx = exportTx.sign(keychain)
            return pChain.issueTx(tx)
        } else {
            throw 'Invalid source chain.'
        }
    }

    delegate(
        nodeID: string,
        amt: BN,
        start: Date,
        end: Date,
        rewardAddress?: string
    ): Promise<string> {
        return Promise.resolve('')
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

    getExtendedPlatformAddresses(): string[] {
        let addr = this.platformKeyPair.getAddressString()
        return [addr]
    }

    getHistoryAddresses(): string[] {
        let addr = this.getCurrentAddress()
        return [addr]
    }

    getPlatformRewardAddress(): string {
        return this.getPlatformAddress()
    }

    getPlatformAddress(): string {
        let keypair = this.platformKeyPair

        let pkHex = this.keyPair.getPublicKey().toString('hex')
        let pkBuff = Buffer.from(pkHex, 'hex')
        let hrp = getPreferredHRP(ava.getNetworkID())
        let addrBuf = keypair.addressFromPublicKey(pkBuff)
        let addr = bintools.addressToString(hrp, 'P', addrBuf)

        return addr
    }

    async getStake(): Promise<BN> {
        let addr = this.getPlatformAddress()
        let res = await pChain.getStake([addr])
        return res
    }

    getUTXOSet(): AVMUTXOSet {
        return this.utxoset
    }

    getPlatformUTXOSet(): PlatformUTXOSet {
        return this.platformUtxoset
    }

    async getUTXOs(): Promise<AVMUTXOSet> {
        let addr = this.getCurrentAddress()

        let setInternal = await avm.getUTXOs([addr])

        this.getStake()
        this.utxoset = setInternal.utxos
        return setInternal.utxos
    }

    async getPlatformUTXOs(): Promise<PlatformUTXOSet> {
        let pAddr = this.getPlatformAddress()

        let setPlatform = await pChain.getUTXOs([pAddr])

        this.getStake()
        this.platformUtxoset = setPlatform.utxos
        return setPlatform.utxos
    }

    async importToPlatformChain(): Promise<string> {
        // await this.platformHelper.findHdIndex();
        const utxoSet = (await this.getPlatformUTXOs()) as PlatformUTXOSet

        if (utxoSet.getAllUTXOs().length === 0) {
            throw new Error('Nothing to import.')
        }

        let keyChain = this.platformKeyChain as PlatformKeyChain
        let pAddrs = keyChain.getAddressStrings()
        // Owner addresses, the addresses we exported to
        let pToAddr = this.getPlatformAddress()

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

        // Update UTXOS
        setTimeout(async () => {
            await this.getUTXOs()
        }, 3000)

        return pChain.issueTx(tx)
    }

    importToXChain(): Promise<string> {
        return Promise.resolve('')
    }

    async buildUnsignedTransaction(
        orders: (ITransaction | UTXO)[],
        addr: string,
        memo?: Buffer
    ) {
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
        let hrp = getPreferredHRP(ava.getNetworkID())

        this.keyChain = new AVMKeyChain(hrp, this.chainId)
        this.utxoset = new AVMUTXOSet()

        this.platformKeyChain = new PlatformKeyChain(hrp, this.chainId)
        this.platformUtxoset = new PlatformUTXOSet()

        this.keyPair = this.keyChain.importKey(this.key)

        this.getUTXOs()
    }

    async sign<UnsignedTx extends StandardUnsignedTx<any, any, any>>(
        unsignedTx: UnsignedTx
    ): Promise<StandardTx<any, any, any>> {
        return unsignedTx.sign(this.keyChain)
    }

    async signMessage(msgStr: string): Promise<string> {
        let digest = digestMessage(msgStr)

        let digestHex = digest.toString('hex')
        let digestBuff = Buffer.from(digestHex, 'hex')
        let signed = this.keyPair.sign(digestBuff)

        return bintools.cb58Encode(signed)
    }

    validate(
        nodeID: string,
        amt: BN,
        start: Date,
        end: Date,
        delegationFee: number,
        rewardAddress?: string
    ): Promise<string> {
        return Promise.resolve('')
    }
}

export { SingletonWallet }
