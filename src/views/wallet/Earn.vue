<template>
    <div>
        <div class="header">
            <h1>Earn </h1>
            <h1 class="subtitle" v-if="pageNow">{{subtitle}} <span @click="cancel"><fa icon="times"></fa></span></h1>
        </div>
        <transition name="fade" mode="out-in">
            <div v-if="!pageNow">
                <p>You can earn more AVAX by staking your existing tokens.</p>
                <div class="options">
                    <div>
                        <p class="title">Validator</p>
                        <p style="flex-grow: 1">You have an Avalanche node that you want to stake with.</p>
                        <v-btn class="button_secondary" @click="addValidator" depressed small>Add Validator</v-btn>
                    </div>
                    <div>
                        <p class="title">Delegator</p>
                        <p style="flex-grow: 1">You do not own an Avalanche node, but you want to stake using another node.</p>
                        <v-btn class="button_secondary" @click="addDelegator" depressed small>Add Delegator</v-btn>
                    </div>
                    <div>
                        <p class="title">Cross Chain Transfer</p>
                        <p style="flex-grow: 1">Staking requires AVAX on the P chain. Transfer tokens between X and P.</p>
                        <v-btn class="button_secondary" @click="transfer" depressed small>Transfer</v-btn>
                    </div>
                </div>
            </div>
            <div v-else>
                <component  :is="pageNow" class="comp"></component>
            </div>
        </transition>
    </div>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";

import AddValidator from "@/components/wallet/earn/AddValidator.vue";
import AddDelegator from "@/components/wallet/earn/AddDelegator.vue";
import ChainTransfer from "@/components/wallet/earn/ChainTransfer.vue";

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
        this.subtitle = "Add Validator"
    }
    addDelegator(){
        this.pageNow = AddDelegator;
        this.subtitle = "Add Delegator"
    }
    transfer(){
        this.pageNow = ChainTransfer;
        this.subtitle = "Chain Transfer"
    }
    cancel(){
        this.pageNow = null;
        this.subtitle = '';
    }
}
</script>
<style scoped lang="scss">
@use '../../main';
.header{
    display: flex;
    justify-content: space-between;
    align-items: center;

    .subtitle{
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
        grid-template-columns: 1fr 1fr ;
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


    .title{
        font-weight: bold;
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
            grid-row: 15px;
        }
    }
</style>
