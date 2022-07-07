<template>
    <div class="list_row list_row_empty">
        <p class="col_index" style="text-align: center">{{ index }}</p>
        <p class="col_addr">
            <span>{{ address }}</span>
            &nbsp;
            <span class="verify" v-if="walletType === 'ledger'" @click="verifyLedgerAddress">
                {{ $t('create.verify') }}
            </span>
        </p>
        <p class="col_bal">{{ $t('modal.hd.no_use') }}</p>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { WalletType } from '@/js/wallets/types'

import { LedgerWallet } from '@/js/wallets/LedgerWallet'
import { ava } from '@/AVA'
import { AVA_ACCOUNT_PATH } from '@/js/wallets/MnemonicWallet'

@Component
export default class HdEmptyAddressRow extends Vue {
    @Prop() index!: number
    @Prop() path!: number
    @Prop() address!: string

    get wallet() {
        return this.$store.state.activeWallet as WalletType
    }

    get walletType() {
        return this.wallet.type
    }

    async verifyLedgerAddress() {
        const wallet = this.wallet as LedgerWallet

        let networkId = ava.getNetworkID()
        let hrp = ava.getHRP()

        wallet.app.getWalletAddress(`${AVA_ACCOUNT_PATH}/${this.path}/${this.index}`, hrp)
    }
}
</script>
<style scoped lang="scss">
.list_row_empty {
    color: var(--primary-color-light);
}
.col_index,
.col_bal {
    user-select: none;
}

.col_addr {
    /*white-space: nowrap;*/
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    font-family: monospace;
    color: var(--primary-color-light);

    .verify {
        opacity: 0;
        cursor: pointer;
        color: var(--primary-color);
        transition: opacity 0.1s;
        font-size: 11px;
        padding: 2px 4px;
        background: var(--bg-light);
        user-select: none;
    }

    &:hover {
        .verify {
            opacity: 1;
            transition: opacity 0.2s;
        }
    }
}

.col_bal {
    padding-right: 15px;
    text-align: right;
}
</style>
