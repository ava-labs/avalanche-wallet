<template>
    <div>

        <div class="cols">
            <div class="form">
                <div class="chains">
                    <div class="chain_cont">
                        <label>Source Chain</label>
                        <p class="chain">{{sourceChain}}</p>
                        <div class="chain_info">
                            <label>Balance</label>
                            <p>{{balance.toLocaleString()}} AVAX</p>
                        </div>
                    </div>
                    <v-btn icon style="align-self: center;" class="switch_but button_primary" @click="switchChain" v-if="!isConfirm">
                        <fa icon="sync"></fa>
                    </v-btn>
                    <div class="chain_cont">
                        <label>Destination Chain</label>
                        <p class="chain">{{targetChain}}</p>
                        <div class="chain_info">
                            <label>Balance</label>
                            <p>{{destinationBalance.toLocaleString()}} AVAX</p>
                        </div>
                    </div>
                </div>
                <div v-show="!isConfirm">
                    <label>Transfer Amount</label>
                    <AvaxInput :max="maxAmt" v-model="amt"></AvaxInput>
                </div>
                <div class="confirmation_val" v-if="isConfirm">
                    <label>Transfer Amount</label>
                    <p>{{formAmtText}} AVAX</p>
                </div>
            </div>
            <div class="right_col">
                <div v-if="!isSuccess && !isImportErr">
                    <div>
                        <label>Fee</label>
                        <p style="font-size: 22px;">{{fee.toString()}} AVAX</p>
                    </div>
                    <div>
                        <p class="err">{{err}}</p>
                        <!--                    <p v-if="maxAmt.isZero() && !isLoading" class="err">Insufficient funds to create the transactions.</p>-->
                        <v-btn v-if="!isConfirm" data-cy="confirm" class="button_secondary" @click="confirm" :disabled="!canSubmit" :loading="isLoading" block>Confirm</v-btn>
                        <template v-else>
                            <v-btn  data-cy="submit" class="button_secondary" @click="submit" :loading="isLoading" block depressed>Transfer</v-btn>
                            <v-btn  v-if="!isLoading" data-cy="cancel" style="color: var(--primary-color); margin: 12px 0 !important;" @click="cancelConfirm" block depressed text>Cancel</v-btn>
                        </template>
                    </div>
                </div>
                <div v-else-if="isImportErr" class="import_err">
                    <h2>Import Failed</h2>
                    <p>There was a problem importing you tokens into the destination chain. Please try importing again. </p>
                    <v-btn @click="triggerImport" block class="button_secondary" small>Trigger Import</v-btn>
<!--                    <v-btn depressed style="color: var(&#45;&#45;primary-color)" small @click="$emit('cancel')" block text>Back to Earn</v-btn>-->
                </div>
                <div v-else-if="isSuccess" class="complete">
                    <h2>Transfer Completed</h2>
                    <div>
                        <label>Export Transaction ID:</label>
                        <p>{{exportId}}</p>
                    </div>
                    <div>
                        <label>Import Transaction ID:</label>
                        <p>{{importId}}</p>
                    </div>
                    <p style="color: var(--success); margin: 12px 0 !important;"> <fa icon="check-circle"></fa> You have successfully transferred between chains. </p>
                    <v-btn depressed class="button_primary" small @click="$emit('cancel')" block>Back to Earn</v-btn>
                </div>
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
import AvaHdWallet from "@/js/wallets/AvaHdWallet";
import {bnToBig} from "@/helpers/helper";


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

    isImportErr = false;
    isConfirm = false;
    isSuccess = false;

    formAmt = new BN(0);

    // Transaction ids
    exportId: string = '';
    importId: string = '';

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

    get avmUnlocked(): BN{
        if(!this.ava_asset) return new BN(0);
        return this.ava_asset.amount;
    }

    get balance(): Big{
        let bal: BN;
        if(this.sourceChain === 'P'){
            bal = this.platformUnlocked;
        }else{
            bal = this.avmUnlocked;
        }

        // let bigBal = Big(bal.toString())
        //     bigBal = bigBal.div(Math.pow(10,9))
        let bigBal = bnToBig(bal,9)

        return bigBal;
    }

    get destinationBalance(): Big{
        let bal: BN;
        if(this.sourceChain === 'P'){
            bal = this.avmUnlocked;
        }else{
            bal = this.platformUnlocked;
        }

        let bigBal = bnToBig(bal,9)
        // let bigBal = Big(bal.toString())
        // bigBal = bigBal.div(Math.pow(10,9))
        return bigBal;
    }

    get formAmtText(){
        return bnToBig(this.formAmt,9).toLocaleString();
    }
    // Fee is 2 times the tx transfer fee
    get fee(): Big{
        let feeP = pChain.getTxFee();
        let feeX = avm.getTxFee();

        // let totFee = feeP.add(feeX);
        let totFee = feeX.mul(new BN(2));
        // let feePBig = Big(feeP.toString()).div(Math.pow(10,9));
        // let feeXBig = Big(feeX.toString()).div(Math.pow(10,9));
        // let feeXBig = Big(totFee.toString()).div(Math.pow(10,9));
        let feeXBig = bnToBig(totFee,9);

        return feeXBig;
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
        // let big = Big(bn.toString()).div(Math.pow(10,9));
        let big = bnToBig(bn,9);
        return big;
    }

    confirm(){
        this.formAmt = this.amt.clone();
        this.isConfirm = true;
    }

    cancelConfirm(){
        this.isConfirm = false;
        this.formAmt = new BN(0);
    }

    get wallet(){
        let wallet: AvaHdWallet = this.$store.state.activeWallet;
        return wallet;
    }

    // triggers an import on the destination chain
    async triggerImport(){
        try{
            this.isImportErr = false;
            let txId;
            if(this.sourceChain==='X'){
                txId = await this.wallet.importToPlatformChain()
            }else{
                txId = await this.wallet.importToXChain()
            }
            this.$store.dispatch('Notifications/add', {
                type: 'success',
                title: 'Import Success',
                message: `Tokens imported to the ${this.targetChain} chain.`
            });
            this.onsuccess(this.exportId, txId);
        }catch(e){
            this.isImportErr = true;
            this.onerror(e);
        }

    }

    async submit(){
        this.err = "";
        this.isLoading = true;
        this.isImportErr = false;

        try{
            let wallet: AvaHdWallet = this.$store.state.activeWallet;

            let exportTxId = await wallet.chainTransfer(this.formAmt,this.sourceChain)
            await wallet.getUTXOs();
            this.$store.dispatch('Notifications/add', {
                type: 'success',
                title: 'Export Success',
                message: `Tokens exported from the ${this.sourceChain} chain.`
            });
            this.exportId = exportTxId;

            setTimeout(async () => {
                let importTxId;
                try{
                    if(this.sourceChain === 'X'){
                        importTxId = await wallet.importToPlatformChain();
                    }else{
                        importTxId = await wallet.importToXChain();
                    }
                    this.isLoading = false;
                    this.$store.dispatch('Notifications/add', {
                        type: 'success',
                        title: 'Import Success',
                        message: `Tokens imported to the ${this.targetChain} chain.`
                    });
                    this.onsuccess(exportTxId,importTxId);
                }catch (e){
                    this.isImportErr = true;
                    this.onerror(e);
                }

            }, 5000);


        }catch(err){
            this.onerror(err);
        }
    }

    onerror(err: any){
        console.error(err);
        this.isLoading = false;
        this.err = err;
        this.$store.dispatch('Notifications/add', {
            type: 'error',
            title: 'Transfer Failed',
            message: err
        });
    }

    onsuccess(exportId: string, importId: string){
        // Clear Form
        this.isSuccess = true;
        this.exportId = exportId;
        this.importId = importId;
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

.cols{
    display: grid;
    grid-template-columns: 1fr 340px;
    column-gap: 2vw;
}

.right_col{

}

.confirmation_val{
    background-color: var(--bg-light);
    padding: 6px 14px;
}

.form{
    justify-self: center;
    //margin: 30px auto;
    width: 100%;
    //max-width: 540px;
    > div{
        margin: 14px 0;
    }
}
.dropdown{
    background-color: var(--bg-light);
}

.chain{
    font-size: 32px;
    text-align: center;
    justify-content: center;
}
.chains{
    position: relative;
    text-align: center;
    display: grid;
    margin: 0 !important;
    column-gap: 4px;
    grid-template-columns: 1fr 1fr;

}

.chain_cont{
    background-color: var(--bg-light);
    padding: 14px;
}

.switch_but{
    position: absolute;
    left: 50%;
    border: 3px solid var(--bg-wallet-light);
    transform: translateX(-50%);
}



label{
    color: var(--primary-color-light);
}

.meta{
    display: grid;
    grid-template-columns: max-content max-content;
    column-gap: 2em;
}


h2{
    font-weight: lighter;
    font-size: 2em;
}
.import_err{
    max-width: 320px;
    //margin: 10vh auto;
    color: var(--primary-color);

    p{
        margin: 6px 0 !important;
        margin-bottom: 14px !important;
        color: var(--primary-color-light);
    }
}

.complete{
    max-width: 320px;
    //margin: 10vh auto;

    > div{
        background-color: var(--bg-light);
        padding: 14px;
        margin: 4px 0;
        word-break: break-all;
    }

    .desc{
        margin: 6px 0 !important;
        color: var(--primary-color-light);
    }
}
</style>
