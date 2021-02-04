import HDKey from 'hdkey'
import {
    KeyChain as AVMKeyChain,
    KeyPair as AVMKeyPair,
    UTXOSet,
    UTXO as AVMUTXO,
    Tx as AVMTx,
    UnsignedTx as AVMUnsignedTx,
    UnsignedTx,
} from 'avalanche/dist/apis/avm'

import {
    UTXOSet as PlatformUTXOSet,
    UnsignedTx as PlatformUnsignedTx,
    UTXO as PlatformUTXO,
    Tx as PlatformTx,
} from 'avalanche/dist/apis/platformvm'
import { KeyChain as EVMKeyChain } from 'avalanche/dist/apis/evm'

import { ITransaction } from '@/components/wallet/transfer/types'
import { BN, Buffer } from 'avalanche'
import { WalletNameType } from '@/store/types'
import { StandardTx, StandardUnsignedTx } from 'avalanche/dist/common'
import { PayloadBase } from 'avalanche/dist/utils'
import { ChainIdType } from '@/constants'

// export type wallet_type = "hd" | "singleton";

export interface IIndexKeyCache {
    [index: number]: AVMKeyPair
}

export type ChainAlias = 'X' | 'P'

// Every AVA Wallet must implement this.
export interface AvaWalletCore {
    id: string // a random string assigned as ID to distinguish between wallets
    type: WalletNameType
    chainId: string
    utxoset: UTXOSet
    platformUtxoset: PlatformUTXOSet
    stakeAmount: BN
    buildCreateNftFamilyTx(name: string, symbol: string, groupNum: number): Promise<UnsignedTx>
    buildMintNftTx(
        mintUtxo: AVMUTXO,
        payload: PayloadBase,
        quantity: number,
        ownerAddress: string,
        changeAddress: string
    ): Promise<UnsignedTx>
    ethAddress: string
    ethAddressBech: string
    ethBalance: BN
    isFetchUtxos: boolean // true if fetching utxos
    isInit: boolean // True once the wallet can be used (ex. when HD index is found)
    getCurrentAddress(): string
    getChangeAddress(): string
    getDerivedAddresses(): string[]
    getAllDerivedExternalAddresses(): string[]
    getAllAddressesX(): string[] // returns all addresses this wallet own on the X chain
    getAllAddressesP(): string[] // returns all addresses this wallet own on the P chain
    getHistoryAddresses(): string[]
    getExtendedPlatformAddresses(): string[]
    onnetworkchange(): void
    getUTXOs(): Promise<void>
    getUTXOSet(): UTXOSet
    getStake(): Promise<BN>
    getCurrentPlatformAddress(): string
    getPlatformUTXOSet(): PlatformUTXOSet
    getPlatformRewardAddress(): string
    createNftFamily(name: string, symbol: string, groupNum: number): Promise<string>
    mintNft(mintUtxo: AVMUTXO, payload: PayloadBase, quantity: number): Promise<string>
    getBaseAddress(): string
    getEthBalance(): Promise<BN>
    getEvmAddress(): string
    sendEth(to: string, amount: BN, gasPrice: BN, gasLimit: number): Promise<string>
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
        rewardAddress?: string,
        utxos?: PlatformUTXO[]
    ): Promise<string>
    delegate(
        nodeID: string,
        amt: BN,
        start: Date,
        end: Date,
        rewardAddress?: string,
        utxos?: PlatformUTXO[]
    ): Promise<string>
    chainTransfer(amt: BN, sourceChain: ChainIdType, destinationChain: ChainIdType): Promise<string>
    importToPlatformChain(): Promise<string>
    importToXChain(sourceChain: ChainIdType): Promise<string>
    importToCChain(): Promise<string>
    issueBatchTx(orders: (AVMUTXO | ITransaction)[], addr: string, memo?: Buffer): Promise<string>
    signMessage(msg: string, address: string): Promise<string>
}

// Wallets which have the private key in memory
export interface UnsafeWallet {
    ethKey: string
    ethKeyChain: EVMKeyChain
}

export interface IAvaHdWallet extends AvaWalletCore, UnsafeWallet {
    seed: string
    hdKey: HDKey
    getMnemonic(): string
    getCurrentKey(): AVMKeyPair
    getKeyChain(): AVMKeyChain
}
