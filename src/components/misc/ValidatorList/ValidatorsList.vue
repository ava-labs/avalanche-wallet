<template>
    <div class="validator_list">
        <table>
            <thead>
            <tr class="header_tr">
                <th>Node ID</th>
                <th style="text-align: right;">Validator Stake</th>
                <th style="text-align: right;">Available <Tooltip style="display: inline-block;" text="How much more can be delegated to this validator."><fa icon="question-circle"></fa></Tooltip></th>
                <th>
                    <Tooltip text="Number of Delegators"><fa icon="users"></fa></Tooltip>
                </th>
                <th>End Time</th>
                <th>Uptime <Tooltip style="display: inline-block;" text="Relative to the node this wallet is connected to."><fa icon="question-circle"></fa></Tooltip> </th>
                <th>Fee</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
                <ValidatorRow v-for="v in validators" :key="v.nodeID" :validator="v" @select="onselect"></ValidatorRow>
            </tbody>
        </table>
        <div v-if="validators.length===0" class="empty_list">
            <h4>No Validators Found</h4>
            <p>Validators need to be actively staking to be found.</p>
        </div>
    </div>

</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";
import {ava, pChain} from "@/AVA";
import {BN} from 'avalanche';

import ValidatorRow from "@/components/misc/ValidatorList/ValidatorRow.vue";
import {ValidatorRaw, ValidatorDict} from "@/components/misc/ValidatorList/types";
import Tooltip from "@/components/misc/Tooltip.vue";
import {ValidatorListItem} from "@/store/modules/platform/types";

const MINUTE_MS = 60000;
const HOUR_MS = MINUTE_MS * 60;
const DAY_MS = HOUR_MS * 24;



@Component({
    components: {Tooltip, ValidatorRow},
})
export default class ValidatorsList extends Vue{
    @Prop() search!: string;

    get validators(): ValidatorListItem[]{
        let list: ValidatorListItem[] = this.$store.getters["Platform/validatorListEarn"];

        if(this.search){
            list = list.filter(v => {
                return v.nodeID.includes(this.search)
            });
        }

        // order by stake amount
        list = list.sort((a,b) => {
            let amtA = a.validatorStake;
            let amtB = b.validatorStake;

            if(amtA.gt(amtB)){
                return -1;
            }else if(amtA.lt(amtB)){
                return 1;
            }else{
                return 0;
            }
        })

        return list;
        // let res: ValidatorRaw[] = this.$store.getters['Platform/validatorsCleanArray'];
        // let res: ValidatorRaw[] = this.$store.state.Platform.validators;
        //
        //
        // if(!res) return [];
        // // If less than 25 hours (+1 to avoid time passing)
        // let now = Date.now();
        // res = res.filter(v => {
        //    let endTime = parseInt(v.endTime) * 1000;
        //    let dif = endTime - now;
        //
        //     // If End time is less than 2 weeks + 1 hour, remove from list they are no use
        //     let threshold = (DAY_MS*14 + (10 * MINUTE_MS));
        //    if(dif <= threshold){
        //        return false;
        //    }
        //    return true;
        // });
        //
        //
        // // Filter search results

        //
        //
        // return res;
    }



    onselect(val: ValidatorListItem){
        this.$emit('select', val);
    }

}
</script>
<style scoped lang="scss">
    .validator_list{
        position: relative;
        width: 100%;
    }

    table{
        width: 100%;
        border-collapse: collapse;
    }
    tr{
    }
    th{
        position: sticky;
        top: 0;
        padding: 2px 14px;
        font-size: 14px;
        background-color: var(--bg-wallet-light);
    }

    .empty_list{
        padding: 30px;
        text-align: center;
    }
</style>
