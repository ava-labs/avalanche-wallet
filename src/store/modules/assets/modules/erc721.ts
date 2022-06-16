import { Module } from 'vuex'
import { AssetsState, TokenListToken } from '@/store/modules/assets/types'
import ERC721Token from '@/js/ERC721Token'
import { Erc721ModuleState, ERC721TokenInput } from '@/store/modules/assets/modules/types'
import { RootState } from '@/store/types'
import ERC721_TOKEN_LIST from '@/ERC721Tokenlist.json'
import { WalletType } from '@/js/wallets/types'
import Vue from 'vue'

const erc721_module: Module<Erc721ModuleState, RootState> = {
    namespaced: true,
    state: {
        erc721Tokens: [],
        erc721TokensCustom: [],
        walletBalance: {},
    },
    mutations: {
        clear(state: Erc721ModuleState) {
            state.walletBalance = {}
        },
        saveCustomContracts(state) {
            const tokens = state.erc721TokensCustom
            const tokenRawData = tokens.map((token) => {
                return token.data
            })
            localStorage.setItem('erc721_tokens', JSON.stringify(tokenRawData))
        },
        loadCustomContracts(state) {
            const tokensRaw = localStorage.getItem('erc721_tokens') || '[]'
            const tokens: TokenListToken[] = JSON.parse(tokensRaw)
            for (let i = 0; i < tokens.length; i++) {
                state.erc721TokensCustom.push(new ERC721Token(tokens[i]))
            }
        },
    },
    actions: {
        async removeCustom({ state, commit }, data: ERC721Token) {
            const index = state.erc721TokensCustom.indexOf(data)
            state.erc721TokensCustom.splice(index, 1)
            Vue.delete(state.walletBalance, data.contractAddress)
            commit('saveCustomContracts')
        },

        async addCustom({ state, dispatch, commit }, data: ERC721TokenInput) {
            const tokens = state.erc721Tokens.concat(state.erc721TokensCustom)

            // Make sure its not added before
            for (let i = 0; i < tokens.length; i++) {
                const t = tokens[i]
                if (data.address === t.data.address && data.chainId === t.data.chainId) {
                    console.log('ERC721 Token already added.')
                    return
                }
            }

            const t = new ERC721Token(data)
            state.erc721TokensCustom.push(t)

            commit('saveCustomContracts')
            setTimeout(() => {
                dispatch('updateWalletBalance')
            }, 500)
            return t
        },

        async init({ state, commit }) {
            // Load default erc721 token contracts
            const erc721Tokens = ERC721_TOKEN_LIST.tokens
            for (let i = 0; i < erc721Tokens.length; i++) {
                state.erc721Tokens.push(new ERC721Token(erc721Tokens[i]))
            }
            commit('loadCustomContracts')
        },
        updateWalletBalance({ state, rootState, getters }) {
            const w: WalletType | null = rootState.activeWallet
            if (!w) return

            const walletAddr = '0x' + w.getEvmAddress()

            // Loop through contracts and update wallet balance object
            const contracts: ERC721Token[] = getters.networkContracts
            for (let i = 0; i < contracts.length; i++) {
                const erc721 = contracts[i]
                erc721
                    .getAllTokensIds(walletAddr)
                    .then((tokenIds: string[]) => {
                        Vue.set(state.walletBalance, erc721.contractAddress, tokenIds)
                    })
                    .catch((err) => {
                        console.error(err)
                    })
            }
        },
    },
    getters: {
        networkContracts(state: Erc721ModuleState, getters, rootState: RootState): ERC721Token[] {
            const tokens = state.erc721Tokens.concat(state.erc721TokensCustom)
            //@ts-ignore
            const chainId = rootState.Assets.evmChainId
            const filt = tokens.filter((t) => {
                if (t.data.chainId !== chainId) return false
                return true
            })
            return filt
        },

        networkContractsCustom(
            state: Erc721ModuleState,
            getters,
            rootState: RootState
        ): ERC721Token[] {
            const contracts: ERC721Token[] = getters.networkContracts
            return contracts.filter((c) => {
                return state.erc721TokensCustom.includes(c)
            })
        },

        totalOwned(state: Erc721ModuleState, getters, rootState: RootState) {
            const bal = state.walletBalance
            let tot = 0
            for (const contractAddrress in bal) {
                const len = bal[contractAddrress].length
                tot += len
            }
            return tot
        },
        totalCollectionsOwned(state: Erc721ModuleState, getters, rootState: RootState) {
            const bal = state.walletBalance
            let tot = 0
            for (const contractAddrress in bal) {
                const len = bal[contractAddrress].length
                if (len > 0) tot++
            }
            return tot
        },
        find: (state, getters) => (contractAddr: string) => {
            const tokens: ERC721Token[] = getters.networkContracts
            for (let i = 0; i < tokens.length; i++) {
                const t = tokens[i]
                if (t.data.address === contractAddr) {
                    return t
                }
            }
            return null
        },
    },
}

export default erc721_module
