import { Module } from 'vuex'
import { iUserAccountEncrypted, RootState, SaveAccountInput } from '@/store/types'
import { AccountsState, ChangePasswordInput } from '@/store/modules/accounts/types'
import { WalletType } from '@/js/wallets/types'
import {
    addAccountToStorage,
    checkIfSavedLocally,
    getAccountByIndex,
    getIndexByWallets,
    getLocalStorageAccounts,
    removeAccountByIndex,
    verifyAccountPassword,
} from '@/helpers/account_helper'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import { SingletonWallet } from '@/js/wallets/SingletonWallet'
import { makeKeyfile } from '@/js/Keystore'
import isEqual from 'lodash.isequal'

const accounts_module: Module<AccountsState, RootState> = {
    namespaced: true,
    state: {
        accounts: [],
        accountIndex: null,
        isSavedLocally: false,
    },
    mutations: {
        loadAccounts(state) {
            state.accounts = getLocalStorageAccounts()
        },
        accountSavedLocally(state, wallets: WalletType[]) {
            state.isSavedLocally = checkIfSavedLocally(wallets)
        },
        // updateAccountIndex(){
        //     let accounts = state.accounts
        //     let baseAddrs = getters.baseAddressesNonVolatile
        //
        //     for (var i = 0; i < accounts.length; i++) {
        //         let acct = accounts[i]
        //         console.log(acct.baseAddresses, baseAddrs)
        //         if (isEqual(acct.baseAddresses, baseAddrs)) {
        //             return i
        //         }
        //     }
        //     return null
        // }
        // addAccountToStorage(state: AccountsState, encodedWallet: iUserAccountEncrypted) {
        //     let accountsRaw = localStorage.getItem('accounts')
        //     let accounts: iUserAccountEncrypted[] = []
        //     if (accountsRaw !== null) {
        //         accounts = JSON.parse(accountsRaw)
        //     }
        //     accounts.push(encodedWallet)
        //     localStorage.setItem('accounts', JSON.stringify(accounts))
        // },
    },
    actions: {
        onLogout({ state }) {
            state.isSavedLocally = false
        },
        // Creates a keystore file and saves to local storage
        async saveAccount({ state, dispatch, commit, getters, rootState }, data: SaveAccountInput) {
            try {
                // If this is an active account, get its index
                let accountIndex = getters.accountIndex
                let activeAccount = getters.account
                let wallet = rootState.activeWallet as MnemonicWallet | SingletonWallet | null
                let pass = data.password
                if (!pass || wallet?.type === 'ledger') return

                let wallets = rootState.wallets as (MnemonicWallet | SingletonWallet)[]

                if (!wallet) throw new Error('No active wallet.')
                let activeIndex = wallets.findIndex((w) => w.id == wallet!.id)

                let file = await makeKeyfile(wallets, pass, activeIndex)
                let baseAddresses = getters.baseAddresses
                let encryptedWallet: iUserAccountEncrypted = {
                    baseAddresses,
                    name: activeAccount?.name || data.accountName,
                    wallet: file,
                }

                // Remove old account, add new one
                if (accountIndex) {
                    removeAccountByIndex(accountIndex)
                }
                addAccountToStorage(encryptedWallet)
                // commit('addAccountToStorage', encryptedWallet)

                // No more volatile wallets
                rootState.volatileWallets = []
                commit('loadAccounts')
                commit('accountSavedLocally', rootState.wallets)
            } catch (e) {
                dispatch('Notifications/add', {
                    title: 'Account Save',
                    message: 'Error Saving Account.',
                    type: 'error',
                })
            }
        },

        // If there is an active account, will remove it from local storage
        async deleteAccount({ state, dispatch, getters, commit }, password) {
            let acct = getters.account

            let passCorrect = await verifyAccountPassword(acct, password)
            if (!passCorrect) throw new Error('Invalid password.')

            let index = getters.accountIndex
            removeAccountByIndex(index)
            // Update accounts
            commit('loadAccounts')
        },

        async changePassword({ state, getters, dispatch }, input: ChangePasswordInput) {
            let index = getters.accountIndex
            let account: iUserAccountEncrypted = getters.account

            if (!account) return

            let oldPassCorrect = await verifyAccountPassword(account, input.passOld)
            if (!oldPassCorrect) throw new Error('Previous password invalid.')

            // Remove current wallet file
            removeAccountByIndex(index)
            // Save with new password
            dispatch('saveAccount', {
                password: input.passNew,
                accountName: account.name,
            })
        },

        // Used to save volatile keys into the active account
        async saveKeys({ dispatch, getters }, pass: string) {
            let index = getters.accountIndex
            let account: iUserAccountEncrypted = getters.account

            if (!account) return

            let passCorrect = await verifyAccountPassword(account, pass)
            if (!passCorrect) throw new Error('Invalid password.')

            // Remove current wallet file
            removeAccountByIndex(index)
            // Save with volatile keys
            dispatch('saveAccount', {
                password: pass,
                accountName: account.name,
            })
        },
    },
    getters: {
        baseAddresses(state: AccountsState, getters, rootState: RootState) {
            let wallets = rootState.wallets
            return wallets.map((w: WalletType) => {
                return w.getEvmAddress()
            })
        },

        baseAddressesNonVolatile(state: AccountsState, getters, rootState: RootState) {
            let wallets = rootState.wallets.filter((w) => {
                return !rootState.volatileWallets.includes(w)
            })

            return wallets.map((w: WalletType) => {
                return w.getEvmAddress()
            })
        },

        accountIndex(state: AccountsState, getters, rootState: RootState): number | null {
            let accounts = state.accounts
            let baseAddrs = getters.baseAddressesNonVolatile

            for (var i = 0; i < accounts.length; i++) {
                let acct = accounts[i]
                if (isEqual(acct.baseAddresses, baseAddrs)) {
                    return i
                }
            }
            return null
        },

        account(state: AccountsState, getters): iUserAccountEncrypted | null {
            let index = getters.accountIndex
            if (index === null) return null
            return state.accounts[index]
        },
    },
}

export default accounts_module
