<template>
    <div>
        <h2>Chain Import</h2>
        <p>If you have have funds stuck in a failed chain transfer, you can try importing them here.</p>
        <p class="err" v-if="err">{{err}}</p>
        <v-btn block class="button_secondary" depressed @click="atomicImportX" small>Import X</v-btn>
        <v-btn block class="button_secondary" depressed @click="atomicImportP" small>Import P</v-btn>
    </div>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";

import AvaHdWallet from "@/js/wallets/AvaHdWallet";
import {LedgerWallet} from "@/js/wallets/LedgerWallet";


@Component
export default class ChainImport extends Vue{
    err = "";

    get wallet(): null|AvaHdWallet|LedgerWallet{
        let wallet: null|AvaHdWallet|LedgerWallet = this.$store.state.activeWallet;
        return wallet;
    }
    async atomicImportX(){
        this.err = "";
        if(!this.wallet) return;
        try{
            let txId = await this.wallet.importToXChain();
            this.onSuccess(txId)
        }catch(e){
            this.onError(e);
        }
    }

    async atomicImportP(){
        this.err = "";
        if(!this.wallet) return;
        try{
            let txId = await this.wallet.importToPlatformChain();
            this.onSuccess(txId)
        }catch(e){
            this.onError(e);
        }
    }

    onSuccess(txId: string){
        console.log("Success", txId);
    }

    onError(err: Error){
        let msg = "";
        if(err.message.includes("No atomic")){
            msg = "Nothing found to import.";
            return;
        }
        this.err = err.message;
    }
}

</script>
<style>
.v-btn{
    margin: 4px 0;
}
</style>
