<template>
    <div class="hd_chain_table">
        <div class="headers">
            <p style="text-align: center">#</p>
            <p>{{ $t('portfolio.address') }}</p>
            <p class="col_bal">{{ $t('portfolio.balance') }}</p>
        </div>
        <div>
            <HdDerivationListRow
                v-for="(addr, i) in addresses"
                :key="addr"
                :index="i"
                :address="addr"
                :balance="balanceDict[i]"
                :path="path"
                class="list_row"
            ></HdDerivationListRow>
        </div>

        <div v-if="addressesFuture.length > 0" class="warn_row">
            <p>
                <b>{{ $t('modal.hd.future_warn_title') }}</b>
                <br />
                {{ $t('modal.hd.future_warn_desc') }}
            </p>
        </div>
        <HdEmptyAddressRow
            v-for="(addr, i) in addressesFuture"
            :key="addr"
            :index="addresses.length + i"
            :address="addr"
            :path="path"
        ></HdEmptyAddressRow>
        <div class="more_address">
            <button @click="showMore">{{ $t('modal.hd.show_more') }}</button>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import { LedgerWallet } from '@/js/wallets/LedgerWallet'
import { DerivationListBalanceDict } from '@/components/modals/HdDerivationList/types'
import HdDerivationListRow from '@/components/modals/HdDerivationList/HdDerivationListRow.vue'
import HdEmptyAddressRow from '@/components/modals/HdDerivationList/HdEmptyAddressRow.vue'
import { HdHelper } from '@/js/HdHelper'
@Component({
    components: { HdEmptyAddressRow, HdDerivationListRow },
})
export default class HdChainTable extends Vue {
    @Prop() wallet!: MnemonicWallet | LedgerWallet
    @Prop() addresses!: string[]
    @Prop() balanceDict!: DerivationListBalanceDict[]
    @Prop() path!: number
    @Prop() helper!: HdHelper

    addressesFuture: string[] = []

    showMore() {
        this.addFutureAddress(10)
    }

    addFutureAddress(amt: number) {
        let indexNow = this.addresses.length + this.addressesFuture.length
        let addrs = []
        for (var i = indexNow; i < indexNow + amt; i++) {
            let addr = this.helper.getAddressForIndex(i)
            addrs.push(addr)
        }
        this.addressesFuture.push(...addrs)
    }
}
</script>
<style lang="scss">
.hd_chain_table {
    .list_row:last-of-type {
        .col_addr {
            color: var(--primary-color) !important;
        }
        .col_bal {
            color: var(--primary-color) !important;
        }
    }
}
</style>
<style scoped lang="scss">
.list_row {
    border-bottom: 1px solid var(--bg-light);

    &:last-of-type {
        border: none;
    }
}

.headers {
    position: sticky;
    top: 0;
    border-bottom: 1px solid var(--bg-light);
    font-weight: bold;
    background-color: var(--bg);
}

.headers,
.list_row {
    display: grid;
    grid-template-columns: 35px 2fr 1fr;
    padding: 5px 0px;
    column-gap: 10px;
}

.col_bal {
    text-align: right;
    padding-right: 15px;
    padding-left: 15px;
}

.empty {
    width: 100%;
    text-align: center;
    padding: 30px;
}

.warn_row {
    padding: 14px;
    text-align: center;
    color: #fff;
    background-color: var(--secondary-color);
}

.more_address {
    padding: 12px 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    button {
        color: var(--secondary-color);
    }
}
</style>
