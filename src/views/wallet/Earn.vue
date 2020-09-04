<template>
    <div>
        <h1>Earn <span></span></h1>
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
                </div>
            </div>
            <div v-else>
                <button @click="pageNow=null" class="cancel">Cancel</button>
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
@Component({
    name: "earn",
    components: {
        AddValidator,
        AddDelegator
    }
})
export default class Earn extends Vue{
    pageNow: any = null;

    addValidator(){
        this.pageNow = AddValidator;
    }
    addDelegator(){
        this.pageNow = AddDelegator;
    }
}
</script>
<style scoped lang="scss">
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


    .title{
        font-weight: bold;
    }

    .cancel{
        font-size: 13px;
        color: var(--secondary-color);
    }

    .comp{
        margin-top: 14px;
    }
</style>
