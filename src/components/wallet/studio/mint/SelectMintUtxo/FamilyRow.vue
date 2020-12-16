<template>
    <div class="family">
        <div class="family_header">
            <p class="name">{{ family.name }}</p>
            <p class="symbol">{{ family.symbol }}</p>
            <p class="id">{{ family.id }}</p>
        </div>
        <div class="mint_group">
            <div
                v-for="utxo in utxosCapped"
                :key="utxo.getUTXOID()"
                @click="select(utxo)"
                class="mint_group"
            >
                <p>Group {{ utxo.getOutput().getGroupID() }}</p>
            </div>
            <div v-if="isCapped" class="capped_sign">
                <p>And {{ utxos.length - utxosCapped.length }} more..</p>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { AvaNftFamily } from '../../../../../js/AvaNftFamily'
import { IWalletNftMintDict } from '@/store/types'
import { UTXO } from 'avalanche/dist/apis/avm'

@Component
export default class FamilyRow extends Vue {
    @Prop() family!: AvaNftFamily

    get utxos() {
        return this.nftMintDict[this.family.id]
    }

    get utxosCapped() {
        return this.utxos.slice(0, 10)
    }

    get nftMintDict(): IWalletNftMintDict {
        return this.$store.getters.walletNftMintDict
    }

    get isCapped() {
        return this.utxos.length !== this.utxosCapped.length
    }

    select(utxo: UTXO) {
        this.$emit('select', utxo)
    }
}
</script>
<style scoped lang="scss">
@use '../../../../../main';

.family {
    margin-top: 24px;
}

.family_header {
    display: flex;
    font-size: 16px;
    border-bottom: 1px solid var(--bg-light);
    padding: 6px 0;

    .symbol,
    .id {
        color: var(--primary-color-light);
    }

    .symbol {
        padding-left: 14px;
    }

    .id {
        flex-grow: 1;
        font-size: 13px;
        text-align: right;
        opacity: 0.4;
    }
}

.mint_group {
    display: flex;
    flex-wrap: wrap;
    //justify-content: space-evenly;
    //grid-template-columns: repeat(12, 1fr);
    grid-column-gap: 14px;
    grid-row-gap: 14px;
    padding: 14px 0;

    > div {
        flex-shrink: 0;
        flex-grow: 0;
        width: 90px;
        height: 90px;
        flex-basis: 90px;
        display: flex;
        flex-grow: 0;
        align-items: center;
        justify-content: center;
        padding: 15px;
        font-size: 13px;
        text-align: center;
        flex-shrink: 0;
    }

    > .mint_group {
        border: 1px dashed var(--bg-light);
        background-color: var(--bg-light);
        //padding: 30px;
        cursor: pointer;
        transition-duration: 0.2s;

        &:hover {
            border-color: var(--primary-color);
            transform: scale(1.1);
        }
    }

    .capped_sign {
        border: 2px dashed var(--bg-wallet);
        background-color: transparent;
        color: var(--primary-color-light);
    }
}

@include main.medium-device {
    .mint_group {
        > div {
            width: 60px;
            height: 60px;
            flex-basis: 60px;
            padding: 12px;
            font-size: 11px;
        }
    }
}
</style>
