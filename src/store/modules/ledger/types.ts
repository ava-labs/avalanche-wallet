export type LedgerBlockMessageType = { title: string; value: string }

export interface LedgerState {
    isBlock: boolean
    messages?: Array<LedgerBlockMessageType>
    title: string
    info: string
}
