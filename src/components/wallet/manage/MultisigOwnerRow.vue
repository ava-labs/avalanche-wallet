<template>
    <div class="addressItem">
        <div class="rows">
            <div class="header">
                <v-icon>{{ icon }}</v-icon>
                <div class="header_cols">
                    <h3 class="addressVal">
                        {{ name }}
                    </h3>
                    <span class="addressVal">
                        {{ address }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { WalletCore } from '@/js/wallets/WalletCore'

@Component({
    components: {},
})
export default class MultisigOwnerRow extends Vue {
    @Prop() wallet!: WalletCore
    @Prop() unlinkedAddress!: string

    get name() {
        return this.wallet?.name
    }

    get address(): string {
        return this.wallet ? this.wallet.getStaticAddress('X') : this.unlinkedAddress
    }

    get icon(): string {
        switch (this.wallet?.type) {
            case undefined:
                return 'mdi-link-off'
            case 'mnemonic':
                return 'mdi-list-box-outline'
            case 'multisig':
                return 'mdi-account-group-outline'
            default:
                return 'mdi-shield-key-outline'
        }
    }
}
</script>
<style scoped lang="scss">
@use '../../../styles/abstracts/mixins';

.addressItem {
    font-size: 12px;
    overflow: auto;
    padding: 4px 8px;

    > * {
        align-self: center;
        overflow: auto;
    }
    span {
        font-size: 12px;
        line-height: normal;
    }
}

.rows {
    overflow: auto;
}

.header {
    display: grid;
    grid-template-columns: 32px 1fr;
    grid-gap: 14px;
}

.v-icon.v-icon::after {
    transform: unset;
    --webkit-transform: unset;
}

.addressVal {
    overflow: auto;
    white-space: nowrap;
}

@include mixins.mobile-device {
    .header_cols {
        display: block;
    }
}
</style>
