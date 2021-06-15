import { AvaNetwork } from '@/js/AvaNetwork'
import { ethers } from 'ethers'
import Web3 from 'web3'
import ERC721Token from '@/js/ERC721Token'
import store from '@/store'
import Erc20Token from '@/js/Erc20Token'
import { WalletType } from '@/js/wallets/types'
import ERC20Abi from '@openzeppelin/contracts/build/contracts/ERC20.json'

const wsOptions = {
    timeout: 30000, // ms
    // Enable auto reconnection
    reconnect: {
        auto: true,
        delay: 5000, // ms
        onTimeout: false,
    },
}

export function connectSocketC(network: AvaNetwork) {
    try {
        let wsUrl = network.getWsUrlC()
        // let wsProvider = new Web3.providers.WebsocketProvider(wsUrl, wsOptions)
        let wsProvider = new ethers.providers.WebSocketProvider(wsUrl)
        if (socketEVM) {
            socketEVM.destroy()
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

    //clear subscriptions
    // socketEVM.eth.clearSubscriptions(() => {
    //     console.log('Cleared subs')
    // })
    removeBlockHeaderListener(socketEVM)
    addBlockHeaderListener(socketEVM)
    // addLogsListenersEVM(socketEVM)
}

export function resetContractListeners() {
    if (!socketEVM) return

    addErc20Listeners(socketEVM)
}

function removeBlockHeaderListener(provider: ethers.providers.WebSocketProvider) {
    provider.off('block', blockHeaderCallback)
}

function addBlockHeaderListener(provider: ethers.providers.WebSocketProvider) {
    provider.on('block', blockHeaderCallback)
}

function addErc20Listeners(provider: ethers.providers.WebSocketProvider) {
    // Get erc20 contract addresses
    // let erc721Contracts: ERC721Token[] = store.getters['Assets/ERC721/networkContracts']
    // let erc721Addrs: string[] = erc721Contracts.map((contract) => contract.data.address)

    let erc20Contracts: Erc20Token[] = store.getters['Assets/networkErc20Tokens']
    let erc20Addrs: string[] = erc20Contracts.map((contract) => contract.data.address)

    // Try to get wallet address
    let activeWallet: WalletType | null = store.state.activeWallet
    if (!activeWallet) {
        return
    }

    let walletAddr = activeWallet.getEvmAddress()

    for (var i = 0; i < erc20Contracts.length; i++) {
        let erc20 = erc20Contracts[i]
        const contract = new ethers.Contract(erc20.data.address, ERC20Abi.abi, provider)
        let filter = contract.filters.Transfer(null, walletAddr)
        contract.on(filter, (from: string, to: string, amount: ethers.BigNumber, event: Event) => {
            console.log(from, to, amount.toString())
        })
    }

    // let subLogs = provider.eth.subscribe('logs', LOG_CONFIG)
    // subLogs.on('data', onLogsData)
    // subLogs.on('error', onLogsError)
    // subLogs.on('connected', (data: any) => console.log(data))
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

function updateWalletBalanceC() {
    let wallet: null | WalletType = store.state.activeWallet
    if (!wallet) return
    // Refresh the wallet balance
    wallet.getEthBalance()
}

export let socketEVM: ethers.providers.WebSocketProvider
// export let socketEVM: Web3
