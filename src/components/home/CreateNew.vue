<template>
    <div>
        <v-alert dense color="error" outlined>
            <fa icon="exclamation-triangle"></fa>
            {{$t('home.create.warning')}}.</v-alert>
        <v-btn block depressed @click="createKey" v-if="!newPrivateKey">{{$t('home.create.generate')}}</v-btn>
        <div v-if="newPrivateKey" class="keygen">
            <label>{{$t('private_key')}}</label>
            <text-display-copy :value="newPrivateKey"></text-display-copy>
            <button @click="access" class="access">{{$t('home.create.submit')}}</button>
        </div>
    </div>
</template>
<script>

    import TextDisplayCopy from "@/components/misc/TextDisplayCopy";
    import {keyChain} from "@/AVA";

    export default {
        components: {
            TextDisplayCopy
        },
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
            },

            access(){
                this.$store.dispatch('accessWallet', this.newPrivateKey);
            }
        }
    }
</script>
<style scoped>
    .keygen{
        text-align: left;
        color: #333;
        /*background-color: #a0a0a0;*/
        padding: 6px;
        font-size: 14px;
    }

    .keygen p{
        margin-top: 0 !important;
        color: #303030;
        margin-bottom: 12px;
        word-break: break-all;
        background-color: #f2f2f2;
        padding: 8px;
    }
    .keygen label{
        font-size: 13px;
        font-weight: bold;
    }

    .access{
        display: block;
        width: 100%;
        background-color: #42b983;
        color: #fff;
        font-size: 18px;
        padding: 12px;
        font-weight: bold;
        border-radius: 8px;
        text-align: center;
        margin-top: 15px;
    }

    .v-alert{
        font-size: 14px;
    }

    .warning{
        font-weight: bold;
        color: #42b983 !important;
    }
</style>