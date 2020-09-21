import {DelegatorRaw, ValidatorRaw} from "@/components/misc/ValidatorList/types";
import {BN} from "avalanche";

export interface PlatformState {
    validators: ValidatorRaw[];
    validatorsPending: ValidatorRaw[];
    delegators: DelegatorRaw[];
    delegatorsPending: DelegatorRaw[];
    minStake: BN;
    minStakeDelegation: BN;
    currentSupply: BN;
}

export interface GetValidatorsResponse {
    validators: ValidatorRaw[],
    delegators : DelegatorRaw[],
}

export interface ValidatorDict {
    [nodeId: string]: ValidatorRaw
}
