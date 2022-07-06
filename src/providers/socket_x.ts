import Sockette from 'sockette'
import { WalletType } from '@/js/wallets/types'
import store from '@/store'
import { AvaNetwork } from '@/js/AvaNetwork'
import { PubSub } from '@c4tplatform/camino'

const FILTER_ADDRESS_SIZE = 1000

export let socketX: Sockette

export function connectSocketX(network: AvaNetwork) {
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

// Clears the filter listening to X chain transactions
function clearFilter() {
    let pubsub = new PubSub()
    let bloom = pubsub.newBloom(FILTER_ADDRESS_SIZE)
    socketX.send(bloom)
}

function updateWalletBalanceX() {
    let wallet: null | WalletType = store.state.activeWallet
    if (!wallet) return
    // Refresh the wallet balance
    store.dispatch('Assets/updateUTXOsExternal').then(() => {
        store.dispatch('History/updateTransactionHistory')
    })
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
