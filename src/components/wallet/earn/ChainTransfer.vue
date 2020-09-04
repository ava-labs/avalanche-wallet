<template>
    <div>
        <div class="form">
            <div class="chains">
                <div>
                    <label>Source Chain</label>
                    <p class="chain">{{sourceChain}}</p>
                </div>
                <v-btn icon style="align-self: center;" class="button_primary" @click="switchChain">
                    <fa icon="exchange-alt"></fa>
                </v-btn>
                <div>
                    <label>Destination Chain</label>
                    <p class="chain">{{targetChain}}</p>
                </div>
            </div>
            <div class="meta">
                <div>
                    <label>Your Balance</label>
                    <p style="font-size: 22px;">{{balance.toString()}} AVAX</p>
                </div>
                <div>
                    <label>Fee</label>
                    <p style="font-size: 22px;">{{fee.toString()}} AVAX</p>
                </div>

            </div>
            <div>
<!--                <label>Total Size</label>-->
<!--                <p style="font-size: 22px;">{{fee.toString()}} AVAX</p>-->

                <label>Transfer Amount</label>
                <AvaxInput :max="maxAmt" v-model="amt"></AvaxInput>
            </div>
<!--            <div class="meta">-->
<!--                <div>-->
<!--                    <label>Fee</label>-->
<!--                    <p style="font-size: 22px;">{{fee.toString()}} AVAX</p>-->
<!--                </div>-->
<!--                <div>-->
<!--                    <label>Total Cost</label>-->
<!--                    <p style="font-size: 22px;">{{amtTotalCost.toString()}} AVAX</p>-->
<!--                </div>-->
<!--            </div>-->
            <div>
                <p class="err">{{err}}</p>
                <v-btn class="button_secondary" @click="submit" :disabled="!canSubmit" :loading="isLoading">Transfer</v-btn>
            </div>
        </div>

    </div>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";
import Dropdown from "@/components/misc/Dropdown.vue";
import AvaxInput from "@/components/misc/AvaxInput.vue";
import Big from "big.js";
import AvaAsset from "@/js/AvaAsset";
import {BN} from "avalanche";
import {pChain, avm} from "@/AVA";
import AvaHdWallet from "@/js/AvaHdWallet";


@Component({
    name: "chain_transfer",
    components: {
        Dropdown,
        AvaxInput
    }
})
export default class ChainTransfer extends Vue{
    sourceChain = 'X';
    targetChain = 'P';
    isLoading = false;
    amt: BN = new BN(0);
    err: string = "";

    switchChain(){
        let temp = this.sourceChain;
        this.sourceChain = this.targetChain;
        this.targetChain = temp;
    }

    get ava_asset():AvaAsset|null{
        let ava = this.$store.getters['Assets/AssetAVA'];
        return ava;
    }

    get platformUnlocked(): BN{
        return this.$store.getters.walletPlatformBalance;
    }

    get platformLocked(): BN{
        return this.$store.getters.walletPlatformBalanceLocked;
    }

    get balance(): Big{
        if(this.sourceChain === 'P'){
            let bal = this.platformUnlocked;
            let bigBal = Big(bal.toString())
                bigBal = bigBal.div(Math.pow(10,9))
            return bigBal;
        }else{
            if(!this.ava_asset) return Big(0);
            return this.ava_asset.getAmount();
        }
    }

    get fee(): Big{
        let feeP = pChain.getFee();
        let feeX = avm.getFee();

        let feePBig = Big(feeP.toString()).div(Math.pow(10,9));
        let feeXBig = Big(feeX.toString()).div(Math.pow(10,9));

        return feePBig.add(feeXBig)
    }

    get maxAmt(): BN{
        let max = this.balance.sub(this.fee);
        let zero = Big(0);
        if(zero.gt(max)){
            return new BN(0)
        }else{
            let bnStr = max.times(Big(Math.pow(10,9))).toString();
            return new BN(bnStr);
        }
    }

    get amtTotalCost(): Big{
        let amt = this.amtBig;
        let fee = this.fee;
        return amt.add(fee);
    }

    get amtBig(): Big{
        let bn = this.amt;
        let big = Big(bn.toString()).div(Math.pow(10,9));
        return big;
    }

    async submit(){
        this.err = "";
        this.isLoading = true;

        try{
            let wallet: AvaHdWallet = this.$store.state.activeWallet;

            if(this.sourceChain==='X'){
                // First do the export
                let txId = await wallet.chainTransfer(this.amt,'X')
                await wallet.getUTXOs();
                this.$store.dispatch('Notifications/add', {
                    type: 'success',
                    title: 'Export Success',
                    message: 'Transaction id '+txId
                });

                setTimeout(async () => {
                    let importTxId = await wallet.importToPlatformChain();
                    this.isLoading = false;
                    this.$store.dispatch('Notifications/add', {
                        type: 'success',
                        title: 'Import Success',
                        message: 'Transaction id '+importTxId
                    });
                    this.onsuccess();
                }, 3000);

            }else{
                // First do the export
                let txId = await wallet.chainTransfer(this.amt,'P')
                await wallet.getUTXOs();
                this.$store.dispatch('Notifications/add', {
                    type: 'success',
                    title: 'Export Success',
                    message: 'Transaction id '+txId
                });

                setTimeout(async () => {
                    let importTxId = await wallet.importToXChain();
                    this.isLoading = false;
                    this.$store.dispatch('Notifications/add', {
                        type: 'success',
                        title: 'Import Success',
                        message: 'Transaction id '+importTxId
                    });
                    this.onsuccess();
                }, 3000)
            }


        }catch(err){
            this.isLoading = false;
            this.err = err;
            this.$store.dispatch('Notifications/add', {
                type: 'error',
                title: 'Transfer Failed',
                message: err
            });
        }
    }

    onsuccess(){
        // Clear Form
    }


    get canSubmit(){
        if(this.amt.eq(new BN(0))){
            return false;
        }

        if(this.amt.gt(this.maxAmt)){
            return false;
        }

        return true;
    }
}
</script>
<style scoped lang="scss">
.form{
    justify-self: center;
    margin: 0px auto;
    width: max-content;

    > div{
        margin: 14px 0;
    }
}
.dropdown{
    background-color: var(--bg-light);
}

.chain{
    font-size: 32px;
    text-align: left;
    justify-content: center;
}
.chains{
    padding: 30px 0;
    display: grid;
    column-gap: 30px;
    grid-template-columns: 1fr 1fr 1fr;

    .v-btn{
        justify-self: center;
    }
}

label{
    color: var(--primary-color-light);
}

.meta{
    display: grid;
    grid-template-columns: max-content max-content;
    column-gap: 2em;
}
</style>
