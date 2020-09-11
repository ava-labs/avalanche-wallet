export interface ValidatorRaw{
    connection: boolean
    endTime: string
    nodeID: string
    stakeAmount: string
    startTime: string
    uptime: string
    delegationFee: string
    potentialReward: string
    rewardOwner: ValidatorRewardOwner
}

export interface DelegatorRaw{
    endTime: string
    nodeID: string
    potentialReward: string
    rewardOwner: ValidatorRewardOwner
    stakeAmount: string
    startTime: string
}

export interface ValidatorRewardOwner{
    addresses: string[],
    locktime: string,
    threshold: string
}

export interface GetValdiatorsResponse{
    validators: ValidatorRaw[]
    delegators: ValidatorRaw[]
}

export interface ValidatorDict {
    [nodeId: string]: ValidatorRaw
}
