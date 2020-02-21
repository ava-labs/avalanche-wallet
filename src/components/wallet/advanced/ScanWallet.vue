<template>
    <div>
        <p>Scan the private key from a paper wallet to add to your managed key pairs.</p>
        <label>Private Key</label>
        <QRInput @change="qr_change" v-model="pk"></QRInput>
        <v-btn
                class="addKeyBut"
                depressed
                @click="addKey"
                color="#42b983"
                :disabled="!canAdd"
        >Add to keychain</v-btn>
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
                // this.pk = val;
                if(this.pk.length>10){
                    this.canAdd = true
                }else{
                    this.canAdd = false;
                }
            },
            addKey(){
                let parent = this;
                console.log("adding key: ",this.pk);

                this.$store.dispatch('addKey', this.pk).then(() => {
                    parent.pk = "";
                });
            }
        }
    }
</script>
<style scoped>
    .addKeyBut{
        color: #fff;
    }
</style>