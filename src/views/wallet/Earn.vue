<template>
    <div>
        <div class="header">
            <h1>Earn </h1>
            <h1 class="subtitle" v-if="pageNow">/ {{subtitle}} <span @click="cancel"><fa icon="times"></fa></span></h1>
        </div>
        <transition name="fade" mode="out-in">
            <div v-if="!pageNow">
                <p>You can earn more AVAX by staking your existing tokens.</p>
                <div class="options">
                    <div>
                        <h4 class="title">Validate</h4>
                        <p style="flex-grow: 1">You have an Avalanche node that you want to stake with.</p>
                        <p v-if="pNoBalance" class="no_balance">You must have AVAX on the P chain to add a validator.</p>
                        <v-btn class="button_secondary" data-cy="validate" @click="addValidator" depressed small :disabled="pNoBalance">Add Validator</v-btn>
<!--                        <v-btn class="button_secondary" depressed small disabled>Coming Soon</v-btn>-->
                    </div>
                    <div>
                        <h4 class="title">Delegate</h4>
                        <p style="flex-grow: 1">You do not own an Avalanche node, but you want to stake using another node.</p>
                        <p v-if="pNoBalance" class="no_balance">You must have AVAX on the P chain to become a delegator.</p>
                        <v-btn class="button_secondary" data-cy="delegate" @click="addDelegator" depressed small :disabled="pNoBalance">Add Delegator</v-btn>
<!--                        <v-btn class="button_secondary" depressed small disabled>Coming Soon</v-btn>-->
                    </div>
                    <div>
                        <h4 class="title">Cross Chain Transfer</h4>
                        <p style="flex-grow: 1">Staking requires AVAX on the P chain. Transfer tokens between X and P.</p>
                        <v-btn class="button_secondary" data-cy="swap" @click="transfer" depressed small>Transfer</v-btn>
                    </div>
                </div>
            </div>
            <div v-else>
                <component  :is="pageNow" class="comp" @cancel="cancel"></component>
            </div>
        </transition>
    </div>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";

import AddValidator from "@/components/wallet/earn/Validate/AddValidator.vue";
import AddDelegator from "@/components/wallet/earn/Delegate/AddDelegator.vue";
import ChainTransfer from "@/components/wallet/earn/ChainTransfer.vue";
import {BN} from "avalanche/dist";

@Component({
    name: "earn",
    components: {
        AddValidator,
        AddDelegator,
        ChainTransfer
    }
})
export default class Earn extends Vue{
    pageNow: any = null;
    subtitle: string = '';

    addValidator(){
        this.pageNow = AddValidator;
        this.subtitle = "Validate"
    }
    addDelegator(){
        this.pageNow = AddDelegator;
        this.subtitle = "Delegate"
    }
    transfer(){
        this.pageNow = ChainTransfer;
        this.subtitle = "Cross Chain Transfer"
    }
    cancel(){
        this.pageNow = null;
        this.subtitle = '';
    }
    get platformUnlocked(): BN{
        return this.$store.getters.walletPlatformBalance;
    }

    get pNoBalance(){
        return this.platformUnlocked.isZero();
    }
}
</script>
<style scoped lang="scss">
@use '../../main';
.header{
    display: flex;
    /*justify-content: space-between;*/
    /*align-items: center;*/
    align-items: center;

    .subtitle{
        margin-left: 0.5em;
        /*font-size: 20px;*/
        color: var(--primary-color-light);
        font-weight: lighter;
    }

    span{
        margin-left: 1em;

        &:hover{
            color: var(--primary-color);
            cursor: pointer;
        }
    }
}
    .options{
        margin: 30px 0;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-gap: 14px;
        //display: flex;
        //justify-content: space-evenly;
        //padding: 60px;

        >div{
            width: 100%;
            justify-self: center;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: flex-start;
            //max-width: 260px;
            padding: 30px;
            border-radius: 4px;
            background-color: var(--bg-light);
        }

        h4{
            font-size: 32px !important;
            font-weight: lighter;
            color: var(--primary-color-light)
        }

        p{
            /*color: var(--primary-color-light);*/
            margin: 14px 0 !important;
        }

        .no_balance{
            color: var(--secondary-color);
        }

        .v-btn{
            margin-top: 14px;
        }
    }

    span{
        color: var(--primary-color-light);
        opacity: 0.5;
        float: right;
        font-weight: lighter;
    }

    .cancel{
        font-size: 13px;
        color: var(--secondary-color);
        justify-self: flex-end;
    }

    .comp{
        margin-top: 14px;
    }


    @include main.mobile-device{
        .options{
            grid-template-columns: none;
            grid-row-gap: 15px;
        }
    }
</style>
