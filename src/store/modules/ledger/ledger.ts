import { Module } from 'vuex'
import { RootState } from '@/store/types'
import { LedgerState } from '@/store/modules/ledger/types'

const ledger_module: Module<LedgerState, RootState> = {
    namespaced: true,
    state: {
        isBlock: false, // if true a modal blocks the window
        isPrompt: false,
        isUpgradeRecommended: false,
        messages: [],
        title: 'title',
        info: `info'`,
    },
    mutations: {
        openModal(state, input) {
            state.title = input.title
            state.info = input.info
            state.messages = input.messages
            state.isPrompt = input.isPrompt
            state.isBlock = true
        },
        closeModal(state) {
            state.messages = []
            state.isBlock = false
        },
        setIsUpgradeRecommended(state, val) {
            state.isUpgradeRecommended = val
        },
    },
    actions: {},
}

export default ledger_module
