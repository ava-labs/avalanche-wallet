<template>
    <v-app>
        <v-content>
            <navbar></navbar>
            <transition name="fade" mode="out-in">
                <router-view id="router_view"/>
            </transition>
        </v-content>
        <notifications></notifications>
    </v-app>
</template>
<script>
    import Notifications from '@/components/Notifications';
    import Navbar from './components/Navbar';

    export default {
        components: {
            Navbar,
            Notifications
        },
        created() {
            this.$store.dispatch('Assets/getAllAssets');
        }
    }
</script>

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
        background-color: #fff;
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

    #router_view{
        min-height: calc(100vh - 80px);
        position: relative;
        padding: main.$container_padding_m;
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
            padding: main.$container_padding_mobile;
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


    .but_primary{
        background-color: #000;
        color: #fff !important;
        text-transform: none !important;
        /*font-size: 13px;*/
        padding: 8px 18px;
        border-radius: 6px;
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
