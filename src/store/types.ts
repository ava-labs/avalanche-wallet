import Big from 'big.js'

import { Buffer, BN } from 'avalanche'
import AvaAsset from '@/js/AvaAsset'
import AvaHdWallet from '@/js/wallets/AvaHdWallet'
import { ITransaction } from '@/components/wallet/transfer/types'
import { KeyFile } from '@/js/IKeystore'
import { UTXO } from 'avalanche/dist/apis/avm'
import { LedgerWallet } from '@/js/wallets/LedgerWallet'

export interface RootState {
    walletType: null | WalletType
    isAuth: boolean
    activeWallet: null | AvaHdWallet | LedgerWallet
    wallets: (LedgerWallet | AvaHdWallet)[] // TODO: these should not co exist
    address: String | null
    volatileWallets: AvaHdWallet[] // will be forgotten when tab is closed
    warnUpdateKeyfile: boolean
    prices: priceDict // USD value of 1 AVAX
}

export type WalletType = 'mnemonic' | 'ledger'

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
    data: KeyFile
}

export interface ExportWalletsInput {
    password: string
    wallets: AvaHdWallet[]
}

export type SessionPersistFile = SessionPersistKey[]

export interface SessionPersistKey {
    key: string
}
