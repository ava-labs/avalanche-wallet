<template>
    <tr>
        <td class="col_id">{{ utxo.getUTXOID() }}</td>
        <td>{{ typeName }}</td>
        <td>{{ out.getLocktime() }}</td>
        <td>{{ out.getThreshold() }}</td>
        <td>
            <p v-for="addr in addresses" :key="addr">{{ addr }}</p>
        </td>
        <td class="col_bal">
            <p>{{ balanceText }}</p>
            <p>{{ symbol }}</p>
        </td>
    </tr>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { AmountOutput, AVMConstants, UTXO as AVMUTXO } from 'avalanche/dist/apis/avm'
import { UTXO as PlatformUTXO } from 'avalanche/dist/apis/platformvm'
import { ava, bintools } from '@/AVA'
import AvaAsset from '@/js/AvaAsset'
import { bnToBig } from '@/helpers/helper'

@Component
export default class UTXORow extends Vue {
    @Prop() utxo!: AVMUTXO | PlatformUTXO

    get out() {
        return this.utxo.getOutput()
    }

    get typeID(): number {
        return this.out.getTypeID()
    }

    get addresses(): string[] {
        let addrs = this.out.getAddresses()

        let hrp = ava.getHRP()

        let addrsClean = addrs.map((addr) => {
            return bintools.addressToString(hrp, 'X', addr)
        })
        return addrsClean
    }
    // get typeName() {
    //     return this.utxo.getTypeID()
    // }
    get asset() {
        // if(this.typeID)
        let assetID = this.utxo.getAssetID()
        let idClean = bintools.cb58Encode(assetID)

        let asset =
            this.$store.state.Assets.assetsDict[idClean] ||
            this.$store.state.Assets.nftFamsDict[idClean]
        return asset
    }

    get symbol() {
        if (!this.asset) return '-'
        return this.asset.symbol
    }

    get balanceText() {
        if (!this.asset) return '-'

        if (this.typeID === 7) {
            let out = this.out as AmountOutput
            let denom = (this.asset as AvaAsset).denomination
            let bn = out.getAmount()
            return bnToBig(bn, denom).toLocaleString()
        }

        if ([6, 7, 10, 11].includes(this.typeID)) {
            return 1
        }
        return '-'
    }

    get typeName(): string {
        switch (this.typeID) {
            case 6:
                return 'SECP Mint Output'
            case 7:
                return 'SECP Transfer Output'
            case 10:
                return 'NFT Mint Output'
            case 11:
                return 'NFT Transfer Output'
        }
        return ''
    }
}
</script>
<style scoped lang="scss">
tr {
    font-size: 12px;
}

td {
    font-family: monospace;
}

.col_bal {
    display: grid;
    grid-template-columns: 1fr 50px;
}
</style>
