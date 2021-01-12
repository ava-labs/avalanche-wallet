export interface ILedgerBlockMessage {
    title: string
    value: string
}

export interface LedgerState {
    isBlock: boolean
    messages?: Array<ILedgerBlockMessage>
    title: string
    info: string
}
