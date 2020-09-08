<template>
    <div>
        <div class="cols">
            <form @submit.prevent="">
                <div>
                    <div style="margin: 30px 0;">
                        <h4>Node ID</h4>
                        <v-text-field label="Node ID" hide-details filled flat></v-text-field>
                    </div>
                    <div style="margin: 30px 0;">
                        <h4>Staking Period</h4>
                        <p class="desc">The duration in which your tokens will be locked for staking.</p>
                        <div class="dates">
                            <div>
                                <label>Start Date & Time</label>
                                <datetime v-model="startDate" type="datetime" :min-datetime="startDateMin" :max-datetime="startDateMax"></datetime>
                            </div>
                            <div>
                                <label>End Date & Time</label>
                                <datetime v-model="endDate" type="datetime" :min-datetime="endDateMin" :max-datetime="endDateMax"></datetime>
                            </div>
                        </div>
                    </div>
                    <div style="margin: 30px 0;">
                        <h4>Stake Amount</h4>
                        <p class="desc">The amount of AVAX to lock for staking.</p>
                        <AvaxInput v-model="stakeAmt" :max="maxAmt"></AvaxInput>
                    </div>
                </div>
                <div>
                    <div style="margin: 30px 0;">
                        <h4>Delegation Fee</h4>
                        <p class="desc">You will claim this % of the delegation rewards from other users on your node.</p>
                        <input type="number" min="0" max="100" step="0.1" v-model="delegationFee">
                    </div>
                    <div style="margin: 30px 0;">
                        <h4>Reward Address</h4>
                        <p class="desc">Where to send the staking rewards.</p>
                        <v-chip-group mandatory @change="rewardSelect">
                            <v-chip small value="local">Use this wallet</v-chip>
                            <v-chip small value="custom">Custom Address</v-chip>
                        </v-chip-group>
                        <QrInput style="height: 40px; border-radius: 2px;" v-model="rewardIn" v-if="rewardDestination==='custom'" placeholder="Reward Address"></QrInput>
                    </div>
                    <div style="margin: 30px 0;">
                        <p class="err">{{err}}</p>
                        <v-btn @click="submit" class="button_secondary" depressed :loading="isLoading">Submit</v-btn>
                    </div>
                </div>
            </form>
        </div>

    </div>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";
//@ts-ignore
import AvaxInput from "@/components/misc/AvaxInput.vue";
import {BN} from "avalanche";
//@ts-ignore
import { QrInput } from "@avalabs/vue_components";


let dayMs = 1000 * 60 * 60 * 24;
@Component({
    name: "add_validator",
    components: {
        AvaxInput,
        QrInput
    }
})
export default class AddValidator extends Vue{
    startDate: string = "";
    endDate: string = "";
    delegationFee: number = 3.0;
    rewardIn: string = "";
    rewardDestination = 'local'; // local || custom

    created(){
        this.startDate = this.startDateMin;
        this.endDate = this.endDateMin;
    }


    amount_in(val: BN){
        console.log("Stake val: ",val);
    }

    rewardSelect(val: 'local'|'custom'){
        this.rewardDestination = val;
    }

    // 5 minutes from now
    get startDateMin(){
        let now = Date.now();
        let res = now + (60000 * 5);

        return (new Date(res)).toISOString();
    }

    // 1 year
    get startDateMax(){
        let startDate = new Date();
        // add a year
        let endTime = startDate.getTime() + (60000*60*24*365);
        let endDate = new Date(endTime);
        return endDate.toISOString();
    }

    // Start date + 24 hours
    get endDateMin(){
        let start = this.startDate;
        let startDate = new Date(start);

        let end = startDate.getTime() + (60000*60*24);
        let endDate = new Date(end);
        return endDate.toISOString();
    }

    // Start date + 1 year
    get endDateMax(){
        let start = this.startDate;
        let startDate = new Date(start);

        let end = startDate.getTime() + (60000*60*24*365);
        let endDate = new Date(end);
        return endDate.toISOString();
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

    submit(){
        console.log("ADD VALIDATOR");
    }

}
</script>
<style scoped lang="scss">
.cols{
    display: grid;
    grid-template-columns: 1fr 1fr;
}


form{
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 90px;
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

input{
    color: var(--primary-color);
    background-color: var(--bg-light);
    padding: 6px 14px;
}

.desc{
    font-size: 13px;
    margin-bottom: 8px !important;
    color: var(--primary-color-light);
}

h4{
    margin: 14px 0px 4px;
    font-weight: bold;
}

label{
    margin-top: 6px;
    color: var(--primary-color-light);
    font-size: 14px;
    margin-bottom: 3px;
}

    .dates{
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 15px;
    }
</style>
