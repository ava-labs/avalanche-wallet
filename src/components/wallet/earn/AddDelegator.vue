<template>
    <div>
        <div v-if="!selected">
            <div style="display: flex; align-items: center">
                <p>Select a node to delegate:</p>
                <input class="search" type="text" placeholder="Search Node ID" v-model="search">
            </div>
            <ValidatorsList class="val_list" :search="search" @select="onselect"></ValidatorsList>
        </div>
        <div v-else>
            <form>
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
                        <VuetifyDateInput label="Start Date"></VuetifyDateInput>
                        <VuetifyDateInput label="End Date"></VuetifyDateInput>
                    </div>
                </div>
                <div style="margin: 30px 0;">
                    <label>Stake Amount</label>
                    <p class="desc">The amount of AVAX to lock for staking.</p>
                    <AvaxInput></AvaxInput>
                </div>
                <div style="margin: 30px 0;">
                    <label>Reward Address</label>
                    <p class="desc">Staking rewards will be sent to this address.</p>
                    <QrInput style="height: 40px; border-radius: 2px;"></QrInput>
                </div>
            </form>
            <div class="calculator">

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
@Component({
    name: "add_validator",
    components: {
        AvaxInput,
        VuetifyDateInput,
        ValidatorsList,
        QrInput,
    }
})
export default class AddValidator extends Vue{
    search: string = ""
    selected: ValidatorRaw|null = null;

    onselect(val: ValidatorRaw){
        this.search = "";
        this.selected = val;
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
</style>
