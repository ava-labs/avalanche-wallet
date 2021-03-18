import Big from 'big.js'

import { Buffer, BN } from 'avalanche'
import AvaAsset from '@/js/AvaAsset'
import AvaHdWallet from '@/js/wallets/AvaHdWallet'
import { ITransaction } from '@/components/wallet/transfer/types'
import { AllKeyFileTypes } from '@/js/IKeystore'
import { UTXO } from 'avalanche/dist/apis/avm'
import { LedgerWallet } from '@/js/wallets/LedgerWallet'
import { SingletonWallet } from '@/js/wallets/SingletonWallet'
import { UTXO as TxUTXO } from './modules/history/types'

export interface RootState {
    isAuth: boolean
    activeWallet: null | WalletType
    wallets: WalletType[]
    address: String | null
    volatileWallets: WalletType[] // will be forgotten when tab is closed
    warnUpdateKeyfile: boolean
    prices: priceDict // USD value of 1 AVAX
}

export type WalletNameType = 'mnemonic' | 'ledger' | 'singleton'

export type WalletType = AvaHdWallet | LedgerWallet | SingletonWallet

export interface ILedgerAppConfig {
    version: string
    commit: string
    name: 'Avalanche'
}

export interface priceDict {
    usd: number
}

interface Modal {
    open(): void
    close(): void
}

export interface IWalletNftDict {
    [assetId: string]: UTXO[]
}

export interface ITxNftDict {
    [assetId: string]: TxUTXO[]
}

export interface IWalletBalanceDict {
    [assetId: string]: {
        available: BN
        locked: BN
    }
}

export interface IWalletBalanceItem {
    id: string
    amount: BN
}

export interface IWalletAssetsDict {
    [assetId: string]: AvaAsset
}

export interface IWalletNftMintDict {
    [assetId: string]: UTXO[]
}

// interface ModalDict {
//     [key: string]: Modal
// }

export interface AssetType {
    name: string
    symbol: string
    balance: number
    denomination: number
}

export interface IssueBatchTxInput {
    toAddress: string
    memo?: Buffer
    orders: (ITransaction | UTXO)[]
}

export interface BatchTxOrder {
    uuid: string
    asset: AssetType
    amount: Big
}

export interface IssueTxInput {
    asset: AvaAsset
    assetId: string
    amount: BN
    toAddress: string
    changeAddresses: string[]
}

export interface ImportKeyfileInput {
    password: string
    data: AllKeyFileTypes
}

export interface ExportWalletsInput {
    password: string
    wallets: AvaHdWallet[]
}

export type SessionPersistFile = SessionPersistKey[]

export interface SessionPersistKey {
    key: string
}

export interface AccessWalletMultipleInput {
    type: Extract<'mnemonic' | 'singleton', WalletNameType>
    key: string
}
