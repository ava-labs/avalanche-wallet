import { Module } from 'vuex'
import { RootState } from '@/store/types'
import { LedgerModalConfig, LedgerState } from '@/store/modules/ledger/types'

const ledger_module: Module<LedgerState, RootState> = {
    namespaced: true,
    state: {
        isBlock: false, // if true a modal blocks the window
        isPrompt: true, // if true will display a message asking to confirm on ledger
        isUpgradeRequired: false,
        isWalletLoading: false,
        messages: [],
        title: 'title',
        info: `info'`,
        warning: undefined,
    },
    mutations: {
        openModal(state, input: LedgerModalConfig) {
            state.title = input.title
            state.info = input.info
            state.messages = input.messages
            state.isPrompt = input.isPrompt !== false
            state.isBlock = true
            state.warning = input.warning
        },
        closeModal(state) {
            state.messages = []
            state.isBlock = false
        },
        setIsUpgradeRequired(state, val) {
            state.isUpgradeRequired = val
        },
        setIsWalletLoading(state, val) {
            state.isWalletLoading = val
        },
    },
    actions: {},
}

export default ledger_module
