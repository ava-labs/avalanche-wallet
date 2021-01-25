<template>
    <div class="list_cont">
        <v-tabs grow>
            <v-tab>Internal</v-tab>
            <v-tab>External</v-tab>
            <v-tab>Platform</v-tab>
            <v-tab-item>
                <div v-if="numInternalKeys > 0" class="list">
                    <div class="headers">
                        <p style="text-align: center">#</p>
                        <p>{{ $t('portfolio.address') }}</p>
                        <p class="col_bal">{{ $t('portfolio.balance') }}</p>
                    </div>
                    <HdDerivationListRow
                        v-for="(addr, i) in addrsInternal"
                        :key="addr"
                        :index="i"
                        :address="addr"
                        :balance="keyBalancesInternal[i]"
                        :path="1"
                        class="list_row"
                    ></HdDerivationListRow>
                </div>
                <div v-else>
                    <p class="empty">You do not have any past addresses.</p>
                </div>
            </v-tab-item>
            <v-tab-item>
                <div v-if="numExternalKeys > 0" class="list">
                    <div class="headers">
                        <p style="text-align: center">#</p>
                        <p>{{ $t('portfolio.address') }}</p>
                        <p class="col_bal">{{ $t('portfolio.balance') }}</p>
                    </div>
                    <HdDerivationListRow
                        v-for="(addr, i) in addrsExternal"
                        :key="addr"
                        :index="i"
                        :address="addr"
                        :balance="keyBalancesExternal[i]"
                        :path="0"
                        class="list_row"
                    ></HdDerivationListRow>
                </div>
                <div v-else>
                    <p class="empty">{{ $t('portfolio.noaddresses') }}</p>
                </div>
            </v-tab-item>
            <v-tab-item>
                <div class="headers">
                    <p style="text-align: center">#</p>
                    <p>{{ $t('portfolio.address') }}</p>
                    <p class="col_bal">{{ $t('portfolio.balance') }}</p>
                </div>
                <HdDerivationListRow
                    v-for="(addr, i) in addrsPlatform"
                    :key="addr"
                    :index="i"
                    :address="addr"
                    :balance="keyBalancesPlatform[i]"
                    :path="0"
                    class="list_row"
                ></HdDerivationListRow>
            </v-tab-item>
        </v-tabs>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

import AvaHdWallet from '@/js/wallets/AvaHdWallet'
import { KeyPair as AVMKeyPair, UTXOSet as AVMUTXOSet } from 'avalanche/dist/apis/avm'
import { UTXOSet as PlatformUTXOSet } from 'avalanche/dist/apis/platformvm'
import { ava, bintools } from '@/AVA'
import Big from 'big.js'
import AvaAsset from '@/js/AvaAsset'
import HdDerivationListRow from '@/components/modals/HdDerivationList/HdDerivationListRow.vue'
import { DerivationListBalanceDict } from '@/components/modals/HdDerivationList/types'
import { KeyPair as PlatformVMKeyPair } from 'avalanche/dist/apis/platformvm'
import { LedgerWallet } from '../../../js/wallets/LedgerWallet'
import { bnToBig } from '@/helpers/helper'
import { BN } from 'avalanche'

@Component({
    components: {
        HdDerivationListRow,
    },
})
export default class HDDerivationList extends Vue {
    @Prop() wallet!: AvaHdWallet | LedgerWallet

    addrsExternal: string[] = []
    addrsInternal: string[] = []
    addrsPlatform: string[] = []

    @Watch('wallet.internalHelper.utxoSet', { immediate: true })
    onInternalUtxoChange() {
        this.addrsInternal = this.wallet.internalHelper.getAllDerivedAddresses()
    }

    @Watch('wallet.externalHelper.utxoSet', { immediate: true })
    onExternalUtxoChange() {
        this.addrsExternal = this.wallet.externalHelper.getAllDerivedAddresses()
    }

    @Watch('wallet.platformHelper.utxoSet', { immediate: true })
    onPlatformUtxoChange() {
        this.addrsPlatform = this.wallet.platformHelper.getAllDerivedAddresses()
    }

    get assetsDict() {
        return this.$store.state.Assets.assetsDict
    }

    get keyBalancesExternal(): DerivationListBalanceDict[] {
        let wallet = this.wallet
        let utxoSet = wallet.externalHelper.utxoSet as AVMUTXOSet
        let addrs = this.addrsExternal

        return this.utxoSetToBalanceDict(utxoSet, addrs)
    }

    utxoSetToBalanceDict(
        set: AVMUTXOSet | PlatformUTXOSet,
        addrs: string[]
    ): DerivationListBalanceDict[] {
        let assets: AvaAsset[] = this.$store.state.Assets.assets

        let denoms: number[] = assets.map((asset) => {
            return asset.denomination
        })
        let assetIds: string[] = this.$store.getters['Assets/assetIds']

        let res = []
        for (var i = 0; i < addrs.length; i++) {
            let balDict: DerivationListBalanceDict = {}
            let addrBuff = bintools.stringToAddress(addrs[i])
            assetIds.forEach((assetId, index) => {
                let bal: BN = set.getBalance([addrBuff], assetId)

                if (!bal.isZero()) {
                    let balBig = bnToBig(bal, denoms[index])
                    balDict[assetId] = balBig
                }
            })
            res.push(balDict)
        }
        return res
    }

    get numExternalKeys() {
        return this.addrsExternal.length
    }

    get numInternalKeys() {
        return this.addrsInternal.length
    }

    get keyBalancesInternal(): DerivationListBalanceDict[] {
        let wallet = this.wallet
        let utxoSet = wallet.internalHelper.utxoSet
        let addrs = this.addrsInternal
        return this.utxoSetToBalanceDict(utxoSet, addrs)
    }

    get keyBalancesPlatform(): DerivationListBalanceDict[] {
        let wallet = this.wallet
        let utxoSet = wallet.platformHelper.utxoSet
        let addrs = this.addrsPlatform
        return this.utxoSetToBalanceDict(utxoSet, addrs)
    }
}
</script>
<style lang="scss">
.list_cont {
    .v-tabs-bar {
        background-color: var(--bg-light) !important;
    }

    .list_row:last-of-type {
        > .col_index,
        .col_addr {
            /*border-left: 2px solid var(--secondary-color);*/
            /*position: relative;*/
            color: var(--primary-color);
            /*background-color: #42b983;*/
        }
    }
}
</style>
<style scoped lang="scss">
.list_cont {
    max-height: 60vh;
    min-height: 290px;
    /*height: 290px;*/
    position: relative;
    overflow: scroll;
}

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
    background-color: var(--bg-light);
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
</style>
