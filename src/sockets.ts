import Web3 from 'web3'
import Sockette from 'sockette'

import { Socket, PubSub } from 'avalanche'
import { AvaNetwork } from './js/AvaNetwork'
import store from '@/store'
import { WalletType } from '@/js/wallets/types'

const FILTER_ADDRESS_SIZE = 1000

const wsOptions = {
    timeout: 30000, // ms
    // Enable auto reconnection
    reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: 5,
        onTimeout: false,
    },
}

export function setSocketNetwork(network: AvaNetwork) {
    // Setup X chain connection
    connectSocketX(network)
    // Setup EVM socket connection
    connectSocketEVM(network)
}

function connectSocketX(network: AvaNetwork) {
    if (socketX) {
        socketX.close()
    }

    // Setup the X chain socket connection
    let wsURL = network.getWsUrlX()
    socketX = new Sockette(wsURL, {
        onopen: xOnOpen,
        onclose: xOnClose,
        onmessage: xOnMessage,
        onerror: xOnError,
    })
}

function connectSocketEVM(network: AvaNetwork) {
    try {
        let wsUrl = network.getWsUrlC()
        let wsProvider = new Web3.providers.WebsocketProvider(wsUrl, wsOptions)

        if (socketEVM) {
            socketEVM.setProvider(wsProvider)
        } else {
            socketEVM = new Web3(wsProvider)
        }
        addListenersEVM(socketEVM)
    } catch (e) {
        console.info('EVM Websocket connection failed.')
    }
}

// AVM Socket Listeners
function xOnOpen() {
    updateFilterAddresses()
}

function xOnMessage() {
    updateWalletBalanceX()
}

function xOnClose() {}

function xOnError() {}

function addListenersEVM(provider: Web3) {
    let sub = provider.eth.subscribe('newBlockHeaders')
    sub.on('data', blockHeaderCallback)
    sub.on('error', onErrorEVM)
}

function onErrorEVM(err: any) {
    console.info(err)
}

function blockHeaderCallback() {
    updateWalletBalanceC()
}

function updateWalletBalanceX() {
    let wallet: null | WalletType = store.state.activeWallet
    if (!wallet) return
    // Refresh the wallet balance
    store.dispatch('Assets/updateUTXOsExternal').then(() => {
        store.dispatch('History/updateTransactionHistory')
    })
}

// Clears the filter listening to X chain transactions
function clearFilter() {
    let pubsub = new PubSub()
    let bloom = pubsub.newBloom(FILTER_ADDRESS_SIZE)
    socketX.send(bloom)
}

function updateWalletBalanceC() {
    let wallet: null | WalletType = store.state.activeWallet
    if (!wallet) return
    // Refresh the wallet balance
    wallet.getEthBalance()
}

export function updateFilterAddresses(): void {
    let wallet: null | WalletType = store.state.activeWallet
    if (!socketX || !wallet) {
        return
    }

    let externalAddrs = wallet.getAllDerivedExternalAddresses()
    let addrsLen = externalAddrs.length
    let startIndex = Math.max(0, addrsLen - FILTER_ADDRESS_SIZE)
    let addrs = externalAddrs.slice(startIndex)

    let pubsub = new PubSub()
    let bloom = pubsub.newBloom(FILTER_ADDRESS_SIZE)
    socketX.send(bloom)

    // Divide addresses by 100 and send multiple messages
    // There is a max msg size ~10kb
    const GROUP_AMOUNT = 100
    let index = 0
    while (index < addrs.length) {
        let chunk = addrs.slice(index, index + GROUP_AMOUNT)
        let addAddrs = pubsub.addAddresses(chunk)
        socketX.send(addAddrs)
        index += GROUP_AMOUNT
    }
}

export let socketEVM: Web3
export let socketX: Sockette
