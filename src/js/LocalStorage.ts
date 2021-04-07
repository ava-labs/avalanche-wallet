import { iUserAccountEncrypted } from '@/store/types.ts'
import { SingletonWallet } from './wallets/SingletonWallet'
import isEqual from 'lodash.isequal'

const checkAccountsExist = (): boolean => {
    return localStorage.getItem('accounts') !== null
}

const isInArray = (value: string, array: string[]): boolean => {
    return array.indexOf(value) > -1
}

export const removeAccountByID = (baseAddress: string) => {
    let old: iUserAccountEncrypted[] = getLocalStorageItem('accounts')
    let updatedAccountsArray: iUserAccountEncrypted[] = []

    for (const each of old) {
        const addressArray: any = each.baseAddress
        if (!isInArray(baseAddress, addressArray)) {
            updatedAccountsArray.push(each)
        }
    }

    saveLocalStorageItem('accounts', updatedAccountsArray)
}

export const checkIfSavedLocally = (allWallets: SingletonWallet[]): boolean => {
    const exists = checkAccountsExist()

    if (!exists) return false

    let ethAddressArray: string[] = []
    allWallets.map((x) => {
        ethAddressArray.push(x.ethAddress)
    })

    const savedAccounts: iUserAccountEncrypted[] = getLocalStorageItem('accounts')

    for (const each of savedAccounts) {
        if (isEqual(each.baseAddress, ethAddressArray)) {
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
}
