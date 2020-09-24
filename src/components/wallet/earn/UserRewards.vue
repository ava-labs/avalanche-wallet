<template>
    <div v-if="totLength>0">
        <div>
            <label>Total Rewards</label>
            <p class="amt">{{totalRewardBig.toLocaleString(9)}} AVAX</p>
        </div>
        <div v-if="validators.length > 0">
            <h4>Validation Rewards</h4>
            <UserRewardRow v-for="(v, i) in validators" :key="i" :staker="v" class="reward_row"></UserRewardRow>
        </div>
        <div v-if="delegators.length > 0">
            <h4>Delegation Rewards</h4>
            <UserRewardRow v-for="(d, i) in delegators" :key="i" :staker="d" class="reward_row"></UserRewardRow>
        </div>
    </div>
    <div v-else class="empty">
        <p>You do not have any pending rewards.</p>
    </div>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";
import {AvaWalletCore} from "../../../js/wallets/IAvaHdWallet";
import {DelegatorRaw, ValidatorRaw} from "@/components/misc/ValidatorList/types";
import UserRewardRow from "@/components/wallet/earn/UserRewardRow.vue";
import {bnToBig} from "@/helpers/helper";
import Big from "big.js";
import {BN} from 'avalanche';

@Component({
    components:{
        UserRewardRow
    }
})
export default class UserRewards extends Vue{
    get userAddresses(){
        let wallet: AvaWalletCore = this.$store.state.activeWallet;
        if(!wallet) return [];

        return wallet.getExtendedPlatformAddresses();
    }

    get validators(): ValidatorRaw[]{
        let validators: ValidatorRaw[] = this.$store.state.Platform.validators;

        return this.cleanList(validators) as ValidatorRaw[];
    }

    get delegators(): DelegatorRaw[]{
        let delegators: DelegatorRaw[] = this.$store.state.Platform.delegators;
        return this.cleanList(delegators) as DelegatorRaw[];
    }

    get totLength(){
        return this.validators.length + this.delegators.length;
    }

    get totalReward(){
        let vals = this.validators.reduce((acc, val: ValidatorRaw) => {
            return acc.add(new BN(val.potentialReward));
        }, new BN(0));

        let dels = this.validators.reduce((acc, val: DelegatorRaw) => {
            return acc.add(new BN(val.potentialReward));
        }, new BN(0));

        return vals.add(dels);
    }

    get totalRewardBig(): Big{
        return bnToBig(this.totalReward, 9);
    }

    cleanList(list: ValidatorRaw[]|DelegatorRaw[]){
        let res = list.filter(val => {
            let rewardAddrs = val.rewardOwner.addresses;
            let filtered = rewardAddrs.filter(addr => {
                return this.userAddresses.includes(addr);
            })
            return filtered.length > 0;
        })
        return res;
    }


    // get allRewards(){
    //
    // }
}
</script>
<style scoped lang="scss">



.reward_row{
    margin-bottom: 12px;
}

h4{
    margin: 12px 0;
    margin-top: 32px;
    font-weight: lighter;
}

label{
    margin-top: 6px;
    color: var(--primary-color-light);
    font-size: 14px;
    margin-bottom: 3px;
}

.amt{
    font-size: 2em;
}


</style>
