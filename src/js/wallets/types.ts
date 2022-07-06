import HDKey from 'hdkey'
import {
    KeyChain as AVMKeyChain,
    KeyPair as AVMKeyPair,
    UTXOSet,
    UTXO as AVMUTXO,
    Tx as AVMTx,
    UnsignedTx as AVMUnsignedTx,
} from '@c4tplatform/camino/dist/apis/avm'

import {
    UTXOSet as PlatformUTXOSet,
    UnsignedTx as PlatformUnsignedTx,
    UTXO as PlatformUTXO,
    Tx as PlatformTx,
} from '@c4tplatform/camino/dist/apis/platformvm'
import {
    KeyChain as EVMKeyChain,
    UnsignedTx as EVMUnsignedTx,
    Tx as EVMTx,
} from '@c4tplatform/camino/dist/apis/evm'

import { ITransaction } from '@/components/wallet/transfer/types'
import { BN, Buffer } from '@c4tplatform/camino'
import { PayloadBase } from '@c4tplatform/camino/dist/utils'
import Erc20Token from '@/js/Erc20Token'

import { Transaction } from '@ethereumjs/tx'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import { LedgerWallet } from '@/js/wallets/LedgerWallet'
import { SingletonWallet } from '@/js/wallets/SingletonWallet'
import { ExportChainsC, ExportChainsP, ExportChainsX } from '@c4tplatform/camino-wallet-sdk'
import { UTXOSet as EVMUTXOSet } from '@c4tplatform/camino/dist/apis/evm/utxos'

export interface IIndexKeyCache {
    [index: number]: AVMKeyPair
}

export type ChainAlias = 'X' | 'P'
export type AvmImportChainType = 'P' | 'C'
export type AvmExportChainType = 'P' | 'C'

export type WalletNameType = 'mnemonic' | 'ledger' | 'singleton'
export type WalletType = MnemonicWallet | LedgerWallet | SingletonWallet

interface IAddressManager {
    getCurrentAddressAvm(): string
    getCurrentAddressPlatform(): string
    getChangeAddressAvm(): string
    getChangeAddressPlatform(): string
    getDerivedAddresses(): string[]
    getDerivedAddressesP(): string[]
    getAllDerivedExternalAddresses(): string[]
    getAllAddressesX(): string[] // returns all addresses this wallet own on the X chain
    getAllAddressesP(): string[] // returns all addresses this wallet own on the P chain
    getHistoryAddresses(): string[]
    getPlatformRewardAddress(): string
    getBaseAddress(): string
    getEvmAddress(): string
    getEvmAddressBech(): string
    getFirstAvailableAddressPlatform(): string
}

// Every AVA Wallet must implement this.
export interface AvaWalletCore extends IAddressManager {
    id: string // a random string assigned as ID to distinguish between wallets
    type: WalletNameType
    chainId: string
    utxoset: UTXOSet
    platformUtxoset: PlatformUTXOSet
    stakeAmount: BN
    ethAddress: string
    ethBalance: BN
    isFetchUtxos: boolean // true if fetching utxos
    isInit: boolean // True once the wallet can be used (ex. when HD index is found)
    onnetworkchange(): void
    getUTXOs(): Promise<void>
    getUTXOSet(): UTXOSet
    getStake(): Promise<BN>
    getPlatformUTXOSet(): PlatformUTXOSet
    createNftFamily(name: string, symbol: string, groupNum: number): Promise<string>
    mintNft(mintUtxo: AVMUTXO, payload: PayloadBase, quantity: number): Promise<string>
    getEthBalance(): Promise<BN>
    sendEth(to: string, amount: BN, gasPrice: BN, gasLimit: number): Promise<string>
    sendERC20(
        to: string,
        amount: BN,
        gasPrice: BN,
        gasLimit: number,
        token: Erc20Token
    ): Promise<string>
    estimateGas(to: string, amount: BN, token: Erc20Token): Promise<number>

    signX(unsignedTx: AVMUnsignedTx): Promise<AVMTx>
    signP(unsignedTx: PlatformUnsignedTx): Promise<PlatformTx>
    signC(unsignedTx: EVMUnsignedTx): Promise<EVMTx>
    signEvm(tx: Transaction): Promise<Transaction>
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
    // chainTransfer(amt: BN, sourceChain: ChainIdType, destinationChain: ChainIdType): Promise<string>
    exportFromXChain(amt: BN, destinationChain: ExportChainsX): Promise<string>
    exportFromPChain(amt: BN, destinationChain: ExportChainsP): Promise<string>
    exportFromCChain(amt: BN, destinationChain: ExportChainsC, baseFee: BN): Promise<string>

    importToPlatformChain(sourceChain: ExportChainsP): Promise<string>
    importToXChain(sourceChain: ExportChainsX): Promise<string>
    importToCChain(sourceChain: ExportChainsC, baseFee: BN, utxoSet?: EVMUTXOSet): Promise<string>
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
