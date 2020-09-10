import {ValidatorRaw} from "@/components/misc/ValidatorList/types";

export interface PlatformState {
    validators: ValidatorRaw[];
    validatorsPending: ValidatorRaw[];
}

export interface ValidatorDict {
    [nodeId: string]: ValidatorRaw
}
