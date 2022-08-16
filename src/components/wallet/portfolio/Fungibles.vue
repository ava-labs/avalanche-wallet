<template>
    <div class="fungibles_view">
        <AddERC20TokenModal ref="add_token_modal"></AddERC20TokenModal>
        <TokenListModal ref="tokenlist_modal"></TokenListModal>
        <div class="headers">
            <p class="name_col">{{ $t('portfolio.name') }}</p>
            <p></p>
            <p class="send_col">{{ $t('portfolio.send') }}</p>
            <p class="balance_col balance_header">{{ $t('portfolio.balance') }}</p>
        </div>
        <div v-show="networkStatus !== 'connected'" class="empty">
            <p>{{ $t('portfolio.error_network') }}</p>
        </div>
        <div v-show="networkStatus === 'connected'" class="scrollable no_scroll_bar">
            <div v-if="walletBalances.length === 0" class="empty">
                <p>{{ $t('portfolio.nobalance') }}</p>
            </div>
            <div v-else>
                <fungible-row
                    class="asset"
                    v-for="asset in walletBalances"
                    :key="asset.id"
                    :asset="asset"
                ></fungible-row>
                <ERC20Row
                    class="asset"
                    v-for="erc in erc20Balances"
                    :key="erc.data.address"
                    :token="erc"
                ></ERC20Row>
                <div class="asset add_token_row">
                    <button @click="addToken">Add Token</button>
                    <span>or</span>
                    <button @click="addTokenList">Add Token List</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import FaucetLink from '@/components/misc/FaucetLink.vue'
import FungibleRow from '@/components/wallet/portfolio/FungibleRow.vue'
import AvaAsset from '@/js/AvaAsset'
import Erc20Token from '@/js/Erc20Token'
import ERC20Row from '@/components/wallet/portfolio/ERC20Row.vue'
import AddERC20TokenModal from '@/components/modals/AddERC20TokenModal.vue'
import TokenListModal from '@/components/modals/TokenList/TokenListModal.vue'

@Component({
    components: {
        TokenListModal,
        AddERC20TokenModal,
        ERC20Row,
        FaucetLink,
        FungibleRow,
    },
})
export default class Fungibles extends Vue {
    @Prop() search!: string

    $refs!: {
        add_token_modal: AddERC20TokenModal
        tokenlist_modal: TokenListModal
    }

    get networkStatus(): string {
        let stat = this.$store.state.Network.status
        return stat
    }

    addToken() {
        this.$refs.add_token_modal.open()
    }

    addTokenList() {
        this.$refs.tokenlist_modal.open()
    }

    get walletBalancesSorted(): AvaAsset[] {
        // let balance: AvaAsset[] = this.$store.getters['walletAssetsArray']
        let balance: AvaAsset[] = this.$store.getters['Assets/walletAssetsArray']

        // Sort by balance, then name
        balance.sort((a, b) => {
            let symbolA = a.symbol.toUpperCase()
            let symbolB = b.symbol.toUpperCase()
            let amtA = a.getAmount()
            let amtB = b.getAmount()
            let idA = a.id
            let idB = b.id

            // AVA always on top
            if (idA === this.avaxToken.id) {
                return -1
            } else if (idB === this.avaxToken.id) {
                return 1
            }

            if (amtA.gt(amtB)) {
                return -1
            } else if (amtA.lt(amtB)) {
                return 1
            }

            if (symbolA < symbolB) {
                return -1
            } else if (symbolA > symbolB) {
                return 1
            }
            return 0
        })

        return balance
    }

    get avaxToken(): AvaAsset {
        return this.$store.getters['Assets/AssetAVA']
    }

    get erc20Balances(): Erc20Token[] {
        let tokens: Erc20Token[] = this.$store.getters['Assets/networkErc20Tokens']
        let filt = tokens.filter((token) => {
            if (token.balanceBN.isZero()) return false
            return true
        })
        return filt
    }

    get walletBalances(): AvaAsset[] {
        let balance = this.walletBalancesSorted

        if (this.search) {
            balance = balance.filter((val) => {
                let query = this.search.toUpperCase()

                let nameUp = val.name.toUpperCase()
                let symbolUp = val.symbol.toUpperCase()

                if (nameUp.includes(query) || symbolUp.includes(query)) {
                    return true
                } else {
                    return false
                }
            })
        }

        return balance
    }
}
</script>
<style scoped lang="scss">
@use '../../../styles/main';

.fungibles_view {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.search {
    height: 20px;
    font-size: 15px;
    display: flex;
    align-items: center;
    margin-bottom: 30px;
    img {
        height: 100%;
        object-fit: contain;
        margin-right: 15px;
        opacity: 0.4;
    }

    input {
        outline: none;
    }
}

.headers {
    border-bottom: 1px solid var(--bg-light);
    font-size: 12px;
    padding: 12px 0;
    color: var(--primary-color-light);
    font-weight: bold;
}

.scrollable {
    overflow-y: scroll;
    flex-grow: 1;
}

.asset {
    border-bottom: 1px solid var(--bg-light);
}

.send_col {
    text-align: center;
}

.empty {
    padding: 30px;
    text-align: center;
}

.faucet {
    margin: 0px auto;
    margin-top: 60px;
}

.name_col {
    white-space: nowrap;
}

@include main.mobile-device {
    .headers,
    .asset {
        grid-template-columns: 50px 1fr 1fr 50px;
    }

    .balance_col {
        text-align: right;
        span {
            display: none;
        }
    }
    .balance_col {
        grid-column: 3;
        grid-row: 1;
    }

    .send_col {
        grid-column: 4;
    }

    .headers {
        padding: 14px 0;
        .send_col {
            display: none;
        }
    }
}

@include main.medium-device {
    .headers {
        padding: 12px 0;
    }
}
</style>
<style lang="scss">
@use '../../../styles/main';
.fungibles_view {
    .balance_col {
        text-align: right;
        display: inline-block;

        span {
            padding-left: 8px;
            text-align: right;
        }
    }

    .balance_header {
        grid-template-columns: 1fr;
    }

    .headers,
    .asset {
        display: grid;
        grid-template-columns: max-content 1fr 100px 1fr;
    }
}

@include main.mobile-device {
    .fungibles_view {
        .headers,
        .asset {
            grid-template-columns: max-content 1fr 1fr 50px;
        }

        .balance_col {
            white-space: nowrap;
            grid-template-columns: 1fr;
        }
        .balance_col {
            grid-column: 3;
            grid-row: 1;
        }

        .send_col {
            grid-column: 4;
        }

        .headers {
            .send_col {
                display: none;
            }
        }
    }
}
</style>
