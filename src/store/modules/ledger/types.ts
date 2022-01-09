export interface ILedgerBlockMessage {
    title: string
    value: string
}

export interface LedgerState {
    isBlock: boolean
    isPrompt: boolean
    isUpgradeRequired: boolean
    isWalletLoading: boolean
    messages: ILedgerBlockMessage[]
    title: string
    info: string
}

export const LEDGER_EXCHANGE_TIMEOUT = 90_000
