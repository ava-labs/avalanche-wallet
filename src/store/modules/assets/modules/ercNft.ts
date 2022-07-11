import { Module } from 'vuex'
import ERCNftToken from '@/js/ERCNftToken'
import {
    ERCNftBalance,
    ERCNftModuleState,
    ERCNftTokenInput,
} from '@/store/modules/assets/modules/types'
import { RootState } from '@/store/types'
import ERCNft_TOKEN_LIST from '@/ERC721Tokenlist.json'
import { WalletType } from '@/js/wallets/types'
import Vue from 'vue'
import { web3 } from '@/evm'

const ercNft_module: Module<ERCNftModuleState, RootState> = {
    namespaced: true,
    state: {
        lastScannedBlock: 0,
        scannedTokens: new Set(),
        evmAddress: '',
        walletPrefix: '',
        ercNftTokens: [],
        ercNftTokensCustom: [],
        ercNftTokenIds: [],
        walletBalance: {},
    },
    mutations: {
        clear(state: ERCNftModuleState) {
            state.walletBalance = {}
        },
        loadCustomContracts(state) {
            let tokensRaw = localStorage.getItem('ercNft_tokens') || '[]'
            let tokens: ERCNftTokenInput[] = JSON.parse(tokensRaw)
            state.ercNftTokensCustom = []
            for (var i = 0; i < tokens.length; i++) {
                const token = new ERCNftToken(tokens[i])
                state.ercNftTokensCustom.push(token)
                token.updateSupports()
            }
        },
        saveCustomContracts(state) {
            let tokenRawData = state.ercNftTokensCustom
                .filter((token) => token.data.ercTokenIds.length > 0)
                .map((token) => token.data)
            localStorage.setItem('ercNft_tokens', JSON.stringify(tokenRawData))
        },
        loadTokenIds(state) {
            if (state.walletPrefix === '') return

            let tokensRaw = localStorage.getItem(state.walletPrefix + '_tokens') ?? '[]'
            state.ercNftTokenIds = []
            let tokens: ERCNftTokenInput[] = JSON.parse(tokensRaw)
            for (var i = 0; i < tokens.length; i++) {
                const token = new ERCNftToken(tokens[i])
                state.ercNftTokenIds.push(token)
                token.updateSupports()
            }
        },
        saveTokenIds(state) {
            if (state.walletPrefix === '') return

            let tokenRawData = state.ercNftTokenIds
                .filter((token) => token.data.ercTokenIds.length > 0)
                .map((token) => token.data)
            localStorage.setItem(state.walletPrefix + '_tokens', JSON.stringify(tokenRawData))
        },
        loadLastScannedBlock(state) {
            if (state.walletPrefix === '') return
            state.lastScannedBlock = parseInt(
                localStorage.getItem(state.walletPrefix + '_lastScanned') ?? '0'
            )
            const scannedTokens = localStorage.getItem(state.walletPrefix + '_scanned')
            if (scannedTokens) state.scannedTokens = new Set(JSON.parse(scannedTokens))
        },
        saveLastScannedBlock(state) {
            if (state.walletPrefix === '') return
            localStorage.setItem(
                state.walletPrefix + '_lastScanned',
                state.lastScannedBlock.toString()
            )
            localStorage.setItem(
                state.walletPrefix + '_scanned',
                JSON.stringify([...state.scannedTokens.values()])
            )
        },
    },
    actions: {
        async removeCustom({ state, commit }, data: ERCNftToken) {
            let index = state.ercNftTokensCustom.indexOf(data)
            state.ercNftTokensCustom.splice(index, 1)

            index = state.ercNftTokenIds.indexOf(data)
            if (index >= 0) {
                state.ercNftTokenIds.splice(index, 1)
                commit('saveTokenIds')
            }

            Vue.delete(state.walletBalance, data.data.address)
            commit('saveCustomContracts')
        },

        async addCustom({ state, dispatch, commit }, data: ERCNftTokenInput) {
            let tokens = state.ercNftTokens.concat(state.ercNftTokensCustom)

            // Make sure its not added before
            for (var i = 0; i < tokens.length; i++) {
                let t = tokens[i]
                if (data.address === t.data.address && data.chainId === t.data.chainId) {
                    throw new Error('Collection already added.')
                }
            }

            let token = new ERCNftToken(data)
            await token.updateSupports()

            if (token.canSupport) {
                state.ercNftTokensCustom.push(token)
                await dispatch('scanNewNfts')
                return token
            }
            throw new Error('Unsupported contract.')
        },

        async init({ state, commit }) {
            // Load default ercNft token contracts
            let ercNftTokens: ERCNftTokenInput[] = ERCNft_TOKEN_LIST.tokens
            for (var i = 0; i < ercNftTokens.length; i++) {
                ercNftTokens[i].address = web3.utils.toChecksumAddress(ercNftTokens[i].address)
                const token = new ERCNftToken(ercNftTokens[i])
                state.ercNftTokens.push(token)
                await token.updateSupports()
            }
            commit('loadCustomContracts')
        },
        updateUserNfts({ state, rootState, commit }) {
            const wallet = rootState.activeWallet
            if (!wallet) return

            state.evmAddress = '0x' + wallet.getEvmAddress()
            state.walletPrefix = wallet.chainId + '_' + wallet.getEvmAddress()
            commit('clear')
            commit('loadTokenIds')
            commit('loadLastScannedBlock')
        },
        updateWalletBalance({ state, rootState }, token: ERCNftToken[]) {
            let w: WalletType | null = rootState.activeWallet
            if (!w) return

            let walletAddr = '0x' + w.getEvmAddress()

            // Loop through contracts and update wallet balance object
            let contracts: ERCNftToken[] = token ?? state.ercNftTokenIds
            for (var i = 0; i < contracts.length; i++) {
                let ercNft = contracts[i]
                ercNft
                    .getAllTokensIds(walletAddr)
                    .then((tokenIds: ERCNftBalance[]) => {
                        Vue.set(state.walletBalance, ercNft.data.address, tokenIds)
                    })
                    .catch((err) => {
                        console.error(err)
                    })
            }
        },
        async scanNewNfts({ state, getters, commit, dispatch }) {
            const contracts: ERCNftToken[] = getters['networkContracts']
            let changed = false

            const unknownContracts = contracts.filter(
                (c) => !state.scannedTokens.has(c.data.address)
            )
            const knownContracts = contracts.filter((c) => state.scannedTokens.has(c.data.address))

            // Step 1 Look for new contracts (rescan from 0)
            if (unknownContracts.length > 0) {
                if (await ERCNftToken.updateNftActivity(state.evmAddress, unknownContracts, 0))
                    changed = true
                unknownContracts.forEach((c) => state.scannedTokens.add(c.data.address))
            }

            // Step 2 Update existing contracts
            if (knownContracts.length > 0) {
                if (
                    await ERCNftToken.updateNftActivity(
                        state.evmAddress,
                        knownContracts,
                        state.lastScannedBlock
                    )
                )
                    changed = true
            }
            state.lastScannedBlock = await web3.eth.getBlockNumber()
            commit('saveLastScannedBlock')

            if (changed) {
                const search = new Set<ERCNftToken>(state.ercNftTokenIds)
                const updates: ERCNftToken[] = []
                contracts.forEach((c) => {
                    if (
                        c.data.ercTokenIds.length > 0 &&
                        !state.ercNftTokenIds
                            .map((tokenId) => tokenId.data.address)
                            .includes(c.data.address)
                    ) {
                        state.ercNftTokenIds.push(c)
                        updates.push(c)
                    } else if (
                        state.ercNftTokenIds
                            .map((tokenId) => tokenId.data.address)
                            .includes(c.data.address)
                    ) {
                        const index = state.ercNftTokenIds.findIndex(
                            (tokenId) => tokenId.data.address === c.data.address
                        )
                        state.ercNftTokenIds[index] = c
                        updates.push(c)
                    }
                })
                commit('saveTokenIds')
                commit('saveCustomContracts')
                dispatch('updateWalletBalance', updates)
            }
        },
    },
    getters: {
        networkContracts(state: ERCNftModuleState, _, rootState: RootState): ERCNftToken[] {
            let tokens = state.ercNftTokens.concat(state.ercNftTokensCustom)
            //@ts-ignore
            let chainId = rootState.Assets.evmChainId
            let filt = tokens.filter((t) => {
                if (t.data.chainId !== chainId) return false
                return true
            })
            return filt
        },

        networkContractsCustom(state: ERCNftModuleState, getters): ERCNftToken[] {
            let contracts: ERCNftToken[] = getters.networkContracts
            return contracts.filter((c) => {
                return state.ercNftTokensCustom.includes(c)
            })
        },
        owned: (state: ERCNftModuleState) => (contractAddr: string, tokenId: string) => {
            let bal = state.walletBalance[contractAddr]
            return bal.find((erc) => erc.tokenId === tokenId)?.quantity
        },
        totalOwned(state: ERCNftModuleState) {
            let bal = state.walletBalance
            let tot = 0
            for (let contractAddr in bal) {
                for (let ercNftBalance of bal[contractAddr]) {
                    tot += ercNftBalance.quantity
                }
            }
            return tot
        },
        totalCollectionsOwned(state: ERCNftModuleState) {
            let bal = state.walletBalance
            let tot = 0
            for (let contractAddress in bal) {
                let len = bal[contractAddress].length
                if (len > 0) tot++
            }
            return tot
        },
        find: (_, getters) => (contractAddr: string) => {
            let tokens: ERCNftToken[] = getters.networkContracts
            for (var i = 0; i < tokens.length; i++) {
                let t = tokens[i]
                if (t.data.address === contractAddr) {
                    return t
                }
            }
            return null
        },
    },
}

export default ercNft_module
