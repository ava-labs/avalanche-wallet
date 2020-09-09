import {ValidatorRaw} from "@/components/misc/ValidatorList/types";

export interface PlatformState {
    validators: ValidatorRaw[];
}

export interface ValidatorDict {
    [nodeId: string]: ValidatorRaw
}
