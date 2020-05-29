<template>
    <div class="balance_card">
        <div class="fungible_card">
            <div class="header">
                <div class="refresh">
                    <img v-if="isUpdateBalance" src="/gif/loading_2.gif">
                    <button v-else @click="updateBalance"><fa icon="sync"></fa></button>
                </div>
                <h4>{{$t('top.title2')}}</h4>
            </div>
            <div class="balance_row">
                <p class="balance">{{balanceText}} AVA</p>
            </div>
            <div class="alt_info">
                <div>
                    <label>Available</label>
                    <p>{{ava_asset.toString()}} AVA</p>
                </div>
                <div>
                    <label>Shared</label>
                    <p>- AVA</p>
                </div>
                <div>
                    <label>Multisig</label>
                    <p>- AVA</p>
                </div>
            </div>
        </div>
        <div class="nft_card">
            <h4>NFTs</h4>
            <p>You have not collected any non fungible tokens.</p>
        </div>
    </div>
</template>
<script>
    export default {
        methods: {
            updateBalance(){
                this.$store.dispatch('Assets/updateUTXOs');
                this.$store.dispatch('History/updateTransactionHistory');
            }
        },
        computed: {
            ava_asset(){
                return this.$store.getters['Assets/AssetAVA'];
            },
            balanceText(){
                if(this.ava_asset !== null){
                    return this.ava_asset.toString();
                }else{
                    return '-'
                }
            },
            isUpdateBalance(){
                return this.$store.state.Assets.isUpdateBalance;
            },
        }
    }
</script>
<style scoped lang="scss">
    @use '../../../../main';
    .balance_card{
        display: grid !important;
        grid-template-columns: 1fr 140px;
        column-gap: 20px;
    }

    .nft_card{
        border-left: 1px solid #DADCE2;
    }
    .fungible_card{
        display: grid !important;
        grid-template-rows: max-content 1fr max-content;
        flex-direction: column;
    }

    .header{
        display: flex;

        h4{
            margin-left: 12px;
        }
    }
    h4{
        font-weight: normal;
    }

    .balance_row{
        align-self: center;
    }
    .balance{
        font-size: 2.8em !important;
        white-space: nowrap;
        /*font-weight: bold;*/
        font-family: Rubik !important;
    }

    .refresh{
        width: 20px;
        height: 20px;

        img{
            object-fit: contain;
            width: 100%;
        }
    }
    .buts{
        width: 100%;
        text-align: right;
    }
    .buts button{
        font-size: 18px;
        margin: 0px 18px;
        margin-right: 0px;
        position: relative;
        outline: none;
    }

    .buts img{
        height: 20px;
        width: 20px;
        object-fit: contain;
    }
    .buts button[tooltip]:hover:before{
        border-radius: 4px;
        /*left: 0;*/
        left: 0;
        transform: translateX(-50%);
        content: attr(tooltip);
        position: absolute;
        background-color: #303030;
        bottom: 100%;
        color: #ddd;
        width: max-content;
        max-width: 100px;
        font-size: 14px;
        padding: 4px 8px;
    }

    .alt_info{
        display: grid;
        grid-template-columns: repeat(3, max-content);
        column-gap: 10px;
        > div{
            padding-right: 30px;
            border-right: 2px solid #F5F6FA;
            &:last-of-type{
                border: none;
            }
        }

        label{
            font-size: 12px;
            color: #909090;
        }
    }



    .nft_card{
        padding-left: 20px;

        p{
            font-size: 12px;
            color: #909090;
        }
    }


    @media only screen and (max-width: main.$mobile_width) {
        .balance_card{
            grid-template-columns: none;
        }

        .nft_card{
            padding: 0;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #DADCE2;
            border-left: none;
        }

        .balance{
            font-size: 2em !important;
        }

        .alt_info{
            grid-template-columns: none;
            text-align: left;

            >div{
                padding: 0;
                border: none;
            }
        }
    }
</style>
