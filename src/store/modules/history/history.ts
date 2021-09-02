import { Module } from 'vuex'
import { RootState } from '@/store/types'
import { getAddressHistory } from '@/explorer_api'
import moment from 'moment'

import { HistoryState, ITransactionData } from '@/store/modules/history/types'
import { avm, pChain } from '@/AVA'
import { filterDuplicateTransactions } from '@/helpers/history_helper'

const history_module: Module<HistoryState, RootState> = {
    namespaced: true,
    state: {
        isUpdating: false,
        isUpdatingAll: false,
        transactions: [], // Used for the history sidepanel txs
        allTransactions: [], // Used for activity tab txs, paginates
    },
    mutations: {
        clear(state) {
            state.transactions = []
            state.allTransactions = []
        },
    },
    actions: {
        async updateTransactionHistory({ state, rootState, rootGetters, dispatch }) {
            let wallet = rootState.activeWallet
            if (!wallet) return

            // If wallet is still loading delay
            // @ts-ignore
            let network = rootState.Network.selectedNetwork

            if (!wallet.isInit) {
                setTimeout(() => {
                    dispatch('updateTransactionHistory')
                }, 500)
                return false
            }

            // can't update if there is no explorer or no wallet
            if (!network || !network.explorerUrl || rootState.address === null) {
                return false
            }

            state.isUpdating = true

            let avmAddrs: string[] = wallet.getAllAddressesX()
            let pvmAddrs: string[] = wallet.getAllAddressesP()

            // this shouldnt ever happen, but to avoid getting every transaction...
            if (avmAddrs.length === 0) {
                state.isUpdating = false
                return
            }

            let limit = 20

            let txs = await getAddressHistory(avmAddrs, limit, avm.getBlockchainID())
            let txsP = await getAddressHistory(pvmAddrs, limit, pChain.getBlockchainID())

            let transactions = txs
                .concat(txsP)
                .sort((x, y) => (moment(x.timestamp).isBefore(moment(y.timestamp)) ? 1 : -1))

            state.transactions = transactions
            state.isUpdating = false
        },

        async updateAllTransactionHistory({ state, rootState, rootGetters, dispatch }) {
            let wallet = rootState.activeWallet
            if (!wallet) return

            // If wallet is still loading delay
            // @ts-ignore
            let network = rootState.Network.selectedNetwork

            if (!wallet.isInit) {
                setTimeout(() => {
                    dispatch('updateAllTransactionHistory')
                }, 500)
                return false
            }

            // can't update if there is no explorer or no wallet
            if (!network.explorerUrl || rootState.address === null) {
                return false
            }

            state.isUpdatingAll = true

            let avmAddrs: string[] = wallet.getAllAddressesX()
            let pvmAddrs: string[] = wallet.getAllAddressesP()

            // this shouldnt ever happen, but to avoid getting every transaction...
            if (avmAddrs.length === 0) {
                state.isUpdatingAll = false
                return
            }

            let limit = 0

            let txsX = await getAddressHistory(avmAddrs, limit, avm.getBlockchainID())
            let txsP = await getAddressHistory(pvmAddrs, limit, pChain.getBlockchainID())

            let txsXFiltered = filterDuplicateTransactions(txsX)
            let txsPFiltered = filterDuplicateTransactions(txsP)

            let transactions = txsXFiltered
                .concat(txsPFiltered)
                .sort((x, y) => (moment(x.timestamp).isBefore(moment(y.timestamp)) ? 1 : -1))

            state.allTransactions = transactions
            state.isUpdatingAll = false
        },
    },
    getters: {
        stakingTxs(state) {
            return state.allTransactions.filter((tx) => {
                let types = ['add_validator', 'add_delegator']
                if (types.includes(tx.type)) {
                    return true
                }
                return false
            })
        },
    },
}

export default history_module
