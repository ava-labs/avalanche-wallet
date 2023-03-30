<template>
    <div class="erc_row">
        <img :src="token.data.logoURI" v-if="token.data.logoURI" />
        <div v-else class="no_logo">
            <p>?</p>
        </div>
        <p class="col_name">
            <span data-cy="token-erc20-name">{{ token.data.name }}</span>
            <span data-cy="token-erc20-symbol">({{ token.data.symbol }})</span>
            <span>ERC20</span>
        </p>
        <component
            :is="isBalance ? 'router-link' : 'div'"
            :to="isBalance ? sendLink : null"
            class="send_col"
            :style="{
                cursor: isBalance ? 'pointer' : 'not-allowed',
                opacity: isBalance ? 1 : 0.4,
            }"
        >
            <img v-if="$root.theme === 'day'" :src="require('@/assets/sidebar/transfer_nav.png')" />
            <img v-else :src="require('@/assets/sidebar/transfer_nav_night.svg')" />
        </component>
        <p class="balance_col">
            {{ balText }}
        </p>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import Erc20Token from '@/js/Erc20Token'

@Component
export default class ERC20Row extends Vue {
    @Prop() token!: Erc20Token

    get balText() {
        return this.token.balanceBig.toLocaleString()
    }

    get isBalance() {
        return !this.token.balanceBN.isZero()
    }

    get sendLink() {
        return `/wallet/home/transfer?chain=C&token=${this.token.data.address}`
    }
}
</script>
<style scoped lang="scss">
@use '../../../styles/abstracts/mixins';

.erc_row {
    > * {
        align-self: center;
    }
    padding: 14px 0px;
    //display: grid;
    //grid-template-columns: 30px;
}

img {
    object-fit: contain;
    width: 40px;
    height: 40px;
    border-radius: 40px;
    justify-self: center;
}

.balance_col {
    text-align: right;
    font-size: 18px;

    span {
        color: var(--primary-color-light) !important;
    }
}

.col_name {
    padding-left: 15px;

    span {
        font-size: 12px;
        color: var(--secondary-color);
    }
}

.send_col {
    text-align: center;
    opacity: 0.4;
    &:hover {
        opacity: 1;
    }
    img {
        width: 18px;
        object-fit: contain;
    }
}

.no_logo {
    text-align: center;
    height: 40px;
    width: 40px;
    border-radius: 40px;
    align-self: center;
    justify-self: center;
    background-color: var(--bg-light);
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--primary-color-light);
}

@include mixins.medium-device {
    .erc_row {
        padding: 6px 0;
    }

    $logo_w: 30px;
    img,
    .no_logo {
        width: $logo_w;
        height: $logo_w;
        border-radius: $logo_w;
    }
}

@include mixins.mobile-device {
}
</style>
