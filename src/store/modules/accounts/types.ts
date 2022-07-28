import { iUserAccountEncrypted } from '@/store/types'

export interface AccountsState {
    accounts: iUserAccountEncrypted[]
    accountIndex: null | number
    kycStatus: boolean
}

export interface ChangePasswordInput {
    passNew: string
    passOld: string
}
