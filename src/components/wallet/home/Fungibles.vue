<template>
    <div>
        <div class="headers">
            <p></p>
            <p class="name_col">Name</p>
            <p class="send_col">Send</p>
            <p  class="balance_col">Balance</p>
        </div>
        <div class="scrollable">
            <div class="asset" v-for="asset in assets" :key="asset.id">
                <div class="icon">
                    <img src="@/assets/ava_letter_icon.png">
                </div>
                <p class="name_col">{{asset.name}} ({{asset.symbol}})</p>
                <router-link :to="`/wallet/transfer`" class="send_col">
                    <img src="@/assets/sidebar/Transfer.png">
                </router-link>
                <p class="balance_col">{{asset.toString()}} <span>{{asset.symbol}}</span></p>
            </div>
        </div>
        <div v-if="assets.length === 0" class="empty">
            <p>You do not have any assets</p>

            <faucet-link class="faucet"></faucet-link>
        </div>
    </div>
</template>
<script>
    import FaucetLink from "@/components/misc/FaucetLink";
    export default {
        components: {
            FaucetLink
        },
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
    @use '../../../main';

    .headers, .asset{
        display: grid;
        grid-template-columns: 50px 1fr 100px 1fr;
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

            img{
                width: 18px;
                object-fit: contain;

            }
        }
    }

    .send_col{
        text-align: center;
    }

    .empty{
        padding: 30px;
        text-align: center;
    }

    .faucet{
        /*width: max-content;*/
        margin: 0px auto;
        margin-top: 60px;
    }

    .name_col{
        white-space: nowrap;
    }

    @media only screen and (max-width: main.$mobile_width) {
        .headers, .asset{
            grid-template-columns: 50px 1fr 1fr 50px;
        }

        .balance_col{
            span{
                display: none;
            }
        }
        .balance_col{
            grid-column: 3;
            grid-row: 1;
        }

        .send_col{
            grid-column: 4;
        }

        .headers{
            .send_col{
                display: none;
            }
        }
    }
</style>
