<template>
    <div>
        <div v-if="!selected">
            <div style="display: flex; align-items: center">
                <p>Select a node to delegate:</p>
                <input class="search" type="text" placeholder="Search Node ID" v-model="search">
            </div>
            <ValidatorsList class="val_list" :search="search" @select="onselect"></ValidatorsList>
        </div>
        <div v-else class="form">
            <form  @submit.prevent="submit">
                <div class="selected">
                    <button @click="selected = null">
                        <fa icon="times"></fa>
                    </button>
                    <div>
                        <p style="font-size: 13px; color: var(--primary-color-light)">Selected Node</p>
                        <p class="node_id">{{selected.nodeID}}</p>
                    </div>
                </div>
                <div style="margin: 30px 0;">
                    <label>Staking Period</label>
                    <p class="desc">The duration in which your tokens will be locked for staking.</p>
                    <div class="dates">
                        <VuetifyDateInput label="Start Date" v-model="startDate"></VuetifyDateInput>
                        <VuetifyDateInput label="End Date" v-model="endDate"></VuetifyDateInput>
                    </div>
                </div>
                <div style="margin: 30px 0;">
                    <label>Stake Amount</label>
                    <p class="desc">The amount of AVAX to lock for staking.</p>
                    <AvaxInput v-model="stakeAmt"></AvaxInput>
                </div>
                <div style="margin: 30px 0;">
                    <label>Reward Address</label>
                    <p class="desc">Staking rewards will be sent to this address.</p>
                    <QrInput style="height: 40px; border-radius: 2px;" v-model="rewardAddr"></QrInput>
                </div>
            </form>
            <div class="calculator">
                <div>
                    <label>Balance</label>
                    <p>{{platformUnlocked.toString()}}</p>
                </div>
                <div>
                    <label>Fee</label>
                    <p>{{fee.toString()}}</p>
                </div>
                <v-btn @click="submit">Submit</v-btn>
            </div>


<!--            <v-text-field label="Selected Node" :value="selected.nodeID" disabled></v-text-field>-->
        </div>
    </div>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";

import AvaxInput from '@/components/misc/AvaxInput.vue';
//@ts-ignore
import { QrInput } from "@avalabs/vue_components";
import ValidatorsList from "@/components/misc/ValidatorList/ValidatorsList.vue";
import {ValidatorRaw} from "@/components/misc/ValidatorList/types";
import VuetifyDateInput from "@/components/misc/VuetifyDateInput.vue";
import StakingCalculator from "@/components/wallet/earn/StakingCalculator.vue";

import {BN} from 'avalanche';
import {PlatformVMConstants} from "avalanche/dist/apis/platformvm";
import {pChain} from "@/AVA";
@Component({
    components: {
        AvaxInput,
        VuetifyDateInput,
        ValidatorsList,
        StakingCalculator,
        QrInput,
    }
})
export default class AddDelegator extends Vue{
    search: string = "";
    selected: ValidatorRaw|null = null;
    stakeAmt: BN = new BN(0);
    startDate = null;
    endDate = null;
    rewardAddr: string = "";

    onselect(val: ValidatorRaw){
        this.search = "";
        this.selected = val;
    }

    submit(){
        console.log(this.selected);
        console.log(this.startDate)
        console.log(this.endDate);
        console.log(this.stakeAmt.toString());
    }


    get minStake(): BN{
        return  PlatformVMConstants.MINSTAKE;
    }

    get fee(): BN{
        return  pChain.getFee();
    }

    get minAmt(): BN{
        return this.minStake.add(this.fee)
    }

    get maxAmt(): BN{
        let zero = new BN(0);

        let max = this.platformUnlocked.sub
        return zero;
    }

    get platformUnlocked(): BN{
        return this.$store.getters.walletPlatformBalance;
    }
    // get maxEndDate(){
    //
    // }
    //
    // get minStartDate(){
    //
    // }
}
</script>
<style scoped lang="scss">
.val_list{
    overflow: scroll;
    max-height: 450px;
    margin-top: 14px;
}

.form{
    display: grid;
    grid-template-columns: 1fr 1fr;
}

.search{
    padding: 3px 12px;
    border-radius: 12px;
    background-color: var(--bg-light);
    margin-left: 30px;
    color: var(--primary-color);
}
label{
    margin: 14px 0px 4px;
    font-weight: bold;
}
.selected{
    display: grid;
    width: max-content;
    grid-template-columns: 40px 1fr;
    background-color: var(--bg-light);
    border-radius: 6px;
    padding: 4px 0;
    padding-right: 14px;

    button{
        opacity: 0.4;
        &:hover{
            opacity: 1;
        }
    }
}

.dates{
    display: grid;
    grid-template-columns: max-content max-content;
    grid-gap: 30px;
    margin-top: 0px;
}

form{
    width: max-content;
}

.amt_in{
    background-color: var(--bg-light);
    color: var(--primary-color);
    padding: 8px 14px;
    width: 100%;
}

.desc{
    font-size: 13px;
    margin-bottom: 8px !important;
    color: var(--primary-color-light);
}

.calculator{
    label{
        color: var(--primary-color-light);
        font-weight: lighter;
    }

    p{
        font-size: 24px;
    }
}


</style>
