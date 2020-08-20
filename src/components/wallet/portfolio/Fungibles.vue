<template>
    <div class="fungibles_view">
        <div class="headers">
            <p class="name_col">Name</p>
            <p></p>
            <p class="send_col">Send</p>
            <p  class="balance_col">Balance</p>
        </div>
        <div v-if="networkStatus !== 'connected'" class="empty">
            <p>Unable to display assets. Disconnected from the network.</p>
        </div>
        <div v-else-if="walletBalances.length === 0" class="empty">
            <p>You do not have any assets</p>
        </div>
        <div class="scrollable" v-else>
            <fungible-row lass="asset" v-for="asset in walletBalances" :key="asset.id" :asset="asset"></fungible-row>
        </div>

    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';

    import FaucetLink from "@/components/misc/FaucetLink.vue";
    import FungibleRow from "@/components/wallet/portfolio/FungibleRow.vue";
    import AvaAsset from "@/js/AvaAsset";

    @Component({
        components: {
            FaucetLink,
            FungibleRow
        }
    })
    export default class Fungibles extends Vue{
        @Prop() search!: string;

        get networkStatus():string{
            let stat = this.$store.state.Network.status;
            return stat;
        }


        get walletBalancesSorted(): AvaAsset[]{
            let balance:AvaAsset[] = this.$store.getters['walletAssetsArray'];

            // Sort by balance, then name
            balance.sort((a,b) => {
                let symbolA = a.symbol.toUpperCase();
                let symbolB = b.symbol.toUpperCase();
                let amtA = a.getAmount();
                let amtB = b.getAmount();

                // AVA always on top
                if(symbolA === 'AVAX'){
                    return -1;
                }else if(symbolB === 'AVAX'){
                    return 1;
                }

                if(amtA.gt(amtB)){
                    return -1;
                }else if(amtA.lt(amtB)){
                    return 1;
                }

                if(symbolA < symbolB){
                    return -1;
                }else if(symbolA > symbolB){
                    return 1;
                }
                return 0;
            });

            return balance;
        }

        get walletBalances(): AvaAsset[]{

            let balance = this.walletBalancesSorted;

            if(this.search){
                balance = balance.filter(val => {
                    let query = this.search.toUpperCase();

                    let nameUp = val.name.toUpperCase();
                    let symbolUp = val.symbol.toUpperCase();

                    if(nameUp.includes(query) || symbolUp.includes(query)){
                        return true;
                    }else{
                        return false;
                    }
                });
            }

            return balance;
        }
    }
</script>
<style scoped lang="scss">
    @use '../../../main';


    .fungibles_view{
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .search{
        height: 20px;
        font-size: 15px;
        display: flex;
        align-items: center;
        margin-bottom: 30px;
        img{
            height: 100%;
            object-fit: contain;
            margin-right: 15px;
            opacity: 0.4;
        }

        input{
            outline: none;
        }
    }

    .headers{
        border-bottom: 1px solid var(--bg-light);
        font-size: 12px;
        padding: 53.76px 0 14px;
        color: var(--primary-color-light);
        font-weight: bold;
    }



    .scrollable{
        overflow-y: scroll;
        height: 450px;
        flex-grow: 1;
    }

    .asset{
        border-bottom: 1px solid var(--bg-light);

    }

    .send_col{
        text-align: center;
    }

    .empty{
        padding: 30px;
        text-align: center;
    }

    .faucet{
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
            padding: 14px 0;
            .send_col{
                display: none;
            }
        }
    }
</style>
<style lang="scss">
    @use '../../../main';
    .fungibles_view{
        .balance_col{
            text-align: right;
            display: grid;
            grid-template-columns: 1fr 80px;

            span{
                padding-left: 15px;
                text-align: left;
            }
        }

        .headers, .asset{
            display: grid;
            grid-template-columns: 50px 1fr 100px 1fr;
        }
    }

    @include main.mobile-device{
        .fungibles_view{
            .headers, .asset{
                grid-template-columns: 50px 1fr 1fr 50px;
            }

            .balance_col{
                span{
                    display: none;
                }
                grid-template-columns: 1fr;
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
    }
</style>
