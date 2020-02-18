<template>
    <div class="home">
        <div class="bgdots"></div>
        <div>
            <div class="auth">
                <div class="imgcover">
                    <img src="/img/ava_logo_white.png">
                </div>
                <div class="auth_body">
                    <h2>Access with:</h2>
                    <div class="options">
                        <div @click="loginType='key'" :active="loginType==='key'">
                            <p><fa icon="key"></fa></p>
                            <p>Private Key</p>
                        </div>
                        <div @click="loginType='new'" :active="loginType==='new'">
                            <p><fa icon="plus"></fa></p>
                            <p>Generate <br>Key Pair</p>
                        </div>
                        <div @click="loginType='keystore'" :active="loginType==='keystore'">
                            <p><fa icon="file-excel"></fa></p>
                            <p>Keystore File</p>
                        </div>
                    </div>
                    <hr>
<!--                    <div class="private_in">-->
<!--                        <QRReader @change="qrchange"><button>-->
<!--                            <fa icon="qrcode"></fa>-->
<!--                        </button></QRReader>-->
<!--                        <v-text-field placeholder="Private Key" color="#333" v-model="privateKey" class="pkIn" dense height="30" hide-details></v-text-field>-->
<!--                    </div>-->

<!--                    <v-btn block depressed @click="access">Access Wallet</v-btn>-->
<!--                    <v-btn block depressed>Use Keystore File</v-btn>-->
<!--                    <p>or</p>-->


<!--                    <v-btn block depressed @click="createKey" v-if="!newPrivateKey">Generate Key Pair</v-btn>-->
<!--                    <div v-if="newPrivateKey" class="keygen">-->
<!--                        <v-alert dense color="warning" >-->
<!--                            <fa icon="exclamation-triangle"></fa>-->
<!--                            Do not lose your information or you won't be able to access your wallet and funds again. There is no way to recover lost keys.</v-alert>-->
<!--                        <label>Private Key</label>-->
<!--                        <p>{{newPrivateKey}}</p>-->
<!--                        <label>Public Key</label>-->
<!--                        <p>{{newPublicKey}}</p>-->
<!--                        <label>Address</label>-->
<!--                        <p>{{newAddr}}</p>-->
<!--                    </div>-->
                    <component :is="loginComponent"></component>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import QRReader from "@/components/misc/QRReader";
    import KeystoreLogin from '@/components/home/KeystoreLogin';
    import PrivateKeyLogin from "@/components/home/PrivateKeyLogin";
    import CreateNew from "@/components/home/CreateNew";

    import {avm, bintools, keyChain} from "@/AVA";
    
    export default {
        name: 'home',
        data(){
            return{
                loginType: "key", // key || keystore || new
                privateKey: "",
                address: "",
                // If generated...
                newPrivateKey: "",
                newPublicKey: "",
                newAddr: "",


            }
        },
        components: {
            QRReader,
            KeystoreLogin,
            PrivateKeyLogin,
            CreateNew
        },
        methods: {
            // qrchange(val){
            //     this.privateKey = val;
            // },
            getAddress(){
                let keyChain = AVAAssets.keyChain();
                let privateKeyBuf = binTools.avaDeserialize(this.privateKey);
                let address = keyChain.importKey(privateKeyBuf);
                this.address = address;
                console.log(address);
            },
            // access(){
            //     this.$store.dispatch('accessWallet', this.privateKey);
            // },
            // createKey(){
            //     let addr = keyChain.makeKey();
            //     let keypair = keyChain.getKey(addr);
            //
            //     let pubk = keypair.getPublicKey(); //returns Buffer
            //     let pubkstr = keypair.getPublicKeyString(); //returns an AVA serialized string
            //
            //     let privk = keypair.getPrivateKey(); //returns Buffer
            //     let privkstr = keypair.getPrivateKeyString(); //returns an AVA serialized string
            //
            //     console.log(keypair.getAddressString());
            //     this.newAddr = keypair.getAddressString();
            //     this.newPrivateKey = privkstr;
            //     this.newPublicKey = pubkstr;
            // },
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
        },
        computed: {
            loginComponent(){
                if(this.loginType === 'key'){
                    return PrivateKeyLogin;
                }else if(this.loginType === 'new'){
                    return CreateNew;
                }else{
                    return KeystoreLogin;
                }
            }
        }
    }
</script>
<style scoped>
    .home{
        display: flex;
        justify-content: center;
        position: relative;
        /*display: contents;*/
    }

    .auth{
        position: relative;
        width: 460px;
        max-width: 100vw;
        border-radius: 12px;
        box-shadow: 3px 4px 20px rgba(0,0,0,0.4);
        overflow: hidden;
        background-color: #b7b7b7;
        margin: 15vh auto;
    }

    .options{
        display: flex;
    }
    .options div{
        border: 1px solid transparent;
        flex-grow: 1;
        background-color: #f2f2f2;
        border-radius: 3px;
        flex-basis: 0;
        margin: 3px;
        padding: 4px;
        user-select: none;
        cursor: pointer;
    }

    .options div p{
        color: #333;
    }
    .options div[active]{
        border-color: #42b983;
        background-color: #42b983;
    }
    .options div[active] p{
        color: #fff;
    }

    .options div p:first-child{
        font-size: 30px;
    }

    .options div p{
        font-size: 16px;
        font-weight: bold;
    }


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


    /*.auth >>> input{*/
    /*    text-align: center;*/
    /*    color: #ddd !important;*/
    /*}*/

    .auth_body{
        padding: 30px;
    }



    .v-text-field >>> input{
        border-color: #d2d2d2 !important;
    }

    hr{
        margin: 14px auto;
        border-top: none;
        border-color: #636363;
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
