<template>
    <div class="home">
        <div>
            <img src="/img/ava_logo_white.png">
            <p>This is a wallet.</p>
            <div class="auth">
                <h2>Access Wallet</h2>
                <v-text-field placeholder="Private Key" color="#ddd" v-model="privateKey"></v-text-field>
                <v-btn block @click="access">Access Wallet</v-btn>
                <p>or</p>
                <v-btn block @click="createKey" v-if="!newPrivateKey">Generate Key Pair</v-btn>
                <div v-if="newPrivateKey" class="keygen">
                    <v-alert dense color="warning" text>
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
        </div>
    </div>
</template>

<script>

    import {avm, bintools, keyChain} from "@/AVA";


    // pk1: ExgKyqhZ69FhB7jdW3p4oWtaBA9adXSEPTCf1sc9Zw7965NQH
    // pk2: 21Aive7if6sDvhSmQcikqMFrWd8kH2MUJjj9mCTbFdxUAJDT4b

    // console.log(BinTools)
    // let KeyPair = avajs.TypesLibrary.AssetsAPI.Keychain.AVAKeyPair;
    // console.log(KeyPair);
    export default {
        name: 'home',
        data(){
            return{
                privateKey: "ExgKyqhZ69FhB7jdW3p4oWtaBA9adXSEPTCf1sc9Zw7965NQH",
                address: "",
                // If generated...
                newPrivateKey: "",
                newPublicKey: "",
                newAddr: "",

            }
        },
        components: {
            // HelloWorld
        },
        methods: {
            getAddress(){
                let keyChain = AVAAssets.keyChain();
                let privateKeyBuf = binTools.avaDeserialize(this.privateKey);
                let address = keyChain.importKey(privateKeyBuf);
                this.address = address;
                console.log(address);
            },
            access(){
                this.$store.dispatch('accessWallet', this.privateKey);
            },
            createKey(){
                let addr = keyChain.makeKey();
                let keypair = keyChain.getKey(addr);

                let pubk = keypair.getPublicKey(); //returns Buffer
                let pubkstr = keypair.getPublicKeyString(); //returns an AVA serialized string

                let privk = keypair.getPrivateKey(); //returns Buffer
                let privkstr = keypair.getPrivateKeyString(); //returns an AVA serialized string

                this.newAddr = addr;
                this.newPrivateKey = privkstr;
                this.newPublicKey = pubkstr;
            },
            getUTXOS(){
                AVAAssets.GetUTXOs([this.address]).then(res => {
                    // console.log(res);
                    // console.log(res.getAllUTXOStrings());
                    // console.log(res.getAllUTXOs());
                    // console.log(`Balance: ${res.getBalance()}`)

                    let utxos = res.getAllUTXOs();

                    for(var id in utxos){
                        let utxo = utxos[id];
                        let asset_id = utxo.getAssetID()
                            asset_id = binTools.bufferToB58(asset_id);
                        let asset_amount = utxo.getAmount()
                        console.log(asset_id,asset_amount.toString(10,0));
                    }
                    // console.log(utxos[0].getAssetID());
                    // console.log(utxos[0].getAmount());
                })
            }
        }
    }
</script>
<style scoped>
    .home{
        display: flex;
        align-items: center;
        justify-content: center;
    }

    p{
        color: #d2d2d2;
    }

    h2{
        color: #ddd;
    }

    .auth{
        width: 400px;
        background-color: #303030;
        padding: 30px;
    }
    .auth >>> input{
        text-align: center;
        color: #ddd !important;
    }


    .keygen{
        text-align: left;
        color: #f2f2f2;
        background-color: #3a3a3a;
        padding: 6px;
        font-size: 11px;
    }

    .keygen p{
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
