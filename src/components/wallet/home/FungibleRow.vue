<template>
    <div class="asset">
        <div class="icon">
            <hexagon class="hex_bg" :is-ava="isAvaToken"></hexagon>
            <div class="icon_img">
                <img v-if="iconUrl" :src="iconUrl">
                <p v-else>?</p>
            </div>
        </div>
        <p class="name_col not_mobile">{{asset.name}} ({{asset.symbol}})</p>
        <p class="name_col mobile_only">{{asset.symbol}}</p>
        <router-link :to="sendLink" class="send_col" v-if="isBalance">
            <img src="@/assets/sidebar/Transfer.png">
        </router-link>
        <p v-else></p>
        <p class="balance_col" v-if="isBalance">{{asset.toString()}} <span>{{asset.symbol}}</span></p>
        <p class="balance_col" v-else>0 <span>{{asset.symbol}}</span></p>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';

    import AvaAsset from "../../../js/AvaAsset";
    import Hexagon from "@/components/misc/Hexagon.vue";

    @Component({
        components: {
            Hexagon
        }
    })
    export default class FungibleRow extends Vue {

        @Prop()  asset!: AvaAsset;



        get iconUrl(): string | null{
            if(!this.asset) return null;

            if(this.asset.symbol==='AVA'){
                return "/ava_letter_icon.png";
            }

            return null;
        }

        get isBalance(): boolean{
            if(!this.asset) return  false;
            if(this.asset.getAmount().gt(0)){
                return true;
            }
            return false;
        }

        get sendLink(): string{
            if(!this.asset) return `/wallet/transfer`;
            return `/wallet/transfer?asset=${this.asset.id}`;
        }

        get avaToken(): AvaAsset{
            return this.$store.getters['Assets/AssetAVA'];
        }

        get isAvaToken(): boolean{
            if(!this.asset) return false;

            if(this.avaToken.id === this.asset.id){
                return true;
            }else{
                return  false
            }
        }
    }
</script>
<style scoped lang="scss">
    @use '../../../main';

    .asset{
        padding: 14px 0px;
        justify-self: center;
        transition-duration: 1s;



        > * {
            align-self: center;
        }

        .balance_col{
            font-size: 24px;
            font-family: Inconsolata;
            text-align: right;
            transition-duration: 0.2s;
        }

        .name_col{
            padding-left: 15px;
            white-space: nowrap;
            overflow-y: hidden;
            text-overflow: ellipsis;
        }

        .send_col{
            text-align: center;
            img{
                width: 18px;
                object-fit: contain;
            }
        }


    }

    .icon{
        /*background-color: #303030;*/
        position: relative;
        width: 100%;
        height: 100%;
        align-self: center;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        transition-duration: 1s;
        /*display: grid;*/
        /*grid-template-rows: 1fr;*/
        /*grid-template-columns: 1fr;*/

        p{
            color: #aaa;
        }
    }

    .icon_img{
        position: absolute;
        /*top: 50%;*/
        /*left: 50%;*/
        img{
            width: 18px;
            object-fit: contain;
        }
    }

    .hex_bg{
        height: 100%;
        width: 100%;
    }

    .mobile_only{
        display: none;
    }

    @include main.mobile-device{
        .name_col{
            display: none;
        }


        .mobile_only{
            display: initial;
        }
    }
</style>
