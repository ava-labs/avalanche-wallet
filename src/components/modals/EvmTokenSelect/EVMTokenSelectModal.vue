<template>
    <modal ref="modal" title="Select Token" class="modal_main">
        <div class="token_select_body">
            <div class="list">
                <div class="token_row" @click="select('native')">
                    <img src="/img/native_token.png" class="col_img" />
                    <div class="col_name">
                        <p>{{ nativeAssetSymbol }}</p>
                        <p>{{ nativeAssetName }}</p>
                    </div>
                    <p class="col_bal">{{ avaxBalance.toLocaleString() }}</p>
                </div>
                <div v-for="t in tokens" :key="t.data.address" class="token_row" @click="select(t)">
                    <img v-if="t.data.logoURI" :src="t.data.logoURI" class="col_img" />
                    <p v-else class="col_img">?</p>
                    <div class="col_name">
                        <p>{{ t.data.symbol }}</p>
                        <p>{{ t.data.name }}</p>
                    </div>
                    <p class="col_bal">{{ t.balanceBig.toLocaleString() }}</p>
                </div>
            </div>
            <div class="nft_list">
                <ERCNftRow
                    class="nft_row"
                    v-for="t in ercNfts"
                    :key="t.contractAddress"
                    :token="t"
                    @select="onERCNftSelect"
                ></ERCNftRow>
            </div>
        </div>
    </modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component } from 'vue-property-decorator'

import Modal from '@/components/modals/Modal.vue'
import Erc20Token from '@/js/Erc20Token'
import Big from 'big.js'
import { WalletType } from '@/js/wallets/types'
import { bnToBig } from '@/helpers/helper'
import ERCNftToken from '@/js/ERCNftToken'
import ERCNftRow from '@/components/modals/EvmTokenSelect/ERCNftRow.vue'
import { iERCNftSelectInput } from '@/components/misc/EVMInputDropdown/types'

@Component({
    components: {
        ERCNftRow,
        Modal,
    },
})
export default class EVMTokenSelectModal extends Vue {
    $refs!: {
        modal: Modal
    }
    open(): void {
        let modal = this.$refs.modal as Modal
        modal.open()
    }

    get tokens(): Erc20Token[] {
        let tokens: Erc20Token[] = this.$store.getters['Assets/networkErc20Tokens']
        let filt = tokens.filter((t) => {
            if (t.balanceBN.isZero()) return false
            return true
        })
        return filt
    }

    get ercNfts(): ERCNftToken[] {
        let w: WalletType = this.$store.state.activeWallet
        return this.$store.getters['Assets/ERCNft/networkContracts']
    }

    get nativeAssetSymbol(): string {
        return this.$store.getters['Assets/AssetAVA']?.symbol ?? ''
    }

    get nativeAssetName(): string {
        return this.$store.getters['Assets/AssetAVA']?.name ?? ''
    }

    get avaxBalance(): Big {
        let w: WalletType | null = this.$store.state.activeWallet
        if (!w) return Big(0)
        let balBN = w.ethBalance
        return bnToBig(balBN, 18)
    }

    select(token: Erc20Token | 'native') {
        this.$emit('select', token)
        this.close()
    }

    onERCNftSelect(val: iERCNftSelectInput) {
        this.$emit('selectCollectible', val)
        this.close()
    }

    close() {
        this.$refs.modal.close()
    }
}
</script>
<style scoped lang="scss">
@use '../../../styles/main';

.token_select_body {
    width: 520px;
    max-width: 100%;
}

.list {
    max-height: 70vh;
    z-index: 2;
    border-radius: var(--border-radius-sm);
}

$logo_w: 38px;

.token_row,
.nft_row {
    padding: 10px 20px;
}

.nft_row {
    border-top: 1px solid var(--bg-light);
}
.token_row {
    font-size: 15px;
    display: grid;
    grid-template-columns: max-content max-content 1fr;
    column-gap: 12px;
    cursor: pointer;
    user-select: none;

    > * {
        align-self: center;
    }

    img {
        object-fit: contain;
    }

    &:hover {
        background-color: var(--bg-light);

        .col_img {
            background-color: var(--primary-color);
            color: var(--bg-wallet);
        }
    }
}

.col_img {
    width: $logo_w;
    height: $logo_w;
    border-radius: $logo_w;
    background-color: var(--bg-light);
    text-align: center;
    line-height: $logo_w;
}

.col_bal {
    text-align: right;
}

.col_name {
    p:last-of-type {
        font-size: 13px;
        color: var(--primary-color-light);
    }
}

@include main.mobile-device {
    .token_select_body {
        width: 100%;
        max-height: 40vh;
        overflow: auto;
    }
}
</style>
