<template>
    <div class="asset" :faded="!isBalance">
        <div class="icon">
            <img v-if="iconUrl" :src="iconUrl">
            <p v-else>?</p>
        </div>
        <p class="name_col">{{asset.name}} ({{asset.symbol}})</p>
        <router-link :to="sendLink" class="send_col" v-if="isBalance">
            <img src="@/assets/sidebar/Transfer.png">
        </router-link>
        <p v-else></p>
        <p class="balance_col" v-if="isBalance">{{asset.toString()}} <span>{{asset.symbol}}</span></p>
        <p class="balance_col" v-else>0 <span>{{asset.symbol}}</span></p>
    </div>
</template>
<script>
    import AvaAsset from "../../../js/AvaAsset";

    export default {
        props: {
            asset: {
                type: AvaAsset,
                required: true
            }
        },
        computed: {
            iconUrl(){
                let url = "/question-solid.svg";

                if(this.asset.symbol==='AVA'){
                    return "/ava_letter_icon.png";
                }


                return null;
            },
            isBalance(){
                if(this.asset.getAmount().gt(0)){
                    return true;
                }
                return false;
            },
            sendLink(){
                return `/wallet/transfer?asset=${this.asset.id}`;
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

        .icon{
            background-color: #303030;
            width: 30px;
            height: 30px;
            border-radius: 30px;
            line-height: 30px;
            text-align: center;
            transition-duration: 1s;

            img{
                width: 18px;
                object-fit: contain;

            }

            p{
                color: #fff;
            }
        }
    }


    .asset[faded]{
        opacity: 0.3;
        padding: 4px;
        font-size: 14px;

        $icon_w: 20px;
        .icon{
            width: $icon_w;
            height: $icon_w;
            border-radius: $icon_w;
            line-height: $icon_w;

            img{
                width: 12px;
            }
        }
        .balance_col{
            font-size: 14px;
        }
    }
</style>
