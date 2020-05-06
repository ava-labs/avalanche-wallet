<template>
    <div id="nav">
<!--        <router-link v-if="!isAuth" to="/">Home</router-link>-->
<!--        <router-link v-if="isAuth" to="/wallet/ava">Wallet</router-link>-->
<!--        <img src="/img/logo_dark.svg">-->
        <router-link to="/" class="logo">AVA Wallet</router-link>
<!--        <p class="app_name">BETA WALLET</p>-->
        <v-spacer></v-spacer>
        <language-select></language-select>
        <day-night-toggle></day-night-toggle>
        <div v-if="isAuth">
            <button @click="logout">Log out</button>
        </div>
    </div>
</template>
<script>
    import LanguageSelect from './LanguageSelect';
    import DayNightToggle from "@/components/misc/DayNightToggle";
    export default {
        components: {
            LanguageSelect,
            DayNightToggle
        },
        computed: {
            isAuth(){
                return this.$store.state.isAuth;
            }
        },
        methods: {
            logout(){
                this.$store.dispatch('logout');
            },

        }
    }
</script>
<style scoped lang="scss">
    @use '../main';


    img{
        max-height: 25px;
    }
    a{
        text-decoration: none;
        font-weight: normal;
    }

    button{
        font-weight: normal;
    }
    .app_name{
        margin: 0;
        padding: 3px 6px;
        color: #ff9090;
        background-color: #fbefef;
    }

    #nav{
        .logo{
            font-family: Inconsolata;
            color: #000;
        }
        a {

        }
    }
</style>
<style lang="scss">
    #app[night_mode=""]{
        #nav{
        }
    }
</style>
