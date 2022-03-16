export interface ISecuXBlockMessage {
    title: string
    value: string
}

export interface SecuXState {
    isBlock: boolean
    isPrompt: boolean
    isUpgradeRequired: boolean
    isWalletLoading: boolean
    messages: ISecuXBlockMessage[]
    title: string
    info: string
}

export const LEDGER_EXCHANGE_TIMEOUT = 90_000
