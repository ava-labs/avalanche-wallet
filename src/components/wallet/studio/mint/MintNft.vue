<template>
    <div>
        <div v-if="!mintUtxo">
            <p>{{ $t('studio.mint.desc') }}</p>
            <SelectMintUTXO @change="setUtxo" class="select_mint_utxo"></SelectMintUTXO>
        </div>
        <MintForm v-else :mint-utxo="mintUtxo" @clearUtxo="clearUtxo" @cancel="cancel"></MintForm>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { ava } from '@/AVA'
import { bnToBig } from '@/helpers/helper'
import Big from 'big.js'

import SelectMintUTXO from '@/components/wallet/studio/mint/SelectMintUtxo/SelectMintUTXO.vue'
import MintForm from '@/components/wallet/studio/mint/MintForm.vue'
import { UTXO } from '@c4tplatform/camino/dist/apis/avm'
@Component({
    components: {
        SelectMintUTXO,
        MintForm,
    },
})
export default class MintNft extends Vue {
    isLoading = false
    mintUtxo: null | UTXO = null

    get txFee(): Big {
        return bnToBig(ava.PChain().getTxFee(), 9)
    }

    async submit() {
        let wallet = this.$store.state.activeWallet
        if (!wallet) return

        this.isLoading = true
        this.isLoading = false
    }

    get mintUtxos() {
        // return this.$store.getters.walletNftMintUTXOs
        return this.$store.state.Assets.nftMintUTXOs
    }

    setUtxo(utxo: UTXO) {
        this.mintUtxo = utxo
    }

    clearUtxo() {
        this.mintUtxo = null
    }

    cancel() {
        this.$emit('cancel')
    }

    mounted() {
        let utxoId = this.$route.query.utxo

        // Select the utxo in the query if possible
        if (utxoId) {
            let utxos: UTXO[] = this.mintUtxos

            for (var i = 0; i < utxos.length; i++) {
                let utxo = utxos[i]
                let id = utxo.getUTXOID()

                if (id === utxoId) {
                    this.setUtxo(utxo)
                }
            }
        }
    }
}
</script>
<style scoped lang="scss"></style>
