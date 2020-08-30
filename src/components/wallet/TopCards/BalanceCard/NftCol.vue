<template>
    <div class="nft_col">
        <h4>NFTs</h4>
        <p v-if="isEmpty">{{$t('top.nftempty')}}</p>
        <div v-else>
            <p>{{statusText}}</p>
            <div class="nft_list">
                <NftCard v-for="nft in nftArray" class="nft_item" :key="nft.id" :mini="true" :utxo="nft"></NftCard>
                <div v-for="i in dummyAmt" class="nft_item dummy_item" :key="i"></div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import { Vue, Component, Prop, Ref, Watch} from 'vue-property-decorator';
    import {IWalletNftDict} from "@/store/types";
    // import {UTXO} from "avalanche";
    import { UTXO} from "avalanche/dist/apis/avm";
    import NftCard from "@/components/wallet/portfolio/NftCard.vue";

    @Component({
        components: {
            NftCard
        }
    })
    export default class NftCol extends Vue{
        get isEmpty(): boolean{
            return this.$store.getters.walletNftUTXOs.length === 0;
        }

        get nftDict(): IWalletNftDict{
            return this.$store.getters.walletNftDict;
        }

        get collectionAmt(): number{
            let count = 0;
            for(var col in this.nftDict){
                count++;
            }
            return count;
        }

        get nftArray(): UTXO[]{
            let utxos: UTXO[] = this.$store.getters.walletNftUTXOs;
            return utxos.slice(0,10);
        }

        get dummyAmt(): number{
            return 10 - this.nftArray.length;
        }

        get collectedAmt(): number{
            return this.nftArray.length;
        }


        get statusText(): string{
            let res = `${this.collectedAmt} NFTs collected from ${this.collectionAmt} Collections`;
            return res;
        }
    }
</script>
<style scoped lang="scss">
    .nft_col{
        p{
            font-size: 12px;
            color: var(--primary-color-light);
        }
    }

    $nft_w: 35px;


    .nft_list{
        margin-top: 8px;
        display: grid;
        grid-template-columns: repeat(5, $nft_w);
        grid-gap: 8px;
        /*display: flex;*/
        /*flex-wrap: wrap;*/
    }

    .nft_item{
        height: $nft_w;
        width: $nft_w;
        border-radius: 4px;
        overflow: hidden;
        background-color: var(--bg-light);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .dummy_item{
        opacity: 0.2;
    }
</style>