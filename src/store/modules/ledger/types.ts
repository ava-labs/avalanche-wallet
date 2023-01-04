export interface ILedgerBlockMessage {
    title: string
    value: string
}

export interface LedgerModalConfig {
    title: string
    info: string
    messages: ILedgerBlockMessage[]
    isPrompt?: boolean
    warning?: string
}

export interface LedgerState {
    isBlock: boolean
    isPrompt: boolean
    isUpgradeRequired: boolean
    isWalletLoading: boolean
    messages: ILedgerBlockMessage[]
    title: string
    info: string
    warning: string | undefined
}

export const LEDGER_EXCHANGE_TIMEOUT = 90_000
