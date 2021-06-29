import { AvaNetwork } from '@/js/AvaNetwork'
import { ethers } from 'ethers'
import store from '@/store'
import { WalletType } from '@/js/wallets/types'

const SOCKET_RECONNECT_TIMEOUT = 1000

export function connectSocketC(network: AvaNetwork) {
    try {
        let wsUrl = network.getWsUrlC()
        let wsProvider = new ethers.providers.WebSocketProvider(wsUrl)

        if (socketEVM) {
            socketEVM._websocket.onclose = () => {}
            socketEVM.destroy()
            socketEVM = wsProvider
        } else {
            socketEVM = wsProvider
        }

        updateEVMSubscriptions()

        // Save default function so we can keep calling it
        let defaultOnOpen = wsProvider._websocket.onopen
        let defaultOnClose = wsProvider._websocket.onclose

        wsProvider._websocket.onopen = (ev: any) => {
            if (defaultOnOpen) defaultOnOpen(ev)
        }

        wsProvider._websocket.onclose = (ev: any) => {
            if (defaultOnClose) defaultOnClose(ev)

            setTimeout(() => {
                connectSocketC(network)
            }, SOCKET_RECONNECT_TIMEOUT)
        }
    } catch (e) {
        console.info('EVM Websocket connection failed.')
    }
}

let evmSubscriptionTimeout: NodeJS.Timeout
const SUBSCRIBE_TIMEOUT = 500

export function updateEVMSubscriptions() {
    if (!socketEVM) {
        // try again later
        if (evmSubscriptionTimeout) {
            clearTimeout(evmSubscriptionTimeout)
        }
        evmSubscriptionTimeout = setTimeout(() => {
            updateEVMSubscriptions()
        }, SUBSCRIBE_TIMEOUT)
        return
    }

    removeBlockHeaderListener(socketEVM)
    addBlockHeaderListener(socketEVM)
}

function removeBlockHeaderListener(provider: ethers.providers.WebSocketProvider) {
    provider.off('block', blockHeaderCallback)
}

function addBlockHeaderListener(provider: ethers.providers.WebSocketProvider) {
    provider.on('block', blockHeaderCallback)
}

function blockHeaderCallback() {
    updateWalletBalanceC()
}

function updateWalletBalanceC() {
    let wallet: null | WalletType = store.state.activeWallet
    if (!wallet) return
    // Refresh the wallet balance
    wallet.getEthBalance()
}

export let socketEVM: ethers.providers.WebSocketProvider
