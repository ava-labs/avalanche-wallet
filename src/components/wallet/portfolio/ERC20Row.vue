<template>
    <div class="erc_row">
        <img :src="token.data.logoURI" />
        <p class="col_name">
            {{ token.data.name }} ({{ token.data.symbol }})
            <span>ERC20</span>
        </p>
        <p></p>
        <p class="col_bal">
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
}
</script>
<style scoped lang="scss">
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
    max-width: 40px;
    justify-self: center;
}

.col_bal {
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
</style>
