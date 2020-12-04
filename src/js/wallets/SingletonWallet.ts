import { ava, avm, bintools, pChain } from '@/AVA'
import { ITransaction } from '@/components/wallet/transfer/types'
import { digestMessage } from '@/helpers/helper'
import { WalletType } from '@/store/types'
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
import { AvaWalletCore } from './IAvaHdWallet'

class SingletonWallet implements AvaWalletCore {
    keyChain: AVMKeyChain | PlatformKeyChain
    // TODO: Singleton, @emre check this please
    // @ts-ignore
    utxoset: AVMUTXOSet | PlatformUTXOSet
    keyPair: AVMKeyPair | PlatformKeyPair

    chainId: string
    chainIdP: string

    key: string

    stakeAmount: BN

    type: WalletType

    platformKey: PlatformKeyPair
    platformChain: PlatformKeyChain

    constructor(pk: string) {
        this.key = pk

        this.chainId = avm.getBlockchainAlias() || avm.getBlockchainID()
        let chainIdP = pChain.getBlockchainID()
        this.chainIdP = chainIdP

        let hrp = ava.getHRP()
        if (this.chainId === 'X') {
            this.keyChain = new AVMKeyChain(hrp, this.chainId)
            this.utxoset = new AVMUTXOSet()
        } else {
            this.keyChain = new PlatformKeyChain(hrp, this.chainId)
            this.utxoset = new PlatformUTXOSet()
        }
        this.keyPair = this.keyChain.importKey(pk)
        this.platformChain = new PlatformKeyChain(hrp, chainIdP)
        this.platformKey = this.platformChain.importKey(pk)

        this.stakeAmount = new BN(0)

        this.type = 'singleton'
    }

    chainTransfer(amt: BN, sourceChain: string): Promise<string> {
        return Promise.resolve('')
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
        let addr = this.platformKey.getAddressString()
        return [addr]
    }

    getHistoryAddresses(): string[] {
        let addr = this.getCurrentAddress()
        return [addr]
    }

    getPlatformRewardAddress(): string {
        return this.platformKey.getAddressString()
    }

    async getStake(): Promise<BN> {
        let addr = this.platformKey.getAddressString()
        let res = await pChain.getStake([addr])
        return res
    }

    getUTXOSet(): AVMUTXOSet {
        // TODO: Singleton, @emre check this please
        return this.utxoset as AVMUTXOSet
    }

    async getUTXOs(): Promise<AVMUTXOSet> {
        let addr = this.getCurrentAddress()
        let res

        if (this.chainId === 'X') {
            res = await avm.getUTXOs([addr])
        } else {
            res = await pChain.getUTXOs([addr])
        }

        this.getStake()
        // TODO: Singleton, @emre check this please
        this.utxoset = res.utxos
        return res.utxos as AVMUTXOSet
    }

    importToPlatformChain(): Promise<string> {
        return Promise.resolve('')
    }

    importToXChain(): Promise<string> {
        return Promise.resolve('')
    }

    issueBatchTx(
        orders: (UTXO | ITransaction)[],
        addr: string
    ): Promise<string> {
        return Promise.resolve('')
    }

    onnetworkchange(): void {
        let hrp = getPreferredHRP(ava.getNetworkID())

        if (this.chainId === 'X') {
            this.keyChain = new AVMKeyChain(hrp, this.chainId)
            this.utxoset = new AVMUTXOSet()
        } else {
            this.keyChain = new PlatformKeyChain(hrp, this.chainId)
            this.utxoset = new PlatformUTXOSet()
        }

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
