<template>
    <button class="ava_button" @click="submit">
        <template v-if="!isLoading">
            Ledger
        </template>
        <Spinner v-else class="spinner"></Spinner>
    </button>

</template>
<script>
    // import TransportWebHID from "@ledgerhq/hw-transport-webhid";
    import TransportU2F from "@ledgerhq/hw-transport-u2f";
    import Spinner from "@/components/misc/Spinner.vue";
    import LedgerBlock from "@/components/modals/LedgerBlock";
    // import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
    // import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
    import {LedgerWallet} from "@/js/wallets/ledger/LedgerWallet";
    import AppAvax from "@obsidiansystems/hw-app-avalanche";

    export default {
        components: {
            Spinner,
            LedgerBlock
        },
        data(){
            return{
                isLoading: false
            }
        },
        watch: {
            isLoading(val){
                // if(val){
                //     this.$refs.ledger_block.open();
                // }else{
                //     this.$refs.ledger_block.close();
                // }
            }
        },
        methods:{
            async submit(){
                // let transport = await TransportNodeHid.create();
                // let wallet = new LedgerWallet(transport)
                this.isLoading = true;

                try{
                    let transport = await TransportU2F.create()
                    let app = new AppAvax(transport);

                    // This is a dummy key for testing
                    // This key is ledger  m/44'/9000'/0'/0
                    // let pubKeyStr = "xpub661MyMwAqRbcExL37Rz8w2Pe7LhLhj4bZPfK8vLuQSMTXj1zfoGTenTF1n7aWP2x2dmRSjmoy69vcdydraE3PC5UZpZNFSrZdTRrGQZXVy5";
                    let wallet = await LedgerWallet.fromApp(app);
                    try{
                        await this.$store.dispatch('accessWalletLedger', wallet);
                        this.onsuccess();
                    }catch(e){
                        this.onerror(e);
                    }
                }catch(e){
                    this.onerror(e);
                }

            },
            onsuccess(){
                this.isLoading = false;
            },
            onerror(err){
                this.isLoading = false;
                console.error(err);
            }
        }
    }
</script>
<style scoped lang="scss">
.spinner{
    width: 100% !important;
    color: var(--bg) !important;
}
</style>
