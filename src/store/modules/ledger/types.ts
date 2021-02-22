export interface ILedgerBlockMessage {
    title: string
    value: string
}

export interface LedgerState {
    isBlock: boolean
    isPrompt: boolean
    isUpgradeRecommended: boolean
    messages: ILedgerBlockMessage[]
    title: string
    info: string
}
