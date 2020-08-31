<template>
    <button class="ava_button" @click="submit">Ledger</button>
</template>
<script>
    import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
    import {LedgerWallet} from "@/js/LedgerWallet";

    export default {
        methods:{
            submit(){
                console.log("LEDGER")
                TransportWebUSB.create().then(transport => {
                    let wallet = new LedgerWallet(transport)
                    console.log(wallet);
                })
            }
        }
    }
</script>