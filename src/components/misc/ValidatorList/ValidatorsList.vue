<template>
    <div class="validator_list">
        <table>
            <thead>
            <tr class="header_tr">
                <th>Node ID</th>
                <th style="text-align: right;">Stake Amount (AVAX)</th>
                <th>End Time</th>
                <th>Uptime</th>
                <th>Fee</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
                <ValidatorRow v-for="v in validators" :key="v.nodeID+v.endTime" :validator="v" @select="onselect"></ValidatorRow>
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




@Component({
    components: {ValidatorRow},
})
export default class ValidatorsList extends Vue{
    intervalID: any = null;
    @Prop() search!: string;

    updateValidators(){
        this.$store.dispatch('Platform/update')
    }

    get validators(){
        let res: ValidatorRaw[] = this.$store.getters['Platform/validatorsCleanArray'];


        // If End time is less than a day, remove from list they are no use
        // If less than 25 hours (+1 to avoid time passing)
        let now = Date.now();
        res = res.filter(v => {
           let endTime = parseInt(v.endTime) * 1000;
           let dif = endTime - now;

           let threshold = (60000*60*25);
           if(dif <= threshold){
               return false;
           }
           return true;
        });

        if(this.search){
            res = res.filter(v => {
                return v.nodeID.includes(this.search)
            });
        }


        // Sort by stake duration
        // res = res.sort((a,b) => {
        //     let endA = parseInt(a.endTime);
        //     let endB = parseInt(b.endTime);
        //     return endB - endA;
        // })


        // order by stake amount
        res = res.sort((a,b) => {
            let amtA = new BN(a.stakeAmount);
            let amtB = new BN(b.stakeAmount);

            if(amtA.gt(amtB)){
                return -1;
            }else if(amtA.lt(amtB)){
                return 1;
            }else{
                return 0;
            }
        })


        return res;
    }

    created(){
        this.updateValidators();
        this.intervalID = setInterval(()=>{
            this.updateValidators();
        },15000);
    }

    destroyed(){
        clearInterval(this.intervalID);
    }

    onselect(val: ValidatorRaw){
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
        background-color: var(--bg-wallet-light);
    }

    .empty_list{
        padding: 30px;
        text-align: center;
    }
</style>
