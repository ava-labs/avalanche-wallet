<template>
    <div class="home">
        <div class="bgdots"></div>
        <div>
            <div class="auth">
                <div class="imgcover">
                    <img src="/img/ava_logo_white.png">
                </div>
                <div class="auth_body">
                    <v-alert type="error" :icon="false" text>
                        This is a <b>Beta Wallet</b> running on our testnet. <br> The tokens you have are not real and will not transfer to the real wallet.
                    </v-alert>
                    <div class="menu" v-show="menu==='main'">
                        <div class="menu_option">
                            <h4>{{ $t('home.access.title') }}</h4>
                            <p>{{ $t('home.access.desc') }}</p>
                            <button @click="menu='access'">{{$t('home.but_access')}} <fa icon="arrow-right"></fa></button>
                        </div>
                        <div class="menu_option">
                            <h4>{{ $t('home.create.title') }}</h4>
                            <p>{{ $t('home.create.desc') }}</p>
                            <button @click="menu='new'">{{$t('home.but_create')}} <fa icon="arrow-right"></fa></button>
                        </div>
                    </div>

                    <div v-show="menu==='access'">
                        <button @click="menu='main'" class="backBut"><fa icon="arrow-left"></fa> {{$t('home.go_back')}}</button>
                        <h3>{{ $t('home.access.title')}}</h3>
                        <div class="options">
                            <div @click="loginType='key'" :active="loginType==='key'">
                                <p><fa icon="key"></fa></p>
                                <p>{{$t('home.access.key.title')}}</p>
                            </div>
                            <div @click="loginType='keystore'" :active="loginType==='keystore'">
                                <p><fa icon="file-excel"></fa></p>
                                <p>{{$t('home.access.file.title')}}</p>
                            </div>
                        </div>
                        <component :is="loginComponent"></component>
                    </div>

                    <div v-show="menu==='new'">
                        <button @click="menu='main'" class="backBut"><fa icon="arrow-left"></fa> {{$t('home.go_back')}}</button>
                        <h3>{{$t('home.create.title')}}</h3>
                        <create-new></create-new>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import KeystoreLogin from '@/components/home/KeystoreLogin';
    import PrivateKeyLogin from "@/components/home/PrivateKeyLogin";
    import CreateNew from "@/components/home/CreateNew";


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
                menu: 'main', // main | new | access
            }
        },
        components: {
            // QRReader,
            KeystoreLogin,
            PrivateKeyLogin,
            CreateNew
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
    }


    .auth{
        position: relative;
        width: 460px;
        max-width: 100vw;
        border-radius: 4px;
        box-shadow: 3px 4px 20px rgba(0,0,0,0.4);
        overflow: hidden;
        background-color: #fafafa;
        margin: 15vh auto;
    }

    .menu_option{
        border: 1px solid #eaeaea;
        background-color: #fff;
        margin-bottom: 15px;
        border-radius: 6px;
        padding: 12px;
    }

    .menu_option h4{
        font-size: 20px;
    }

    .menu_option button{
        background-color: #42b983;
        color: #fff;
        font-weight: bold;
        border-radius: 14px;
        padding: 3px 12px;
        font-size: 13px;
        transition-duration: 0.2s;
    }
    .menu_option button:hover{
        transform: translateX(5px);
    }

    .backBut{
        font-size: 12px;
        color: #42b983;
    }

    .options{
        display: flex;
        margin-bottom: 15px;
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
        text-align: center;
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
        text-align: center;
        padding: 12px;
        background-color: #3a403d;
    }
    img{
        max-height: 40px;
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
        /*height: 100%;*/
        min-height: calc(100vh - 80px);
        background-image: url('/img/dots_bg.svg');
        background-repeat: repeat;
        background-size: 20px;
        opacity: 1;
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
        border-color: #d2d2d2;
    }

    @media only screen and (max-width: 600px) {
        h2{
            color: #ddd;
        }
        .auth{
            /*height: 100;*/
            /*margin: 0;*/
            border-radius: 0;
            box-shadow: none;
            /*background-color: transparent;*/
        }

        .menu_option{
            padding: 5vh 12px;
        }
        .menu_option button{
            width: 100%;
            padding: 8px;
        }

        .imgcover{
            display: none;
            /*background-color: transparent;*/
        }

        .auth_body{
            padding: 30px 24px;
        }


        .options{
            /*flex-direction: column;*/
        }

        /*p{*/
        /*    color: #ddd;*/
        /*}*/
    }
</style>
