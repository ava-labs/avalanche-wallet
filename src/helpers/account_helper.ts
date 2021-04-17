import { iUserAccountEncrypted } from '@/store/types'
import { WalletType } from '@/js/wallets/types'
import isEqual from 'lodash.isequal'
import differenceBy from 'lodash.differenceby'

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
export const removeAccountByIndex = (index: number): void => {
    const accounts: iUserAccountEncrypted[] = getLocalStorageJSONItem('accounts')
    accounts.splice(index, 1)
    saveLocalStorageJSONItem('accounts', accounts)
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

export const getIndexByWallet = (wallet: WalletType[]) => {
    let ethAddressArray: string[] = wallet.map((x: WalletType) => x.ethAddress)
    const savedAccounts: iUserAccountEncrypted[] = getLocalStorageJSONItem('accounts')
    let index = 0
    for (const each of savedAccounts) {
        if (isEqual(each.baseAddresses, ethAddressArray)) {
            return index
        }
        index++
    }
}

export const getNonVolatileWallets = (
    allWallets: WalletType[],
    volatileWallets: WalletType[]
): WalletType[] | [] => {
    let diff = differenceBy(allWallets, volatileWallets, 'ethAddress')
    diff === undefined ? [] : diff
    return diff
}

export default {
    removeAccountByID,
    removeAccountByIndex,
    checkIfSavedLocally,
    getNonVolatileWallets,
    getIndexByWallet,
}
