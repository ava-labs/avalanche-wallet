import { iUserAccountEncrypted } from '@/store/types'
import { WalletType } from '@/js/wallets/types'
import isEqual from 'lodash.isequal'

const checkAccountsExist = (): boolean => {
    return localStorage.getItem('accounts') !== null
}

export const removeAccountByID = (baseAddresses: string[]) => {
    let old: iUserAccountEncrypted[] = getLocalStorageJSONItem('accounts')
    let updatedAccountsArray: iUserAccountEncrypted[] = []

    for (const each of old) {
        const addressArray: any = each.baseAddresses
        if (!isEqual(baseAddresses, addressArray)) {
            updatedAccountsArray.push(each)
        }
    }

    saveLocalStorageJSONItem('accounts', updatedAccountsArray)
}

export const getAccountByBaseAddresses = (
    baseAddresses: string
): iUserAccountEncrypted | undefined => {
    let accounts: iUserAccountEncrypted[] = getLocalStorageJSONItem('accounts')

    for (const each of accounts) {
        const match = each.baseAddresses[0] === baseAddresses
        if (match) {
            return each
        }
    }
    return
}

export const checkIfSavedLocally = (allWallets: WalletType[]): boolean => {
    const exists = checkAccountsExist()

    if (!exists) return false

    let ethAddressArray: string[] = allWallets.map((x: WalletType) => x.ethAddress)

    const savedAccounts: iUserAccountEncrypted[] = getLocalStorageJSONItem('accounts')

    for (const each of savedAccounts) {
        if (isEqual(each.baseAddresses, ethAddressArray)) {
            return true
        }
    }

    return false
}

export const getLocalStorageJSONItem = (key: string) => {
    let item = localStorage.getItem(key)
    if (item !== null) {
        return JSON.parse(item)
    }
}
export const saveLocalStorageJSONItem = (key: string, data: any) => {
    let formatted = JSON.stringify(data)
    localStorage.setItem(key, formatted)
}

export default {
    removeAccountByID,
    checkIfSavedLocally,
    getAccountByBaseAddresses,
}
