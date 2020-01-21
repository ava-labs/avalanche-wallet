<template>
    <div class="home">
        <div>
            <img src="/img/ava_logo_white.png">
            <p>This is a wallet.</p>
            <div class="auth">
                <h2>Access Wallet</h2>
                <v-text-field placeholder="Private Key" color="#ddd" v-model="privateKey"></v-text-field>
                <v-btn block @click="access">Access Wallet</v-btn>
<!--                <label>Address:</label>-->
<!--                <p>{{address}}</p>-->
<!--                <v-btn block @click="getUTXOS">Get UTXOs</v-btn>-->
            </div>
        </div>
    </div>
</template>

<script>

    import {AVAAssets, binTools} from "@/AVA";

    // console.log(BinTools)
    // let KeyPair = avajs.TypesLibrary.AssetsAPI.Keychain.AVAKeyPair;
    // console.log(KeyPair);
    export default {
        name: 'home',
        data(){
            return{
                privateKey: "2RzAm1vygtZ41JpCSdCL4p5RFFaij22f73Q8WEaEcFGaWdBeav",
                publicKey: "",
                address: "",
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

                // console.log(binTools);
                // let privateKeyBuf = binTools.b58ToBuffer(this.privateKey);
                // console.log(privateKeyBuf);
                // let deserial = binTools.avaDeserialize(keyChain);
                // console.log(deserial)
                // console.log();
                // let newKey = keyChain.makeKey();
                // let otherKey = keyChain.getKey(newKey);
                // console.log(newKey, otherKey);
                // let keypair = new KeyPair();
                // let addr = keypair.importKey(this.privateKey);
                // console.log(`address: ${addr}`)

                // this.publicKey = keypair.getPublicKey();
                // this.address = keypair.getAddress();
                //
                // console.log(keypair.getPublicKeyString())
                // console.log(this.publicKey);
                //
                // // this.address = keypair.addressFromPublicKey(this.publicKey);
                //
                // console.log(this.address);

            },
            getUTXOS(){
                console.log("Getting UTXOs from",this.address);
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
</style>
