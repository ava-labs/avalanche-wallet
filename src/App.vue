<template>
    <v-app>
        <v-content>
            <navbar></navbar>
            <router-view id="router_view"/>
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
    @media only screen and (max-width: 600px) {
        #nav{
            position: fixed;
            height: 80px;
            width: 100%;
            top: 0px;
            z-index: 2;

            a{
                font-size: 12px;
            }
        }

        #router_view{
            padding-top: 80px;
        }
    }



    /*     For vue transitions */

    .fade-enter-active, .fade-leave-active {
        transition: opacity .2s;
    }
    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
        opacity: 0;
    }
</style>
