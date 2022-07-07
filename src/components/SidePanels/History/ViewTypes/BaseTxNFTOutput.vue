<template>
    <div class="nft_output">
        <!--        <p class="fam_title">{{ assetDetail.name }}</p>-->
        <div class="fam_row">
            <tx-history-nft-family-group
                v-for="(utxos, groupNum) in groupDict"
                :asset-i-d="assetID"
                :utxos="utxos"
                :key="groupNum"
                class="fam_group"
            ></tx-history-nft-family-group>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import AvaAsset from '@/js/AvaAsset'
import { UTXO } from '@/store/modules/history/types'
import TxHistoryNftFamilyGroup from '@/components/SidePanels/TxHistoryNftFamilyGroup.vue'

interface GroupDict {
    [key: number]: UTXO[]
}

@Component({
    components: { TxHistoryNftFamilyGroup },
})
export default class BaseTxNFTOutput extends Vue {
    @Prop() assetID!: string
    @Prop() summary!: UTXO[]

    get assetDetail(): AvaAsset {
        return this.$store.state.Assets.nftFamsDict[this.assetID]
    }

    groupDict: GroupDict = {}
    created() {
        let groupDict: GroupDict = {}
        this.summary.forEach((utxo) => {
            let groupID = utxo.groupID

            if (groupDict[groupID]) {
                groupDict[groupID].push(utxo)
            } else {
                groupDict[groupID] = [utxo]
            }
        })
        this.groupDict = groupDict
    }

    get groups(): number[] {
        let gNums: number[] = []

        this.summary.forEach((utxo) => {
            let groupID = utxo.groupID

            if (!gNums.includes(groupID)) {
                gNums.push(groupID)
            }
        })
        return gNums
    }
}
</script>
<style scoped lang="scss">
.amount {
    text-align: right;
    white-space: nowrap;
    font-size: 15px;
    color: #d04c4c;

    &[profit] {
        color: var(--success);
    }
}

.fam_title {
    text-align: right;
    color: var(--primary-color-light);
}

.fam_row {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
}

.fam_group {
    margin-left: 4px;
}
</style>
