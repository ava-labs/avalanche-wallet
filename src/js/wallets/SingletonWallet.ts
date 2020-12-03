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
    avmChain: AVMKeyChain
    avmKey: AVMKeyPair

    chainId: string
    chainIdP: string

    key: string

    stakeAmount: BN

    type: WalletType

    platformKey: PlatformKeyPair
    platformChain: PlatformKeyChain

    utxoset: AVMUTXOSet
    utxosetPlatform: PlatformUTXOSet

    constructor(pk: string) {
        this.key = pk

        this.chainId = avm.getBlockchainAlias() || avm.getBlockchainID()
        let chainIdP = pChain.getBlockchainID()
        this.chainIdP = chainIdP

        let hrp = ava.getHRP()
        this.avmChain = new AVMKeyChain(hrp, this.chainId)
        this.avmKey = this.avmChain.importKey(pk)
        this.platformChain = new PlatformKeyChain(hrp, chainIdP)
        this.platformKey = this.platformChain.importKey(pk)

        this.stakeAmount = new BN(0)

        this.type = 'singleton'

        this.utxoset = new AVMUTXOSet()
        this.utxosetPlatform = new PlatformUTXOSet()
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
        return this.avmKey.getAddressString()
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
        return this.utxoset
    }

    async getUTXOs(): Promise<AVMUTXOSet> {
        let addr = this.getCurrentAddress()
        let addrP = this.getPlatformRewardAddress()
        let res = await avm.getUTXOs([addr])

        let utxosP = await pChain.getUTXOs([addrP])

        this.getStake()
        // TODO, check this
        this.utxoset = res.utxos
        this.utxosetPlatform = utxosP.utxos
        return res.utxos
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
        this.utxoset = new AVMUTXOSet()
        this.utxosetPlatform = new PlatformUTXOSet()
        let hrp = getPreferredHRP(ava.getNetworkID())

        this.avmChain = new AVMKeyChain(hrp, this.chainId)
        this.platformChain = new PlatformKeyChain(hrp, this.chainIdP)
    }

    async sign<UnsignedTx extends StandardUnsignedTx<any, any, any>>(
        unsignedTx: UnsignedTx
    ): Promise<StandardTx<any, any, any>> {
        return unsignedTx.sign(this.avmChain)
    }

    async signMessage(msgStr: string): Promise<string> {
        let digest = digestMessage(msgStr)

        let digestHex = digest.toString('hex')
        let digestBuff = Buffer.from(digestHex, 'hex')
        let signed = this.avmKey.sign(digestBuff)

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
