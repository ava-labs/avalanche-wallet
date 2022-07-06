import Big from 'big.js'

import { Buffer, BN } from '@c4tplatform/camino'
import AvaAsset from '@/js/AvaAsset'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import { ITransaction } from '@/components/wallet/transfer/types'
import { AllKeyFileTypes, AllKeyFileDecryptedTypes } from '@/js/IKeystore'
import { UTXO } from '@c4tplatform/camino/dist/apis/avm'
import { UTXO as TxUTXO } from './modules/history/types'
import { WalletNameType, WalletType } from '@/js/wallets/types'

export interface RootState {
    isAuth: boolean
    activeWallet: null | WalletType
    wallets: WalletType[]
    address: String | null
    volatileWallets: WalletType[] // will be forgotten when tab is closed
    warnUpdateKeyfile: boolean
    prices: priceDict // USD value of 1 native token
}

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
    wallets: MnemonicWallet[]
}

export type SessionPersistFile = SessionPersistKey[]

export interface SessionPersistKey {
    key: string
}

export interface AccessWalletMultipleInput {
    type: Extract<'mnemonic' | 'singleton', WalletNameType>
    key: string
}

export interface SaveAccountInput {
    password: string
    accountName: string
}

export interface AccessAccountInput {
    index: number
    pass: string
}

export interface iUserAccountEncrypted {
    name: string
    baseAddresses: string[]
    wallet: AllKeyFileTypes
}

export interface iUserAccountDecrypted {
    name: string
    baseAddresses: string[]
    wallet: AllKeyFileDecryptedTypes
}
