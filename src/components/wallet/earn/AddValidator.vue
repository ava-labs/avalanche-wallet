<template>
    <div>
        VALIDATOR
        <div class="cols">
            <form>
                <v-text-field label="Node ID"></v-text-field>
                <VuetifyDateInput :max-date="dateMax" :min-date="dateMin" label="Start Date"></VuetifyDateInput>
                <VuetifyDateInput :max-date="dateMax" :min-date="dateMin" label="End Date"></VuetifyDateInput>
                <AvaxInput></AvaxInput>
<!--                <v-text-field label="Start Date" @focus="isPicker=true"></v-text-field>-->
<!--                <v-text-field label="End Date"></v-text-field>-->
            </form>
            <div>
                <v-date-picker :min="dateMin" :max="dateMax" v-if="isPicker"></v-date-picker>
            </div>
        </div>

    </div>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";
//@ts-ignore
import AvaxInput from "@/components/misc/AvaxInput.vue";
import VuetifyDateInput from '@/components/misc/VuetifyDateInput.vue';
import {BN} from "avalanche";

let dayMs = 1000 * 60 * 60 * 24;
@Component({
    name: "add_validator",
    components: {
        VuetifyDateInput,
        AvaxInput
    }
})
export default class AddValidator extends Vue{
    startDate: Date = new Date();
    endDate: Date = new Date( Date.now()+(364 * dayMs))
    isPicker: boolean = false;


    amount_in(val: BN){
        console.log("Stake val: ",val);
    }
    get dateMax(){
        let dateMs = Date.now() + dayMs*364;
        let date = new Date(dateMs);
        console.log(date);
        return date.toISOString();
    }

    get dateMin(){
        let dateMs = Date.now();
        let date = new Date(dateMs);

        return date.toISOString();
    }

    get denomination(){
        return 9;
    }

    get maxAmount(){
        return new BN('200000')
    }


}
</script>
<style scoped lang="scss">
.cols{
    display: grid;
    grid-template-columns: 1fr 1fr;
}
    form{
        max-width: 320px;
    }

    .amt{
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        border: 1px solid #999;
        padding: 4px 14px;
    }
    .bigIn{
        flex-grow: 1;

    }
</style>
