import { iUserAccountEncrypted } from '@/store/types'
import { WalletType } from '@/js/wallets/types'
import isEqual from 'lodash.isequal'
import differenceBy from 'lodash.differenceby'
import { readKeyFile } from '@/js/Keystore'

const checkAccountsExist = (): boolean => {
    return localStorage.getItem('accounts') !== null
}

export function getAccountByIndex(index: number): iUserAccountEncrypted | null {
    return getLocalStorageAccounts()[index] || null
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
    const accounts: iUserAccountEncrypted[] = getLocalStorageAccounts()
    accounts.splice(index, 1)
    saveLocalStorageJSONItem('accounts', accounts)
}

export const getLocalStorageJSONItem = (key: string) => {
    let item = localStorage.getItem(key)
    if (item !== null) {
        return JSON.parse(item)
    }
}

export function getLocalStorageAccounts(): iUserAccountEncrypted[] {
    return getLocalStorageJSONItem('accounts') || []
}

export const saveLocalStorageJSONItem = (key: string, data: any) => {
    let formatted = JSON.stringify(data)
    localStorage.setItem(key, formatted)
}

export const getIndexByWallets = (wallets: WalletType[]): number | null => {
    let ethAddressArray: string[] = wallets.map((x: WalletType) => x.getEvmAddress())
    const savedAccounts: iUserAccountEncrypted[] = getLocalStorageAccounts()
    let index = 0
    for (var i = 0; i < savedAccounts.length; i++) {
        let acct = savedAccounts[i]
        if (isEqual(acct.baseAddresses, ethAddressArray)) {
            return index
        }
    }
    return null
}

export const getNonVolatileWallets = (
    allWallets: WalletType[],
    volatileWallets: WalletType[]
): WalletType[] | [] => {
    let diff = differenceBy(allWallets, volatileWallets, 'ethAddress')
    diff === undefined ? [] : diff
    return diff
}

export function addAccountToStorage(account: iUserAccountEncrypted) {
    let accounts = getLocalStorageAccounts()
    accounts.push(account)
    saveLocalStorageJSONItem('accounts', accounts)
}

// Given a password and an account, will verify if its the correct password
export async function verifyAccountPassword(account: iUserAccountEncrypted, password: string) {
    try {
        let res = await readKeyFile(account.wallet, password)
        return true
    } catch (err) {
        return false
    }
}

export function overwriteAccountAtIndex(newAccount: iUserAccountEncrypted, index: number) {
    let accts = getLocalStorageAccounts()
    accts.splice(index, 1, newAccount)
    saveLocalStorageJSONItem('accounts', accts)
}

export default {
    removeAccountByIndex,
    checkIfSavedLocally,
    getNonVolatileWallets,
}
