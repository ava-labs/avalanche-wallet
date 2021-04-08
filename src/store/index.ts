import Vue from 'vue'
import Vuex from 'vuex'

import * as bip39 from 'bip39'

import Assets from './modules/assets/assets'
import Network from './modules/network/network'
import Notifications from './modules/notifications/notifications'
import History from './modules/history/history'
import Platform from './modules/platform/platform'
import Ledger from './modules/ledger/ledger'

import {
    RootState,
    IssueBatchTxInput,
    ImportKeyfileInput,
    ExportWalletsInput,
    WalletType,
    AccessWalletMultipleInput,
    SaveAccountInput,
    iUserAccountEncrypted,
} from '@/store/types'

import { AllKeyFileDecryptedTypes, KeyFileV6 } from '@/js/IKeystore'

Vue.use(Vuex)

import router from '@/router'

import { avm, bintools } from '@/AVA'
import AvaHdWallet from '@/js/wallets/AvaHdWallet'

import { UnixNow } from 'avalanche/dist/utils'
import { UTXO, KeyPair as AVMKeyPair, AmountOutput, NFTMintOutput } from 'avalanche/dist/apis/avm'
import { UTXOSet as PlatformUTXOSet } from 'avalanche/dist/apis/platformvm'

import AvaAsset from '@/js/AvaAsset'
import {
    extractKeysFromDecryptedFile,
    KEYSTORE_VERSION,
    makeKeyfile,
    readKeyFile,
} from '@/js/Keystore'
import { AssetsDict } from '@/store/modules/assets/types'
import { keyToKeypair } from '@/helpers/helper'
import BN from 'bn.js'
import { LedgerWallet } from '@/js/wallets/LedgerWallet'
import { StakeableLockOut } from 'avalanche/dist/apis/platformvm'
import { wallet_api } from '@/wallet_api'
import { SingletonWallet } from '@/js/wallets/SingletonWallet'
import Wallet from '@/views/Wallet.vue'
import { Buffer } from 'avalanche'
import { privateToAddress } from 'ethereumjs-util'
import { checkIfSavedLocally } from '@/js/LocalStorage'

export default new Vuex.Store({
    modules: {
        Assets,
        Notifications,
        Network,
        History,
        Platform,
        Ledger,
    },
    state: {
        isAuth: false,
        activeWallet: null,
        address: null, // current active derived address
        wallets: [],
        volatileWallets: [], // will be forgotten when tab is closed
        warnUpdateKeyfile: false, // If true will promt the user the export a new keyfile
        prices: {
            usd: 0,
        },
        isSavedLocally: false,
    },
    getters: {
        addresses(state: RootState): string[] {
            let wallet = state.activeWallet
            if (!wallet) return []
            let addresses = wallet.getDerivedAddresses()
            return addresses
        },
        baseAddresses(state: RootState): string[] {
            let array: string[] = []
            const { wallets } = state
            wallets.map((x) => {
                array.push(x.ethAddress)
            })
            return array
        },
    },
    mutations: {
        updateActiveAddress(state) {
            if (!state.activeWallet) {
                state.address = null
            } else {
                let addrNow = state.activeWallet.getCurrentAddressAvm()
                state.address = addrNow
            }
        },
        addWalletToAccount(state, encodedWallet: iUserAccountEncrypted) {
            let accountsRaw = localStorage.getItem('accounts')
            let accounts: iUserAccountEncrypted[] = []
            if (accountsRaw !== null) {
                accounts = JSON.parse(accountsRaw)
            }
            accounts.push(encodedWallet)
            localStorage.setItem('accounts', JSON.stringify(accounts))
        },
        accountSavedLocally(state) {
            state.isSavedLocally = checkIfSavedLocally(state.wallets)
        },
    },
    actions: {
        // Used in home page to access a user's wallet
        // Used to access wallet with a single key
        // TODO rename to accessWalletMenmonic
        async accessWallet({ state, dispatch, commit }, mnemonic: string): Promise<AvaHdWallet> {
            let wallet: AvaHdWallet = await dispatch('addWalletMnemonic', mnemonic)
            await dispatch('activateWallet', wallet)

            dispatch('onAccess')
            return wallet
        },

        // Only for singletons and mnemonics
        async accessWalletMultiple(
            { state, dispatch, commit },
            {
                keys: keyList,
                activeIndex,
            }: { keys: AccessWalletMultipleInput[]; activeIndex: number }
        ) {
            for (var i = 0; i < keyList.length; i++) {
                try {
                    let keyInfo = keyList[i]
                    if (keyInfo.type === 'mnemonic') {
                        await dispatch('addWalletMnemonic', keyInfo.key)
                    } else {
                        await dispatch('addWalletSingleton', keyInfo.key)
                    }
                } catch (e) {
                    continue
                }
            }

            await dispatch('activateWallet', state.wallets[activeIndex])

            dispatch('onAccess')
        },

        async accessWalletLedger({ state, dispatch }, wallet: LedgerWallet) {
            state.wallets = [wallet]

            await dispatch('activateWallet', wallet)

            dispatch('onAccess')
        },

        async accessWalletSingleton({ state, dispatch }, key: string) {
            let wallet = await dispatch('addWalletSingleton', key)
            await dispatch('activateWallet', wallet)

            dispatch('onAccess')
        },

        async onAccess(store) {
            store.state.isAuth = true

            store.dispatch('Assets/updateAvaAsset')
            store.dispatch('Platform/update')
            router.push('/wallet')
            store.dispatch('Assets/updateUTXOs')
        },

        // TODO: Parts can be shared with the logout function below
        // Similar to logout but keeps the Remembered keys.
        async timeoutLogout(store) {
            store.dispatch('removeAllKeys')
            await store.dispatch('Notifications/add', {
                title: 'Session Timeout',
                message: 'You are logged out due to inactivity.',
                type: 'warning',
            })

            // Remove other data
            store.state.isAuth = false
            store.state.activeWallet = null
            store.state.address = null
            store.state.warnUpdateKeyfile = false

            await store.dispatch('Assets/onlogout')
            await store.commit('History/clear')

            router.push('/')
        },

        async logout(store) {
            // Clear local storage
            localStorage.removeItem('w')

            // Remove other data
            store.state.isAuth = false
            store.state.activeWallet = null
            store.state.address = null
            store.state.warnUpdateKeyfile = false

            router.push('/')

            // Delete keys
            store.dispatch('removeAllKeys')

            // Clear Assets
            await store.dispatch('Assets/onlogout')
            await store.commit('History/clear')
        },

        // used with logout
        async removeAllKeys({ state, dispatch }) {
            let wallets = state.wallets

            while (wallets.length > 0) {
                let wallet = wallets[0]
                await dispatch('removeWallet', wallet)

                dispatch('Notifications/add', {
                    title: 'Key Removed',
                    message: 'Private key and assets removed from the wallet.',
                })
            }

            state.wallets = []
            state.volatileWallets = []
            state.isSavedLocally = false
        },

        // Add a HD wallet from mnemonic string
        async addWalletMnemonic(
            { state, dispatch },
            mnemonic: string
        ): Promise<AvaHdWallet | null> {
            // Cannot add mnemonic wallets on ledger mode
            if (state.activeWallet?.type === 'ledger') return null

            // Make sure wallet doesnt exist already
            for (var i = 0; i < state.wallets.length; i++) {
                let w = state.wallets[i] as WalletType
                if (w.type === 'mnemonic') {
                    if ((w as AvaHdWallet).mnemonic === mnemonic) {
                        throw new Error('Wallet already exists.')
                    }
                }
            }

            let wallet = new AvaHdWallet(mnemonic)
            state.wallets.push(wallet)
            state.volatileWallets.push(wallet)
            return wallet
        },

        // Add a singleton wallet from private key string
        async addWalletSingleton({ state, dispatch }, pk: string): Promise<SingletonWallet | null> {
            try {
                let keyBuf = Buffer.from(pk, 'hex')
                // @ts-ignore
                privateToAddress(keyBuf)
                pk = `PrivateKey-${bintools.cb58Encode(keyBuf)}`
            } catch (e) {
                //
            }

            // Cannot add singleton wallets on ledger mode
            if (state.activeWallet?.type === 'ledger') return null

            // Make sure wallet doesnt exist already
            for (var i = 0; i < state.wallets.length; i++) {
                let w = state.wallets[i] as WalletType
                if (w.type === 'singleton') {
                    if ((w as SingletonWallet).key === pk) {
                        throw new Error('Wallet already exists.')
                    }
                }
            }

            let wallet = new SingletonWallet(pk)
            state.wallets.push(wallet)
            state.volatileWallets.push(wallet)
            return wallet
        },

        removeWallet({ state, dispatch }, wallet: AvaHdWallet) {
            // TODO: This might cause an error use wallet id instead
            let index = state.wallets.indexOf(wallet)
            state.wallets.splice(index, 1)
        },

        // Creates a keystore file and saves to local storage
        async saveAccount({ state, dispatch, commit, getters }, data: SaveAccountInput) {
            try {
                let wallet = state.activeWallet as AvaHdWallet | SingletonWallet | null
                let pass = data.password
                if (!pass || wallet?.type === 'ledger') return

                let wallets = state.wallets as AvaHdWallet[]
                if (!wallet) throw new Error('No active wallet.')
                let activeIndex = wallets.findIndex((w) => w.id == wallet!.id)

                let file = await makeKeyfile(wallets, pass, activeIndex)
                let baseAddresses = getters.baseAddresses
                let encryptedWallet: iUserAccountEncrypted = {
                    baseAddress: baseAddresses,
                    name: data.accountName,
                    wallet: file,
                }

                commit('addWalletToAccount', encryptedWallet)

                dispatch('Notifications/add', {
                    title: 'Account Saved',
                    message: 'Your Accounts are stored securely for easy access.',
                    type: 'info',
                })

                // No more voltile wallets
                state.volatileWallets = []
                commit('accountSavedLocally')
            } catch (e) {
                dispatch('Notifications/add', {
                    title: 'Account Save',
                    message: 'Error Saving Account.',
                    type: 'error',
                })
            }
        },

        async issueBatchTx({ state }, data: IssueBatchTxInput) {
            let wallet = state.activeWallet
            if (!wallet) return 'error'

            let toAddr = data.toAddress
            let orders = data.orders
            let memo = data.memo

            try {
                let txId: string = await wallet.issueBatchTx(orders, toAddr, memo)
                return txId
            } catch (e) {
                throw e
            }
        },

        async activateWallet({ state, dispatch, commit }, wallet: AvaHdWallet | LedgerWallet) {
            state.activeWallet = wallet

            dispatch('Assets/updateAvaAsset')
            commit('updateActiveAddress')
            dispatch('History/updateTransactionHistory')
            commit('accountSavedLocally')
        },

        async exportWallets({ state, dispatch }, input: ExportWalletsInput) {
            try {
                let pass = input.password
                let wallets = input.wallets
                let wallet = state.activeWallet as AvaHdWallet | SingletonWallet | null
                if (!wallet) throw new Error('No active wallet.')
                let activeIndex = wallets.findIndex((w) => w.id == wallet!.id)

                let file_data = await makeKeyfile(wallets, pass, activeIndex)

                // Download the file
                let text = JSON.stringify(file_data)
                // let addr = file_data.keys[0].address.substr(2,5);

                let utcDate = new Date()
                let dateString = utcDate.toISOString().replace(' ', '_')
                let filename = `AVAX_${dateString}.json`

                var blob = new Blob([text], {
                    type: 'application/json',
                })
                let url = URL.createObjectURL(blob)
                var element = document.createElement('a')

                element.setAttribute('href', url)
                element.setAttribute('download', filename)
                element.style.display = 'none'
                document.body.appendChild(element)
                element.click()
                document.body.removeChild(element)
            } catch (e) {
                dispatch('Notifications/add', {
                    title: 'Export Wallet',
                    message: 'Error exporting wallet.',
                    type: 'error',
                })
            }
        },

        // Given a key file with password, will try to decrypt the file and add keys to user's
        // key chain
        async importKeyfile(store, data: ImportKeyfileInput) {
            let pass = data.password
            let fileData = data.data

            let version = fileData.version

            try {
                // Decrypt the key file with the password
                let keyFile: AllKeyFileDecryptedTypes = await readKeyFile(fileData, pass)
                // Extract wallet keys
                let keys = extractKeysFromDecryptedFile(keyFile)

                // If not auth, login user then add keys
                if (!store.state.isAuth) {
                    await store.dispatch('accessWalletMultiple', {
                        keys,
                        activeIndex: keyFile.activeIndex,
                    })
                } else {
                    for (let i = 0; i < keys.length; i++) {
                        let key = keys[i]

                        // Private keys from the keystore file do not have the PrivateKey- prefix
                        if (key.type === 'mnemonic') {
                            await store.dispatch('addWalletMnemonic', key.key)
                        } else if (key.type === 'singleton') {
                            await store.dispatch('addWalletSingleton', key.key)
                        }
                    }
                }

                // Keystore warning flag asking users to update their keystore files;
                store.state.warnUpdateKeyfile = false
                if (version !== KEYSTORE_VERSION) {
                    store.state.warnUpdateKeyfile = true
                }
                store.state.volatileWallets = []

                return {
                    success: true,
                    message: 'success',
                }
            } catch (err) {
                throw err
            }
        },

        async updateAvaxPrice(store) {
            wallet_api.get('/price').then((res) => {
                let prices = res.data
                store.state.prices = prices
            })
        },
    },
})
