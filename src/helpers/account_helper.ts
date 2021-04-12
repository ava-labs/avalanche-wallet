import { iUserAccountEncrypted } from '@/store/types.ts'

import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import isEqual from 'lodash.isequal'

const checkAccountsExist = (): boolean => {
    return localStorage.getItem('accounts') !== null
}

export const removeAccountByID = (baseAddresses: string[]) => {
    let old: iUserAccountEncrypted[] = getLocalStorageItem('accounts')
    let updatedAccountsArray: iUserAccountEncrypted[] = []

    for (const each of old) {
        const addressArray: any = each.baseAddresses
        if (!isEqual(baseAddresses, addressArray)) {
            updatedAccountsArray.push(each)
        }
    }

    saveLocalStorageItem('accounts', updatedAccountsArray)
}

export const getAccountByBaseAddresses = (
    baseAddresses: string
): iUserAccountEncrypted | undefined => {
    let accounts: iUserAccountEncrypted[] = getLocalStorageItem('accounts')

    for (const each of accounts) {
        const match = each.baseAddresses[0] === baseAddresses
        if (match) {
            return each
        }
    }
    return
}

export const checkIfSavedLocally = (allWallets: any): boolean => {
    const exists = checkAccountsExist()

    if (!exists) return false

    let ethAddressArray: string[] = []
    allWallets.map((x: MnemonicWallet) => {
        ethAddressArray.push(x.ethAddress)
    })

    const savedAccounts: iUserAccountEncrypted[] = getLocalStorageItem('accounts')

    for (const each of savedAccounts) {
        if (isEqual(each.baseAddresses, ethAddressArray)) {
            return true
        }
    }

    return false
}

export const getLocalStorageItem = (key: string) => {
    let item = localStorage.getItem(key)
    if (item !== null) {
        return JSON.parse(item)
    }
}
export const saveLocalStorageItem = (key: string, data: any) => {
    let formatted = JSON.stringify(data)
    localStorage.setItem(key, formatted)
}

export default {
    removeAccountByID,
    checkIfSavedLocally,
    getAccountByBaseAddresses,
}
