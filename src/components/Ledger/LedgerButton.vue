<template>
    <button class="ava_button" @click="submit">Ledger</button>
</template>
<script>
    // import TransportWebHID from "@ledgerhq/hw-transport-webhid";
    import TransportU2F from "@ledgerhq/hw-transport-u2f";

    // import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
    // import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
    import {LedgerWallet} from "@/js/LedgerWallet";

    export default {
        methods:{
            async submit(){
                // let transport = await TransportNodeHid.create();
                // let wallet = new LedgerWallet(transport)
                TransportU2F.create().then(transport => {
                    // console.log(transport)
                    let wallet = new LedgerWallet(transport)
                })
            }
        }
    }
</script>
