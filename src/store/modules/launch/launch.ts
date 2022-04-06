import { Module } from 'vuex'
import { iUserAccountEncrypted, RootState } from '@/store/types'
import { LaunchItem, LaunchState } from './types'

const launch_module: Module<LaunchState, RootState> = {
    namespaced: true,
    state: {
        items: [],
    },
    mutations: {
        removeItem(state, url: string) {},
    },
    actions: {
        async onNetworkChange({ state }, network) {
            state.network = network
        },
        async launchItem({ state }, url: string) {
            let existingItem = state.items.find((item: LaunchItem) => item.url === url)
            if (!existingItem) {
                existingItem = {
                    url: url,
                    title: '',
                    iconUrl: '',
                    proxy: null,
                }
                state.items.push(existingItem)
            }
            if (!existingItem.proxy || existingItem.proxy.closed) {
                existingItem.proxy = window.open(url, '_blank')
            } else {
                existingItem.proxy.focus()
            }
        },
        async initialize({ state, dispatch }) {
            await dispatch('onLogout')
            state.eventFunc = (event) => {
                dispatch('handleEvent', event)
            }
            window.addEventListener('message', state.eventFunc, false)
        },
        async onLogout({ state }) {
            if (state.eventFunc) window.removeEventListener('message', state.eventFunc)
        },
        async handleEvent({ state, rootState }, event: MessageEvent) {
            const item = state.items.find((item) => item.url.startsWith(event.origin))
            if (!item) {
                console.log('Origin not found', event.origin)
                return
            }
            if (event.source && event.data.method === 'getNetwork') {
                const wallet = rootState.activeWallet

                ;(event.source as WindowProxy).postMessage(
                    {
                        type: 'getNetworkResponse',
                        data: {
                            x_address: wallet?.getCurrentAddressAvm(),
                        },
                    },
                    event.origin
                )
            }
        },
    },
}

export default launch_module
