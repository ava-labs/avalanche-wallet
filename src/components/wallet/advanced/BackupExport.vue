<template>
    <div>
        <p>Download your keys in a password encrypted file. </p>
        <v-text-field type="password" hint="Minimum 9 characters." label="Password"
                      v-model="pass" persistent-hint color="#42b983"
        ></v-text-field>
        <v-text-field type="password" hint="Minimum 9 characters." label="Confirm Password"
                      v-model="passConfirm" persistent-hint color="#42b983"
        ></v-text-field>
        <br>
        <v-btn depressed :disabled="!isValid" color="#42b983"
               @click="download" :loading="is_loading">Download</v-btn>
    </div>
</template>
<script>
    import {cryptoHelpers, keyChain, bintools} from '@/AVA';

    export default {
        data(){
            return {
                is_loading: false,
                pass: '',
                passConfirm: ''
            }
        },

        computed: {
            isValid(){
                if(this.pass.length >= 9 && this.pass===this.passConfirm) return true;
                return false;
            },
        },
        methods: {
            //
            // async getFile(){
            //     let pass = this.pass;
            //
            //     let salt = await cryptoHelpers.makeSalt();
            //     let passHash = await cryptoHelpers.pwhash(pass, salt);
            //
            //
            //     // Loop private keys, encrypt them and store in an array
            //     let keys = [];
            //     let addresses = this.$store.state.addresses;
            //     for(var i=0; i<addresses.length; i++){
            //         let addr = addresses[i];
            //         let addBuf = bintools.stringToAddress(addr);
            //         let key = keyChain.getKey(addBuf);
            //
            //         let pk = key.getPrivateKey();
            //
            //         let pk_crypt = await cryptoHelpers.encrypt(pass,pk);
            //
            //
            //         let key_data = {
            //             key: bintools.avaSerialize(pk_crypt.ciphertext),
            //             nonce: bintools.avaSerialize(pk_crypt.nonce),
            //             salt: bintools.avaSerialize(pk_crypt.salt),
            //             address: addr
            //         }
            //         keys.push(key_data);
            //     }
            //
            //
            //     let file_data = {
            //         pass_salt: bintools.avaSerialize(salt),
            //         pass_hash: bintools.avaSerialize(passHash.hash),
            //         keys: keys
            //     }
            //
            //     return file_data;
            // },

            async download(){
                let parent = this;
                this.is_loading = true;

                setTimeout(function(){
                    parent.$store.dispatch('exportKeyfile', parent.pass).then( (res) => {
                        parent.is_loading = false;
                        parent.pass = "";
                        parent.$store.dispatch("Notifications/add", {
                            title: "Key File Export" ,
                            message: "Your keys are downloaded."
                        });
                    });
                }, 200);
                // this.$nextTick(function(){
                //
                // });

            }
        },
        mounted(){
            // console.log(cryptoHelpers);
        }
    }
</script>