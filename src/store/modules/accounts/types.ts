import { iUserAccountEncrypted } from '@/store/types'

export interface AccountsState {
    accounts: iUserAccountEncrypted[]
    isSavedLocally: boolean
    accountIndex: null | number
}

export interface ChangePasswordInput {
    passNew: string
    passOld: string
}
