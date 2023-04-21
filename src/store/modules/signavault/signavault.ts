import { MultisigTx, SignavaultState } from './types'
import { SignaVaultTx } from '@/signavault_api'
import { Module } from 'vuex'
import { RootState } from '@/store/types'
import { MultisigWallet } from '@/js/wallets/MultisigWallet'

const signavault_module: Module<SignavaultState, RootState> = {
    namespaced: true,
    state: {
        transactions: [],
    },
    getters: {
        transactions(state) {
            return state.transactions
        },
        transaction: (state) => (txID: string) => {
            return state.transactions.find((t) => t.tx.id === txID)
        },
    },
    mutations: {
        clear(state) {
            state.transactions = []
        },
        setTx(state, newTx: MultisigTx[]) {
            state.transactions = newTx
        },
    },
    actions: {
        async updateTransaction({ commit, rootState, rootGetters }) {
            const wallet = rootState.activeWallet
            if (!wallet || !(wallet instanceof MultisigWallet)) return commit('clear')

            if (wallet.wallets.length === 0) {
                console.log('no signing wallets connected')
                return commit('clear')
            }
            const signingKeyPair = wallet.wallets[0].getStaticKeyPair()
            if (!signingKeyPair) {
                console.log('wallet returned undefined staticKeyPair')
                return commit('clear')
            }

            const network = rootGetters['Network/selectedNetwork']
            if (!network) return commit('clear')

            try {
                const newTx = await SignaVaultTx(wallet.getStaticAddress('P'), signingKeyPair)
                commit(
                    'setTx',
                    newTx.map(
                        (mms): MultisigTx => ({
                            tx: mms,
                            state: wallet.getSignatureStatus(mms),
                        })
                    )
                )
            } catch (e: any) {
                return commit('clear')
            }
        },
    },
}

export default signavault_module
