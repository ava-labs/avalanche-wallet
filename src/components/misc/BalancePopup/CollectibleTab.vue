<template>
    <div class="collectible_tab">
        <p v-if="isEmpty" class="empty">You do not own any collectibles.</p>
        <div v-else>
            <div v-for="(fam, famId) in nftDict" :key="famId" class="collectible_fam">
                <p class="fam_title">{{nftFamsDict[famId].name}}</p>
                <div class="card_grid">
                    <NftCard v-for="utxo in fam" :utxo="utxo" :key="utxo.id" :mini="true" class="card"></NftCard>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import {Vue, Prop, Component} from "vue-property-decorator";
    import {IWalletNftDict} from "@/store/types";
    import NftCard from "@/components/wallet/portfolio/NftCard.vue";
    import {NftFamilyDict} from "@/store/modules/assets/types";

    @Component({
        components: {
            NftCard
        }
    })
    export default class CollectibleTab extends Vue{
        get isEmpty(): boolean{
            return this.$store.getters.walletNftUTXOs.length === 0;
        }

        get nftFamsDict(): NftFamilyDict{
            return this.$store.state.Assets.nftFamsDict;
        }

        get nftDict(): IWalletNftDict{
            return this.$store.getters.walletNftDict;
        }
    }
</script>
<style scoped lang="scss">
    .collectible_tab{
        padding: 12px 18px;
    }

    .empty{
        text-align: center;
        padding: 4px 12px;
    }


    $card_w: 40px;
    .collectible_fam{

    }

    .fam_title{
        border-bottom: 2px solid var(--bg-light);
    }

    .card_grid{
        display: grid;
        grid-template-columns: repeat(5, $card_w);
        gap: 12px;
        padding: 8px 0;
    }

    .card{
        width: $card_w;
        height: $card_w;
        background-color: var(--bg-light);
        border-radius: 4px;
        overflow: hidden;
        transition-duration: 0.2s;
        cursor: pointer;
        border: 1px solid var(--bg-light);

        &:hover{
            border: 1px solid var(--secondary-color);
            transform: scale(1.1);
        }
    }
</style>