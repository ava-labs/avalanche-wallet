export interface ILedgerBlockMessage {
    title: string
    value: string
}

export interface LedgerState {
    isBlock: boolean
    isPrompt: boolean
    isUpgradeRequired: boolean
    messages: ILedgerBlockMessage[]
    title: string
    info: string
}
