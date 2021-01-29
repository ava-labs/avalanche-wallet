<template>
    <div>
        <div class="fam_header">
            <p class="name">{{ family.name }}</p>
            <p class="symbol">{{ family.symbol }}</p>
            <p class="fam_id">{{ family.id }}</p>
        </div>
        <div class="list">
            <CollectibleFamilyGroup
                v-for="(group, id) in groupDict"
                :key="id"
                :utxos="group"
                class="group"
            ></CollectibleFamilyGroup>
            <div v-if="canMint" class="group mint_card">
                <p>
                    {{ $t('portfolio.collectibles.mint_more') }}
                </p>
                <v-btn class="button_secondary" small depressed :to="mintUrl">
                    {{ $t('portfolio.collectibles.mint_submit') }}
                </v-btn>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { AvaNftFamily } from '@/js/AvaNftFamily'
import NFTCard from './NftCard.vue'
import { IWalletNftDict, IWalletNftMintDict } from '@/store/types'
import { NFTTransferOutput, UTXO, AVMConstants, NFTMintOutput } from 'avalanche/dist/apis/avm'
import { NftGroupDict } from '@/components/wallet/portfolio/types'
import CollectibleFamilyGroup from '@/components/wallet/portfolio/CollectibleFamilyGroup.vue'
@Component({
    components: {
        NFTCard,
        CollectibleFamilyGroup,
    },
})
export default class CollectibleFamilyRow extends Vue {
    @Prop() family!: AvaNftFamily

    // get groups() {}
    get nftDict(): IWalletNftDict {
        // return this.$store.getters.walletNftDict
        return this.$store.getters['Assets/walletNftDict']
    }

    get nftMintDict(): IWalletNftMintDict {
        // return this.$store.getters.walletNftMintDict
        return this.$store.getters['Assets/nftMintDict']
    }

    get utxos(): UTXO[] {
        return this.nftDict[this.family.id] || []
    }

    get mintUtxos(): UTXO[] {
        return this.nftMintDict[this.family.id] || []
    }

    get canMint() {
        return this.mintUtxos.length > 0
    }

    get groupDict(): NftGroupDict {
        let dict: NftGroupDict = {}
        for (var i = 0; i < this.utxos.length; i++) {
            let utxo = this.utxos[i]
            let out = utxo.getOutput() as NFTTransferOutput
            let groupId = out.getGroupID()

            let target = dict[groupId]
            if (target) {
                target.push(utxo)
            } else {
                dict[groupId] = [utxo]
            }
        }
        return dict
    }
    get allUtxos(): UTXO[] {
        return this.utxos.concat(this.mintUtxos)
    }

    get mintUrl() {
        if (this.mintUtxos.length === 0) return ''
        let mintUtxo = this.mintUtxos[0]

        return `/wallet/studio?utxo=${mintUtxo.getUTXOID()}`
    }

    get groupIds(): number[] {
        let ids: number[] = this.allUtxos.map((val) => {
            let id = val.getOutput().getOutputID()
            if (id === AVMConstants.NFTMINTOUTPUTID) {
                let out = val.getOutput() as NFTMintOutput
                return out.getGroupID()
            } else {
                let out = val.getOutput() as NFTTransferOutput
                return out.getGroupID()
            }
        })

        let idsUnique = ids.filter((val, index) => {
            return ids.indexOf(val) === index
        })

        idsUnique.sort((a, b) => {
            return a - b
        })

        return idsUnique
    }
}
</script>
<style scoped lang="scss">
@use '../../../main';

.fam_header {
    width: 100%;
    margin: 12px 0;
    margin-bottom: 16px;
    font-size: 18px;
    display: grid;
    grid-template-columns: max-content max-content 1fr;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--bg-light);
}

.fam_id {
    word-break: break-all;
    text-align: right;
    color: var(--primary-color-light);
    font-size: 13px;
    align-self: center;
}
.name {
    padding-right: 10px;
}
.symbol {
    padding-left: 10px;
    color: var(--primary-color-light);
    border-left: 1px solid var(--primary-color-light);
}

.list {
    display: flex;
    flex-wrap: wrap;
}

.group {
    align-self: flex-end;
    width: 180px;
    max-width: 100%;
    height: 220px;
    margin-right: 14px;
    margin-bottom: 14px;
}

.mint_card {
    border-radius: 14px;
    font-size: 13px;
    border: 1px dashed var(--primary-color-light);
    padding: 12px 12px;
    color: var(--primary-color);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

@include main.medium-device {
    .group {
        width: 120px;
        height: 180px;
    }
}

@include main.mobile-device {
    .fam_header {
        grid-template-columns: max-content 1fr;
    }

    .group {
        //height: 80vh;
        height: 40vh;
        width: 80vw;
    }

    .fam_id {
        grid-column: 1/3;
        text-align: left;
    }
    .mint_card {
        height: max-content;
    }
    .list {
    }
}
</style>
