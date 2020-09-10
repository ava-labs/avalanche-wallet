export interface ValidatorRaw{
    endTime: string
    nodeID: string
    stakeAmount: string
    startTime: string
    uptime: string
    delegationFeeRate: string
    rewardAddress: string
}

export interface GetValdiatorsResponse{
    validators: ValidatorRaw[]
    delegators?: ValidatorRaw[]
}

export interface ValidatorDict {
    [nodeId: string]: ValidatorRaw
}
