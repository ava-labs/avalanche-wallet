import {DelegatorRaw, ValidatorRaw} from "@/components/misc/ValidatorList/types";

export interface PlatformState {
    validators: ValidatorRaw[];
    validatorsPending: ValidatorRaw[];
    delegators: DelegatorRaw[];
    delegatorsPending: DelegatorRaw[];
}

export interface GetValidatorsResponse {
    validators: ValidatorRaw[],
    delegators : DelegatorRaw[],
}

export interface ValidatorDict {
    [nodeId: string]: ValidatorRaw
}
