<template>
    <div>
        <v-btn block depressed @click="createKey" v-if="!newPrivateKey">Generate Key Pair</v-btn>
        <div v-if="newPrivateKey" class="keygen">
            <v-alert dense color="warning" >
                <fa icon="exclamation-triangle"></fa>
                Do not lose your information or you won't be able to access your wallet and funds again. There is no way to recover lost keys.</v-alert>
            <label>Private Key</label>
            <p>{{newPrivateKey}}</p>
            <label>Public Key</label>
            <p>{{newPublicKey}}</p>
            <label>Address</label>
            <p>{{newAddr}}</p>
        </div>
    </div>

</template>
<script>

    import {keyChain} from "@/AVA";

    export default {
        data(){
            return{
                newPrivateKey: null,
                newPublicKey: null,
                newAddr: null
            }
        },
        methods: {
            createKey(){
                let addr = keyChain.makeKey();
                let keypair = keyChain.getKey(addr);

                let pubk = keypair.getPublicKey(); //returns Buffer
                let pubkstr = keypair.getPublicKeyString(); //returns an AVA serialized string

                let privk = keypair.getPrivateKey(); //returns Buffer
                let privkstr = keypair.getPrivateKeyString(); //returns an AVA serialized string

                // console.log(keypair.getAddressString());
                this.newAddr = keypair.getAddressString();
                this.newPrivateKey = privkstr;
                this.newPublicKey = pubkstr;
            }
        }
    }
</script>
<style scoped>
    .keygen{
        text-align: left;
        color: #333;
        background-color: #a0a0a0;
        padding: 6px;
        font-size: 14px;
    }

    .keygen p{
        margin-top: 0 !important;
        color: #303030;
        margin-bottom: 12px;
        word-break: break-all;
    }
    .keygen label{
        font-size: 13px;
        font-weight: bold;
    }

    .v-alert{
        font-size: 12px;
    }
</style>