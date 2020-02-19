<template>
    <div>
        <h4 class="card_header">Scan Paper Wallet <span><fa icon="qrcode"></fa></span></h4>
        <div class="card_body">
            <p>Scan the private key from a paper wallet to add to your managed key pairs.</p>
            <label>Private Key</label>
            <QRInput @change="qr_change"></QRInput>
            <v-btn
                    block
                    depressed
                    @click="addKey"
                    :disabled="!canAdd"
            >Add to keychain</v-btn>
        </div>

    </div>
</template>
<script>
    import QRInput from "@/components/misc/QRInput";

    import {bintools, keyChain} from "@/AVA";

    export default {
        components: {
            QRInput
        },
        data(){
            return {
                pk: "",
                canAdd: false,
            }
        },
        methods: {
            qr_change(val){
                this.pk = val;
                if(this.pk.length>10){
                    this.canAdd = true
                }else{
                    this.canAdd = false;
                }
            },
            addKey(){
                console.log("adding key: ",this.pk);

                let pk = bintools.avaDeserialize(this.pk);

                console.log("deserialized: ",pk);
                keyChain.importKey(pk);

                console.log(keyChain.getAddressStrings());
                this.$store.dispatch('refreshAddresses');
            }
        }
    }
</script>
<style scoped>

</style>