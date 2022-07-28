import { Module } from 'vuex'
import {
    AccessAccountInput,
    ImportKeyfileInput,
    iUserAccountEncrypted,
    RootState,
    SaveAccountInput,
} from '@/store/types'
import { AccountsState, ChangePasswordInput } from '@/store/modules/accounts/types'
import { WalletType } from '@/js/wallets/types'
import {
    addAccountToStorage,
    getAccountByIndex,
    getLocalStorageAccounts,
    overwriteAccountAtIndex,
    removeAccountByIndex,
    verifyAccountPassword,
} from '@/helpers/account_helper'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import { SingletonWallet } from '@/js/wallets/SingletonWallet'
import { makeKeyfile } from '@/js/Keystore'
import { checkVerificationStatus } from '@/kyc_api'

const accounts_module: Module<AccountsState, RootState> = {
    namespaced: true,
    state: {
        accounts: [],
        accountIndex: null,
        kycStatus: false,
    },
    mutations: {
        loadAccounts(state) {
            state.accounts = getLocalStorageAccounts()
        },
    },
    actions: {
        onLogout({ state }) {
            state.accountIndex = null
        },

        async accessAccount({ state, dispatch }, input: AccessAccountInput) {
            let index = input.index
            let pass = input.pass

            let account = getAccountByIndex(index)
            if (!account) throw new Error('Account not found.')

            let data: ImportKeyfileInput = {
                password: pass,
                data: account.wallet,
            }

            await dispatch('importKeyfile', data, { root: true })
            state.accountIndex = index
        },

        // Creates a keystore file and saves to local storage
        async saveAccount({ state, dispatch, commit, getters, rootState }, data: SaveAccountInput) {
            try {
                // If this is an active account, get its index
                let activeAccount = getters.account
                let accountIndex = state.accountIndex
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
                if (accountIndex != null) {
                    overwriteAccountAtIndex(encryptedWallet, accountIndex)
                } else {
                    addAccountToStorage(encryptedWallet)
                }

                // No more volatile wallets
                rootState.volatileWallets = []
                commit('loadAccounts')
                state.accountIndex = state.accounts.length - 1
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
            let index = state.accountIndex

            if (!acct || !index) return

            removeAccountByIndex(index)
            state.accountIndex = null

            // Update accounts
            commit('loadAccounts')
        },

        async changePassword({ state, getters, dispatch }, input: ChangePasswordInput) {
            let index = state.accountIndex
            let account: iUserAccountEncrypted = getters.account

            if (!account || !index) return

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
        async saveKeys({ dispatch, getters, state }, pass: string) {
            let index = state.accountIndex
            let account: iUserAccountEncrypted = getters.account

            if (!index) return

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

        // Remove the selected key from account and update local storage
        async deleteKey({ state, getters, rootState, commit }, wallet: WalletType) {
            if (!getters.account) return
            let delIndex = rootState.wallets.indexOf(wallet)
            let acctIndex = state.accountIndex
            let acct: iUserAccountEncrypted = getters.account

            if (!acctIndex) throw new Error('Account not found.')

            acct.baseAddresses.splice(delIndex, 1)
            acct.wallet.keys.splice(delIndex, 1)

            overwriteAccountAtIndex(acct, acctIndex)
            commit('loadAccounts')
        },

        async updateKycStatus({ state, rootState }) {
            const wallet = rootState.activeWallet
            if (!wallet) return
            state.kycStatus = await checkVerificationStatus('0x' + wallet.ethAddress)
        },
    },
    getters: {
        hasAccounts(state: AccountsState, getters) {
            return state.accounts.length > 0
        },

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

        account(state: AccountsState, getters): iUserAccountEncrypted | null {
            if (state.accountIndex === null) return null
            return state.accounts[state.accountIndex]
        },

        kycStatus(state: AccountsState): boolean {
            return state.kycStatus
        },
    },
}

export default accounts_module
