import { Module } from 'vuex'
import { RootState } from '@/store/types'
import { SecuXState } from '@/store/modules/secux/types'

const secux_module: Module<SecuXState, RootState> = {
    namespaced: true,
    state: {
        isBlock: false, // if true a modal blocks the window
        isPrompt: false,
        isUpgradeRequired: false,
        isWalletLoading: false,
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
        setIsUpgradeRequired(state, val) {
            state.isUpgradeRequired = val
        },
        setIsWalletLoading(state, val) {
            state.isWalletLoading = val
        },
    },
    actions: {},
}

export default secux_module
