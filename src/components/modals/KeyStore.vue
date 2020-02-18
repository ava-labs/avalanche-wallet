<template>
    <modal ref="modal" title="Download Keystore File" >
        <div class="keystore_modal">
            <div v-if="stage===1">
                <p>This password will you use encrypt your keys.</p>

                <v-text-field
                        label="Password"
                        placeholder="Please enter at least 9 characters."
                        v-model="keystore_password"></v-text-field>

<!--                <input type="password" v-model="keystore_password">-->
                <v-btn block depressed @click="next" color="#ffcc66">Next</v-btn>
            </div>
            <div v-if="stage===2">
                <p>Your keystore file is ready to download.</p>
<!--                <a-->
<!--                        :href="'data:text/plain;charset=utf-8,'+filedata"-->
<!--                        download="AVA_keystore"-->
<!--                ></a>-->
                <v-btn block depressed @click="download" color="#81a780">Download Keystore File</v-btn>
            </div>
        </div>
    </modal>
</template>
<script>
    import Modal from './Modal';
    const _sodium = require('libsodium-wrappers');
    let sodium;

    (async () => {
       await _sodium.ready;
        sodium = _sodium;
       console.log(sodium)
    })();

    export default {
        data(){
            return{
                stage: 1,
                keystore_password: '',
            }
        },
        components: {
            Modal,
            // CopyText
        },
        methods: {
            open(){
                this.$refs.modal.open();
            },

            // Hashes the password to a length and returns with the salt
            hashPass(){

            },
            next(){

                // let key = sodium.crypto_secretstream_xchacha20poly1305_keygen();
                //
                // let mypass = this.keystore_password;
                // let salt = sodium._randombytes_buf();
                //
                // sodium.crypto_pwhash(key, key.length, mypass, mypass.length, );
                // let pass_hash = sodium.crypto_generichash(32, sodium.from_string(this.keystore_password));
                // let pass_hash_hex = sodium.to_hex(pass_hash);
                //
                // let nonce = 5;
                // // let rev_hash = sodium.from_hex(pass_hash_hex);
                //
                // console.log("Pass sha:",pass_hash);
                //
                // // sodium.crypto_gene
                // // let pwdhash = sodium.crypto_pwhash)
                // //
                // let res = sodium.crypto_secretstream_xchacha20poly1305_init_push(pass_hash);
                // let [state_out, header] = [res.state, res.header];
                // //
                // // console.log(sodium);
                // console.log("Key: ",key);
                // console.log(state_out, header);

                // let hash2 = sodium.crypto_shorthash('test', key);
                this.stage = 2;
            },
            download(){
                let filedata = {
                    pass_hash: '',
                    address: this.address,
                    private: this.privateKey,
                };

                let text = JSON.stringify(filedata);

                let addr = this.address;
                    addr = addr.substring(addr.length-5);

                let filename = `AVA_${addr}`;

                var blob = new Blob(
                    [ text ],
                    {
                        type : "text/plain;charset=utf-8"
                    }
                );

                let url = URL.createObjectURL( blob );

                console.log(url);

                var element = document.createElement('a');
                    element.setAttribute('href', url);
                    element.setAttribute('download', filename);
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            }
        },
        computed: {
            address(){
                return this.$store.state.address;
            },
            privateKey(){
                return this.$store.state.privateKey;
            },
            filedata(){
                return encodeURIComponent('random text bro')
            }
        },
        mounted() {

        }
    }
</script>
<style scoped>
    .keystore_modal{
        padding: 25px;
    }
</style>