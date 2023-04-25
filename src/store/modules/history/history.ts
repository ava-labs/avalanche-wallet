import { Module } from 'vuex'
import { RootState } from '@/store/types'
import { HistoryState } from '@/store/modules/history/types'
import { isMainnetNetworkID } from '@/store/modules/network/isMainnetNetworkID'
import { isTestnetNetworkID } from '@/store/modules/network/isTestnetNetworkID'
import { getGlacierHistory } from '@/store/modules/history/getGlacierHistory'

const history_module: Module<HistoryState, RootState> = {
    namespaced: true,
    state: {
        isUpdating: false,
        isError: false,
        isUpdatingAll: false,
        recentTransactions: [], // Used for the history sidepanel txs
        allTransactions: [], // Used for activity tab txs, paginates
    },
    mutations: {
        clear(state) {
            state.recentTransactions = []
            state.allTransactions = []
        },
    },
    actions: {
        /**
         * Updates Recent transactions history
         */
        async updateTransactionHistory({ state, rootState, rootGetters, dispatch }) {
            const wallet = rootState.activeWallet
            if (!wallet) return

            // If wallet is still loading delay
            // @ts-ignore
            const network = rootState.Network.selectedNetwork

            if (!wallet.isInit) {
                setTimeout(() => {
                    dispatch('updateTransactionHistory')
                }, 500)
                return false
            }

            // If not mainnet/testnet can not use explorer
            const isMainnet = isMainnetNetworkID(network.networkId)
            const isTestnet = isTestnetNetworkID(network.networkId)

            if (!isMainnet && !isTestnet) {
                return false
            }

            state.isUpdating = true
            const txs = await getGlacierHistory(wallet, network.networkId, isMainnet, 30)

            state.recentTransactions = txs
            state.isUpdating = false
        },

        async updateAllTransactionHistory({ state, rootState, rootGetters, dispatch }) {
            state.isError = false
            const wallet = rootState.activeWallet
            if (!wallet) return

            // If wallet is still loading delay
            // @ts-ignore
            const network = rootState.Network.selectedNetwork

            if (!wallet.isInit) {
                setTimeout(() => {
                    dispatch('updateAllTransactionHistory')
                }, 500)
                return false
            }

            // If not mainnet/testnet can not use explorer
            const isMainnet = isMainnetNetworkID(network.networkId)
            const isTestnet = isTestnetNetworkID(network.networkId)

            if (!isMainnet && !isTestnet) {
                return false
            }

            state.isUpdatingAll = true
            try {
                const txs = await getGlacierHistory(wallet, network.networkId, isMainnet)
                state.allTransactions = txs
            } catch (e) {
                console.log(e)
                state.isError = true
            }
            state.isUpdatingAll = false
        },
    },
    getters: {
        stakingTxs(state) {
            return state.allTransactions.filter((tx) => {
                const types = ['AddValidatorTx', 'AddDelegatorTx']
                if (types.includes(tx.txType)) {
                    return true
                }
                return false
            })
        },
    },
}

export default history_module
