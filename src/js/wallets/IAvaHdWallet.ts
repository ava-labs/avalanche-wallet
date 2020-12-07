import HDKey from 'hdkey'
import {
    KeyChain as AVMKeyChain,
    KeyPair as AVMKeyPair,
    UTXOSet,
    UTXO,
    Tx as AVMTx,
    UnsignedTx as AVMUnsignedTx,
} from 'avalanche/dist/apis/avm'

import {
    UTXOSet as PlatformUTXOSet,
    UnsignedTx as PlatformUnsignedTx,
    Tx as PlatformTx,
} from 'avalanche/dist/apis/platformvm'

import { ITransaction } from '@/components/wallet/transfer/types'
import { BN, Buffer } from 'avalanche'
import { WalletNameType } from '@/store/types'
import { StandardTx, StandardUnsignedTx } from 'avalanche/dist/common'

// export type wallet_type = "hd" | "singleton";

export interface IIndexKeyCache {
    [index: number]: AVMKeyPair
}

// Every AVA Wallet must implement this.
export interface AvaWalletCore {
    type: WalletNameType
    chainId: string
    utxoset: UTXOSet
    platformUtxoset: PlatformUTXOSet
    stakeAmount: BN

    getCurrentAddress(): string
    getChangeAddress(): string
    getDerivedAddresses(): string[]
    getHistoryAddresses(): string[]
    getExtendedPlatformAddresses(): string[]
    onnetworkchange(): void
    getUTXOs(): Promise<UTXOSet>
    getUTXOSet(): UTXOSet
    getStake(): Promise<BN>
    getPlatformUTXOs(): Promise<PlatformUTXOSet>
    getPlatformUTXOSet(): PlatformUTXOSet
    getPlatformAddress(): string
    getPlatformRewardAddress(): string
    sign<
        UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx,
        SignedTx extends AVMTx | PlatformTx
    >(
        unsignedTx: UnsignedTx,
        isAVM: boolean
    ): Promise<StandardTx<any, any, any>>
    validate(
        nodeID: string,
        amt: BN,
        start: Date,
        end: Date,
        delegationFee: number,
        rewardAddress?: string
    ): Promise<string>
    delegate(
        nodeID: string,
        amt: BN,
        start: Date,
        end: Date,
        rewardAddress?: string
    ): Promise<string>
    chainTransfer(amt: BN, sourceChain: string): Promise<string>
    importToPlatformChain(): Promise<string>
    importToXChain(): Promise<string>
    issueBatchTx(
        orders: (UTXO | ITransaction)[],
        addr: string,
        memo?: Buffer
    ): Promise<string>
    signMessage(msg: string, address: string): Promise<string>
}

export interface IAvaHdWallet extends AvaWalletCore {
    seed: string
    hdKey: HDKey
    getMnemonic(): string
    getCurrentKey(): AVMKeyPair
    getKeyChain(): AVMKeyChain
}

export interface IAvaSingletonWallet extends AvaWalletCore {
    masterKey: AVMKeyPair
}
