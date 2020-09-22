<template>
    <tr class="validator_row">
        <td class="id">{{validator.nodeID}}</td>
        <td class="amount">{{amtText}}</td>
        <td>{{remainingText}}</td>
        <td>{{uptimeText}}</td>
        <td>{{feeText}}%</td>
        <td>
            <button class="button_secondary" @click="select">Select</button>
        </td>
    </tr>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";
import {ava, pChain} from "@/AVA";
import {ValidatorRaw} from "@/components/misc/ValidatorList/types";
import moment from "moment";
import Big from "big.js";

@Component({
})
export default class ValidatorsList extends Vue{
    @Prop() validator!: ValidatorRaw;

    get remainingMs():number{
        let end = parseInt(this.validator.endTime);
        let remain =  end*1000 - Date.now();
        return remain;
    }

    get remainingText(){
        let ms = this.remainingMs;
        let sec = ms/1000;

        let duration = moment.duration(ms, 'milliseconds');
        return duration.humanize(true)
    }

    get amtText(){
        let amt = this.validator.stakeAmount;
        let big = Big(amt);
            big = big.div(Math.pow(10,9));

        return big.toLocaleString(2);
    }

    get uptimeText(): string{
        let uptime = parseFloat(this.validator.uptime) * 100;

        // if(!uptime) return '?';

        return uptime.toFixed(2) + ' %';
    }

    get feeText(){
        return parseFloat(this.validator.delegationFee);
    }

    select(){
        this.$emit('select', this.validator);
    }
}
</script>
<style scoped lang="scss">
//.validator_row{
//    padding: 4px 0;
//    display: grid;
//    grid-gap: 14px;
//    grid-template-columns: 1fr max-content max-content max-content max-content;
//}


.amount{
    text-align: right;
    font-family: monospace;
}

button{
    padding: 3px 12px;
    font-size: 13px;
    border-radius: 3px;
}

.id{
    word-break: break-all;
}
td{
    padding: 6px 14px;
    background-color: var(--bg-light);
    border: 1px solid var(--bg);
}
</style>
