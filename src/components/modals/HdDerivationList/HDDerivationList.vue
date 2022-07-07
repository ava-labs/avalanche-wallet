<template>
    <div class="list_cont no_scroll_bar">
        <v-tabs grow>
            <v-tab>Internal</v-tab>
            <v-tab>External</v-tab>
            <v-tab>Platform</v-tab>
            <v-tab-item>
                <HdChainTable
                    :addresses="addrsInternal"
                    :balance-dict="keyBalancesInternal"
                    :wallet="wallet"
                    :path="1"
                    :helper="internalHelper"
                ></HdChainTable>
            </v-tab-item>
            <v-tab-item>
                <HdChainTable
                    :addresses="addrsExternal"
                    :balance-dict="keyBalancesExternal"
                    :wallet="wallet"
                    :path="0"
                    :helper="externalHelper"
                ></HdChainTable>
            </v-tab-item>
            <v-tab-item>
                <HdChainTable
                    :addresses="addrsPlatform"
                    :balance-dict="keyBalancesPlatform"
                    :wallet="wallet"
                    :path="0"
                    :helper="platformHelper"
                ></HdChainTable>
            </v-tab-item>
        </v-tabs>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import { UTXOSet as AVMUTXOSet } from '@c4tplatform/camino/dist/apis/avm'
import { UTXOSet as PlatformUTXOSet } from '@c4tplatform/camino/dist/apis/platformvm'
import { bintools } from '@/AVA'
import AvaAsset from '@/js/AvaAsset'
import { DerivationListBalanceDict } from '@/components/modals/HdDerivationList/types'
import { LedgerWallet } from '../../../js/wallets/LedgerWallet'
import { bnToBig } from '@/helpers/helper'
import { BN } from '@c4tplatform/camino'
import HdChainTable from '@/components/modals/HdDerivationList/HdChainTable.vue'

@Component({
    components: {
        HdChainTable,
    },
})
export default class HDDerivationList extends Vue {
    @Prop() wallet!: MnemonicWallet | LedgerWallet

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

    get internalHelper() {
        return this.wallet.internalHelper
    }
    get externalHelper() {
        return this.wallet.externalHelper
    }
    get platformHelper() {
        return this.wallet.platformHelper
    }

    get assetsDict() {
        return this.$store.state.Assets.assetsDict
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

    get keyBalancesExternal(): DerivationListBalanceDict[] {
        let wallet = this.wallet
        let utxoSet = wallet.externalHelper.utxoSet as AVMUTXOSet
        let addrs = this.addrsExternal

        return this.utxoSetToBalanceDict(utxoSet, addrs)
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
