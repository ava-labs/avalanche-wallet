import Web3 from 'web3'
import Sockette from 'sockette'
import { ethers } from 'ethers'

import { PubSub } from 'avalanche'
import { AvaNetwork } from './js/AvaNetwork'
import store from '@/store'
import { WalletType } from '@/js/wallets/types'
import ERC721Token from '@/js/ERC721Token'
import Erc20Token from '@/js/Erc20Token'

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

async function connectSocketEVM(network: AvaNetwork) {
    try {
        let wsUrl = network.getWsUrlC()
        // let wsProvider = new Web3.providers.WebsocketProvider(wsUrl, wsOptions)
        let wsProvider = new ethers.providers.WebSocketProvider(wsUrl)
        if (socketEVM) {
            await socketEVM.destroy()
            socketEVM = wsProvider
            // socketEVM.setProvider(wsProvider)
        } else {
            socketEVM = wsProvider
            // socketEVM = new Web3(wsProvider)
        }
        updateEVMSubscriptions()
    } catch (e) {
        console.info('EVM Websocket connection failed.')
    }
}

let evmSubscriptionTimeout: NodeJS.Timeout
const LOGS_SUBSCRIBE_TIMEOUT = 500
export function updateEVMSubscriptions() {
    if (!socketEVM) {
        // try again later
        if (evmSubscriptionTimeout) {
            clearTimeout(evmSubscriptionTimeout)
        }
        evmSubscriptionTimeout = setTimeout(() => {
            updateEVMSubscriptions()
        }, LOGS_SUBSCRIBE_TIMEOUT)
        return
    }

    //clear subscriptions
    socketEVM.cl
    socketEVM.eth.clearSubscriptions(() => {})
    addListenersEVM(socketEVM)
    addLogsListenersEVM(socketEVM)
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

function addLogsListenersEVM(provider: Web3) {
    // Get erc20 + erc721 contract addresses
    let erc721Contracts: ERC721Token[] = store.getters['Assets/ERC721/networkContracts']
    let erc721Addrs: string[] = erc721Contracts.map((contract) => contract.data.address)

    let erc20Contracts: Erc20Token[] = store.getters['Assets/networkErc20Tokens']
    let erc20Addrs: string[] = erc20Contracts.map((contract) => contract.data.address)

    let addresses = [...erc721Addrs, ...erc20Addrs]

    // Try to get wallet address
    let activeWallet: WalletType | null = store.state.activeWallet
    if (activeWallet) {
        let walletAddr = activeWallet.getEvmAddress()
        addresses.push(walletAddr)
    }

    const LOG_CONFIG = {
        address: addresses,
    }

    console.log(LOG_CONFIG)
    let subLogs = provider.eth.subscribe('logs', LOG_CONFIG)
    subLogs.on('data', onLogsData)
    subLogs.on('error', onLogsError)
    subLogs.on('connected', (data: any) => console.log(data))
}

function onLogsData(data: any) {
    console.log(data)
}

function onLogsError(err: any) {
    console.log(err)
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

export let socketEVM: ethers.providers.WebSocketProvider
export let socketX: Sockette
