<template>
    <div class="validator_list">
        <table>
            <thead>
            <tr class="header_tr">
                <th>Node ID</th>
                <th style="text-align: right;">Stake Amount (AVAX)</th>
                <th>End Time</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            <ValidatorRow v-for="v in validators" :key="v.nodeID+v.endTime" :validator="v" @select="onselect"></ValidatorRow>
            </tbody>
        </table>
    </div>

</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";
import {ava, pChain} from "@/AVA";

import ValidatorRow from "@/components/misc/ValidatorList/ValidatorRow.vue";
import {ValidatorRaw} from "@/components/misc/ValidatorList/types";

@Component({
    components: {ValidatorRow},
})
export default class ValidatorsList extends Vue{
    validatorsRaw: ValidatorRaw[] = [];
    @Prop() search!: string;

    async updateValidators(){
        let res = await pChain.getCurrentValidators() as ValidatorRaw[];
        this.validatorsRaw = res;
    }

    get validators(){
        let res = this.validatorsRaw;

        if(this.search){
            res = res.filter(v => {
                return v.nodeID.includes(this.search)
            });
        }

        res = res.sort((a,b) => {
            let endA = parseInt(a.endTime);
            let endB = parseInt(b.endTime);
            return endB - endA;
        })
        return res;
    }
    created(){
        this.updateValidators();
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
</style>
