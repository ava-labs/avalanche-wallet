import { Module } from 'vuex'
import { TokenListToken } from '@/store/modules/assets/types'
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

const ercNFT_module: Module<ERCNftModuleState, RootState> = {
    namespaced: true,
    state: {
        ercNFTTokens: [],
        ercNFTTokensCustom: [],
        walletBalance: {},
    },
    mutations: {
        clear(state: ERCNftModuleState) {
            state.walletBalance = {}
        },
        saveCustomContracts(state) {
            let tokens = state.ercNFTTokensCustom
            let tokenRawData = tokens.map((token) => {
                return token.data
            })
            localStorage.setItem('ercNFT_tokens', JSON.stringify(tokenRawData))
        },
        loadCustomContracts(state) {
            let tokensRaw = localStorage.getItem('ercNFT_tokens') || '[]'
            let tokens: ERCNftTokenInput[] = JSON.parse(tokensRaw)
            for (var i = 0; i < tokens.length; i++) {
                state.ercNFTTokensCustom.push(new ERCNftToken(tokens[i]))
            }
        },
    },
    actions: {
        async removeCustom({ state, commit }, data: ERCNftToken) {
            let index = state.ercNFTTokensCustom.indexOf(data)
            state.ercNFTTokensCustom.splice(index, 1)
            Vue.delete(state.walletBalance, data.data.address)
            commit('saveCustomContracts')
        },

        async addCustom({ state, dispatch, commit }, data: ERCNftTokenInput) {
            let tokens = state.ercNFTTokens.concat(state.ercNFTTokensCustom)

            // Make sure its not added before
            for (var i = 0; i < tokens.length; i++) {
                let t = tokens[i]
                if (data.address === t.data.address && data.chainId === t.data.chainId) {
                    throw new Error('ERC20 Token already added.')
                }
            }

            let t = new ERCNftToken(data)
            state.ercNFTTokensCustom.push(t)

            commit('saveCustomContracts')
            setTimeout(() => {
                dispatch('updateWalletBalance')
            }, 500)
            return t
        },

        async init({ state, commit }) {
            // Load default ercNFT token contracts
            let ercNFTTokens: ERCNftTokenInput[] = ERCNft_TOKEN_LIST.tokens
            for (var i = 0; i < ercNFTTokens.length; i++) {
                state.ercNFTTokens.push(new ERCNftToken(ercNFTTokens[i]))
            }
            commit('loadCustomContracts')
        },
        updateWalletBalance({ state, rootState, getters }) {
            let w: WalletType | null = rootState.activeWallet
            if (!w) return

            let walletAddr = '0x' + w.getEvmAddress()

            // Loop through contracts and update wallet balance object
            let contracts: ERCNftToken[] = getters.networkContracts
            for (var i = 0; i < contracts.length; i++) {
                let ercNFT = contracts[i]
                ercNFT
                    .getAllTokensIds(walletAddr)
                    .then((tokenIds: ERCNftBalance[]) => {
                        Vue.set(state.walletBalance, ercNFT.data.address, tokenIds)
                    })
                    .catch((err) => {
                        console.error(err)
                    })
            }
        },
    },
    getters: {
        networkContracts(state: ERCNftModuleState, getters, rootState: RootState): ERCNftToken[] {
            let tokens = state.ercNFTTokens.concat(state.ercNFTTokensCustom)
            //@ts-ignore
            let chainId = rootState.Assets.evmChainId
            let filt = tokens.filter((t) => {
                if (t.data.chainId !== chainId) return false
                return true
            })
            return filt
        },

        networkContractsCustom(
            state: ERCNftModuleState,
            getters,
            rootState: RootState
        ): ERCNftToken[] {
            let contracts: ERCNftToken[] = getters.networkContracts
            return contracts.filter((c) => {
                return state.ercNFTTokensCustom.includes(c)
            })
        },

        totalOwned(state: ERCNftModuleState, getters, rootState: RootState) {
            let bal = state.walletBalance
            let tot = 0
            for (let contractAddress in bal) {
                for (let ercNFTBalance of bal[contractAddress]) {
                    tot += ercNFTBalance.quantity
                }
            }
            return tot
        },
        totalCollectionsOwned(state: ERCNftModuleState, getters, rootState: RootState) {
            let bal = state.walletBalance
            let tot = 0
            for (let contractAddrress in bal) {
                let len = bal[contractAddrress].length
                if (len > 0) tot++
            }
            return tot
        },
        find: (state, getters) => (contractAddr: string) => {
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

export default ercNFT_module
