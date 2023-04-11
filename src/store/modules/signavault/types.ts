import { ModelMultisigTx } from '@/signavault_api'

export interface SignavaultState {
    transactions: MultisigTx[]
}

export interface MultisigTx {
    tx: ModelMultisigTx
    state: number
}
