<template>
    <div>
        <div  v-if="!isEmpty">
            <div v-for="(utxos, id) in nftDict" :key="id">
                <div class="fam_header">
                    <p class="symbol">{{nftFamsDict[id].symbol}}</p>
                    <p>{{nftFamsDict[id].name}}</p>
                </div>
                <div class="list">
                    <NFTCard class="nft_card" v-for="utxo in utxos" :utxo="utxo" :key="utxo.id"></NFTCard>
                </div>
            </div>
        </div>
        <div class="coming_soon" v-else>
            <img v-if="$root.theme==='day'" src="@/assets/nft_preview.png">
            <img v-else src="@/assets/nft_preview_night.png">
            <p>You do not own any NFTs.</p>
        </div>
    </div>
</template>
<script lang="ts">
    import NFTCard from './NftCard.vue';
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';
    import {IWalletNftDict} from "@/store/types";
    import {AvaNftFamily} from "@/js/AvaNftFamily";
    import {NftFamilyDict} from "@/store/modules/assets/types";

    // const payloadTypes = PayloadTypes.getInstance();

    @Component({
        components: {
            NFTCard
        }
    })
    export default class Collectibles extends Vue{
        get isEmpty(): boolean{
            return this.$store.getters.walletNftUTXOs.length === 0;
        }

        get nftDict(): IWalletNftDict{
            return this.$store.getters.walletNftDict;
        }

        get nftFamsDict(): NftFamilyDict{
            return this.$store.state.Assets.nftFamsDict;
        }
    }
</script>
<style lang="scss" scoped>
@use '../../../main';

    $flip_dur: 0.6s;


    .coming_soon{
        padding-top: 60px;
        text-align: center;
        img{
            width: 100%;
            max-width: 560px;
        }

        p {
            font-weight: lighter;
            font-size: 28px;
            color: var(--primary-color-light);
        }
    }

    .list{
        display: grid;
        padding: 30px 0;
        grid-template-columns: repeat(4,1fr);
        grid-row-gap: 15px;
        grid-column-gap: 15px;
    }


    .nft_card{
        
        transition-duration: 0.3s;
    }


    .fam_header{
        width: 100%;
        /*display: flex;*/
        margin: 30px 0 8px;
        /*border-bottom: 1px solid var(--primary-color-light);*/
        font-size: 1.4rem;
        display: grid;
        grid-template-columns: 80px 1fr;
    }

    .symbol{
        color: var(--primary-color-light);
    }

    @include main.mobile-device{
        .list{
            grid-template-columns: repeat(2,1fr);
        }
    }
    @include main.large-device{
        .list{
            grid-template-columns: repeat(4,1fr);
        }
    }
    @include main.xl-device{
        .list{
            grid-template-columns: repeat(4,1fr);
        }
    }
    @include main.largest-device{
        .list{
            grid-template-columns: repeat(6,1fr);
        }
    }

</style>
