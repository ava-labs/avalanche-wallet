<template>
    <div>
        <div class="headers">
            <p></p>
            <p>Name</p>
            <p>Network ID</p>
            <p>Send</p>
            <p>Receive</p>
            <p>Swap</p>
            <p  class="balance_col">Balance</p>
        </div>
        <div class="scrollable">
            <div class="asset" v-for="asset in assets" :key="asset.id">
                <div class="icon">
                    <img src="@/assets/ava_letter_icon.png">
                </div>
                <p>{{asset.name}} ({{asset.symbol}})</p>
                <p>NETWORK ID</p>
                <router-link :to="`/wallet/send`" class="send_col">
                    <img src="@/assets/sidebar/Transfer.png">
                </router-link>
                <router-link :to="`/wallet/send`" class="send_col">
                    <img src="@/assets/sidebar/Transfer.png">
                </router-link>
                <router-link :to="`/wallet/send`" class="send_col">
                    <img src="@/assets/sidebar/Transfer.png">
                </router-link>
                <p class="balance_col">{{asset.toString()}} {{asset.symbol}}</p>
            </div>
        </div>
        <div v-if="assets.length === 0" class="empty">
            <p>You do not have any assets</p>

            <div class="faucet">
                <p class="drop"><fa icon="tint"></fa></p>
                <p>{{$t('transfer.faucet')}} </p>
                <a :href="faucetLink" target="_blank" class="but_primary">Go to faucet</a>
            </div>

        </div>
    </div>
</template>
<script>
    export default {
        computed: {
            assets(){
                return this.$store.getters['Assets/assetsArray'];
            },
            isUpdateBalance(){
                return this.$store.state.Assets.isUpdateBalance;
            },
            faucetLink(){
                let link = process.env.VUE_APP_FAUCET_LINK;
                if(link) return link;
                return null;
            },
        },
    }
</script>
<style scoped lang="scss">
    .headers, .asset{
        display: grid;
        grid-template-columns: 50px 1fr 1fr 100px 100px 100px 1fr;
    }


    .headers{
        border-bottom: 1px solid #E6E6E666;
    }

    .balance_col{
        text-align: right;
    }

    .asset{
        padding: 14px 0px;

        > * {
            align-self: center;
        }

        .balance_col{
            font-size: 24px;
            font-family: Inconsolata;
            text-align: right;
        }

        .send_col{
            text-align: left;
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

            img{
                width: 18px;
                object-fit: contain;

            }
        }
    }

    .empty{
        padding: 30px;
        text-align: center;
    }

    .faucet{
        width: max-content;
        /*border: 1px solid #999;*/
        margin: 0px auto;
        margin-top: 60px;
        p{
            margin: 10px 0px !important;
        }

        .drop{
            font-size: 45px;
        }
    }

</style>
