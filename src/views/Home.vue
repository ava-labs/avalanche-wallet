<template>
    <div class="home">
        <div class="bgdots"></div>
        <div>
<!--            <p>This is a wallet.</p>-->
<!--            <p>ExgKyqhZ69FhB7jdW3p4oWtaBA9adXSEPTCf1sc9Zw7965NQH</p>-->
<!--            <p>21Aive7if6sDvhSmQcikqMFrWd8kH2MUJjj9mCTbFdxUAJDT4b</p>-->
            <div class="auth">
                <div class="imgcover">
                    <img src="/img/ava_logo_white.png">
                </div>
                <div class="auth_body">
                    <h2>Access Wallet</h2>
                    <div class="private_in">
                        <QRReader @change="qrchange"><button>
                            <fa icon="qrcode"></fa>
                        </button></QRReader>
                        <v-text-field placeholder="Private Key" color="#333" v-model="privateKey" class="pkIn" dense height="30" hide-details></v-text-field>
                    </div>

                    <v-btn block depressed @click="access">Access Wallet</v-btn>
                    <p>or</p>
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
            </div>
        </div>
    </div>
</template>

<script>
    import QRReader from "@/components/misc/QRReader";
    import {avm, bintools, keyChain} from "@/AVA";
    
    export default {
        name: 'home',
        data(){
            return{
                privateKey: "",
                address: "",
                // If generated...
                newPrivateKey: "",
                newPublicKey: "",
                newAddr: "",

            }
        },
        components: {
            QRReader
            // HelloWorld
        },
        methods: {
            qrchange(val){
                this.privateKey = val;
            },
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
            // getUTXOS(){
            //     AVAAssets.GetUTXOs([this.address]).then(res => {
            //         // console.log(res);
            //         // console.log(res.getAllUTXOStrings());
            //         // console.log(res.getAllUTXOs());
            //         // console.log(`Balance: ${res.getBalance()}`)
            //
            //         let utxos = res.getAllUTXOs();
            //
            //         for(var id in utxos){
            //             let utxo = utxos[id];
            //             let asset_id = utxo.getAssetID()
            //                 asset_id = binTools.bufferToB58(asset_id);
            //             let asset_amount = utxo.getAmount()
            //             console.log(asset_id,asset_amount.toString(10,0));
            //         }
            //         // console.log(utxos[0].getAssetID());
            //         // console.log(utxos[0].getAmount());
            //     })
            // }
        }
    }
</script>
<style scoped>
    .imgcover{
        padding: 30px;
        background-color: #3a403d;
    }
    img{
        max-width: 120px;
        object-fit: contain;
    }
    .private_in{
        display: flex;
        align-items: center;
        color: #333;
        background-color: #a5a5a5;
        margin-bottom: 8px;
        padding: 0px 12px;
    }

    .private_in button{
        font-size: 24px;
        /*padding: 8px 0;*/
        padding-right: 12px;
        /*border-bottom: 1px solid;*/
    }
    .pkIn{
        padding: 0;
        margin: 0;
    }
    .pkIn >>> input::placeholder{
        color: #333 !important;
    }
    .pkIn >>> input{
        color: #333 !important;
        text-align: center;
    }
    .pkIn >>> .v-input__slot::before{
        display: none;
        border-color: #d2d2d240 !important;
    }
    .home{
        display: flex;
        align-items: center;
        justify-content: center;

    }

    .bgdots{
        position: absolute;
        width: 100%;
        height: 100%;
        background-image: url('/img/dots_bg.svg');
        background-repeat: repeat;
        background-size: 20px;
        opacity: 0.2;
        z-index: 0;
    }

    p{
        color: #333;
        margin: 4px 0 !important;
    }

    h2{
        color: #333;
    }

    .auth{
        position: relative;
        width: 400px;
        border-radius: 12px;
        box-shadow: 3px 4px 20px rgba(0,0,0,0.4);
        overflow: hidden;
        background-color: #b7b7b7;
    }
    /*.auth >>> input{*/
    /*    text-align: center;*/
    /*    color: #ddd !important;*/
    /*}*/

    .auth_body{
        padding: 30px;
    }

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

    .v-text-field >>> input{
        border-color: #d2d2d2 !important;
    }

    @media only screen and (max-width: 600px) {
        h2{
            color: #ddd;
        }
        .auth{
            box-shadow: none;
            background-color: transparent;
        }

        .imgcover{
            background-color: transparent;
        }

        .auth_body{
            padding: 0px 24px;
        }

        p{
            color: #ddd;
        }
    }
</style>
