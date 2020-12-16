<template>
    <div>
        <div class="header">
            <h1>Studio</h1>
            <h1 class="subtitle" v-if="pageNow">
                / {{ subtitle }}
                <span @click="cancel"><fa icon="times"></fa></span>
            </h1>
        </div>
        <template v-if="!pageNow">
            <p>Create and manage assets.</p>
            <div class="menu">
                <!--                <h3>Tokens</h3>-->
                <!--                <div class="options">-->
                <!--                    <div>New Fixed Cap Asset</div>-->
                <!--                </div>-->
                <h3>Collectibles</h3>
                <div class="options">
                    <div>
                        <h4 class="title">New Family</h4>
                        <p>Create a new set of collectibles with a name and symbol.</p>
                        <v-btn @click="goNewNftFamily" class="button_secondary" small depressed>
                            New Family
                        </v-btn>
                    </div>
                    <div>
                        <h4 class="title">Mint Groups</h4>
                        <p>Issue collectibles for the families you created.</p>
                        <div>
                            <p v-if="!canMint" class="err">
                                You do not own any families you can mint.
                            </p>
                            <v-btn
                                @click="goMint"
                                class="button_secondary"
                                small
                                depressed
                                :disabled="!canMint"
                            >
                                Mint
                            </v-btn>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <Component v-else :is="pageNow" @cancel="cancel"></Component>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import NewCollectibleFamily from '@/components/wallet/studio/NewCollectibleFamily.vue'
import MintNft from '@/components/wallet/studio/mint/MintNft.vue'
import { IWalletNftMintDict } from '@/store/types'
import Big from 'big.js'
import { bnToBig } from '@/helpers/helper'
import { avm } from '@/AVA'
import { BN } from 'avalanche'
@Component({
    components: {
        NewCollectibleFamily,
    },
})
export default class Studio extends Vue {
    pageNow: any = null
    subtitle: string = ''

    goNewNftFamily() {
        this.pageNow = NewCollectibleFamily
        this.subtitle = 'New Collectible Family'
    }

    goMint() {
        this.pageNow = MintNft
        this.subtitle = 'Mint Collectible'
    }

    get nftMintDict(): IWalletNftMintDict {
        return this.$store.getters.walletNftMintDict
    }

    get canMint(): boolean {
        const keys = Object.keys(this.nftMintDict)
        if (keys.length > 0) return true
        return false
    }

    mounted() {
        let utxoId = this.$route.query.utxo

        if (utxoId) {
            this.goMint()
        }
    }

    // If url has a utxo id, clears it
    clearUrl() {
        let utxoId = this.$route.query.utxo

        if (utxoId) {
            //@ts-ignore
            this.$router.replace({ query: null })
        }
    }

    cancel() {
        this.clearUrl()
        this.pageNow = null
        this.subtitle = ''
    }
}
</script>
<style scoped lang="scss">
.header {
    display: flex;
    /*justify-content: space-between;*/
    /*align-items: center;*/
    align-items: center;

    h1 {
        font-weight: lighter;
    }

    .subtitle {
        margin-left: 0.5em;
        /*font-size: 20px;*/
        color: var(--primary-color-light);
        font-weight: lighter;
    }

    span {
        margin-left: 1em;

        &:hover {
            color: var(--primary-color);
            cursor: pointer;
        }
    }
}

.menu {
    h3 {
        margin: 20px 0;
        color: var(--primary-color-light);
        font-weight: normal;
    }
}

.options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    column-gap: 14px;
    > div {
        border-radius: 4px;
        border: 1px solid var(--bg-light);
        background-color: var(--bg-light);
        padding: 30px;
        display: flex;
        flex-direction: column;

        &:hover {
            background-color: var(--bg-light);
        }
    }

    p {
        flex-grow: 1;
        margin: 12px 0 !important;
    }

    h4 {
        font-size: 32px !important;
        font-weight: lighter;
        color: var(--primary-color-light);
    }

    .v-btn {
        width: max-content;
    }
}
</style>
