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
    // addListenersX(socketX)
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

/**
 * Add the event listeners to the socket events.
 * @param socket The socket instance to add event listeners to.
 */
// function addListenersX(socket: Socket) {
//     socket.onopen = function () {
//         console.log('Socket X connected')
//         updateFilterAddresses()
//     }
//
//     socket.onmessage = function () {
//         console.log('X chain MSG, update balance')
//         updateWalletBalanceX()
//         // WalletProvider.refreshInstanceBalancesX()
//     }
//
//     socket.onclose = () => {
//         console.log('X socket closed')
//     }
//
//     socket.onerror = (error: any) => {
//         console.log(error)
//     }
// }

function xOnOpen() {
    console.log('Socket X connected')
    updateFilterAddresses()
}

function xOnMessage() {
    console.log('X chain MSG, update balance')
    updateWalletBalanceX()
}

function xOnClose() {
    console.log('X socket closed')
}

function xOnError() {
    console.log('X error')
}

function addListenersEVM(provider: Web3) {
    let sub = provider.eth.subscribe('newBlockHeaders')
    sub.on('data', blockHeaderCallback)
    sub.on('error', onErrorEVM)
}

function onErrorEVM(err: any) {
    console.info(err)
}

function blockHeaderCallback() {
    console.log('BLOCK HEADERS')
    updateWalletBalanceC()
    // updateWalletBalance()
}

function updateWalletBalanceX() {
    let wallet: null | WalletType = store.state.activeWallet
    if (!wallet) return
    // Refresh the wallet balance
    store.dispatch('Assets/updateUTXOs').then(() => {
        store.dispatch('History/updateTransactionHistory')
    })
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

    console.log('Update filter addresses')

    // let wallets = WalletProvider.instances
    let externalAddrs = wallet.getAllDerivedExternalAddresses()
    let addrsLen = externalAddrs.length
    let startIndex = Math.max(0, addrsLen - FILTER_ADDRESS_SIZE)
    let addrs = externalAddrs.slice(startIndex)

    let pubsub = new PubSub()
    let bloom = pubsub.newBloom(FILTER_ADDRESS_SIZE)

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
