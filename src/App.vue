<template>
    <v-app>
        <v-content>
            <navbar v-if="isNavbar"></navbar>
            <div class="main_cols" :wallet_view="!isNavbar">
                <transition name="fade" mode="out-in">
                    <sidebar class="panel" v-if="!isNavbar"></sidebar>
                </transition>
                <transition name="fade" mode="out-in">
                    <router-view id="router_view"/>
                </transition>
                <transition name="fade" mode="out-in">
                    <main-panel class="panel" v-if="!isNavbar"></main-panel>
                </transition>
            </div>

        </v-content>
        <notifications></notifications>
    </v-app>
</template>
<script>
    import Notifications from '@/components/Notifications';
    import Navbar from './components/Navbar';
    import MainPanel from '@/components/SidePanels/MainPanel';
    import Sidebar from '@/components/wallet/Sidebar';


    export default {
        components: {
            Sidebar,
            Navbar,
            Notifications,
            MainPanel
        },
        async created() {
            let parent = this;
            // this.$store.dispatch('Assets/getAllAssets');
            await this.$store.dispatch('Network/init');

            // check session storage
            this.$store.dispatch('autoAccess').then((res) => {

                if(res){
                    parent.$store.dispatch('Notifications/add', {
                        title: "Keys Remembered",
                        message: "Your stored keys are used to log you in.",
                        type: "success"
                    })
                }

            });


        },
        computed:{
            isNavbar(){
                // console.log(this.$route);
                // return this.$store.state.is
                if(this.$route.path.includes('/wallet')){
                    return false;
                }
                return true
            }
        }
    }
</script>

<style scoped lang="scss">
    @use "./main";

    .main_cols{
        display: grid;
        grid-template-columns: 1fr;

        &[wallet_view]{
            grid-template-columns:  240px 1fr 340px;
            height: 100vh;

            #router_view{
                overflow: auto;
                padding: 12px 16px;
                padding-bottom: 0px;
            }
        }
    }


    #router_view{
        min-height: calc(100vh - 80px);
        position: relative;
        padding: main.$container_padding_m;
    }

    .panel{
        background-color: #fff;
        /*padding: 8px 16px;*/
        overflow: auto;
        height: 100%;
    }
</style>

<style lang="scss">
    @use "./main";

    html{
        height: 100%;
    }

    body{
        height: 100%;
    }

    p{
        margin: 0px !important;
    }
    #app {
        min-height: 100%;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: left;
        color: #2c3e50;
        background-color: #F5F6FA;
        font-family: 'Rubik', sans-serif;
        transition-duration: 0.2s;
    }

    #nav {
        height: 80px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        z-index: 2;
        background-color: transparent;
        padding: main.$container_padding_m;
    }

    button{
        outline: none;
    }





    a{
        color: #000 !important;
        text-decoration: none !important;
    }


    @media only screen and (max-width: main.$mobile_width) {
        #router_view{
            padding: main.$container_padding_mobile;
        }

        #nav{
            padding: main.$container_padding_mobile;
        }
    }

    @media only screen and (max-width: main.$width_s) {
        #router_view{
            padding: main.$container_padding_s;
        }
        #nav{
            padding: main.$container_padding_s;
        }
    }



    /*     For vue transitions */

    .fade-enter-active, .fade-leave-active {
        transition: opacity .2s;
    }
    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
        opacity: 0;
    }


    .float-enter-active, .float-leave-active {
        transition: all .2s;
    }
    .float-enter, .float-leave-to /* .fade-leave-active below version 2.1.8 */ {
        transform: translateY(30px);
    }


    .slide_right-enter-active, .slide_right-leave-active {
        transition: opacity .2s;
    }
    .slide_right-enter, .slide_right-leave-to /* .fade-leave-active below version 2.1.8 */ {
        transform: translateX(100%);
        opacity: 0;
    }



    .but_primary{
        background-color: #000;
        color: #fff !important;
        text-transform: none !important;
        /*font-size: 13px;*/
        padding: 8px 18px;
        border-radius: 2px;
    }


    #app[night_mode=""]{
        background-color: #000;


        a, p, h1, h2, h4{
            color: #fff !important;
        }


        .but_primary{
            background-color: #fff !important;
            color: #000 !important;
        }
    }
</style>
