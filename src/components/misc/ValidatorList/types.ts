export interface ValidatorRaw{
    endTime: string
    nodeID: string
    stakeAmount: string
    startTime: string
    uptime: string
}

export interface ValidatorDict {
    [nodeId: string]: ValidatorRaw
}
