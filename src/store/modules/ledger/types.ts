export interface ILedgerBlockMessage {
    title: string
    value: string
}

export interface LedgerState {
    isBlock: boolean
    messages: ILedgerBlockMessage[]
    title: string
    info: string
}
