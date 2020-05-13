<template>
    <div id="nav">
<!--        <router-link v-if="!isAuth" to="/">Home</router-link>-->
<!--        <router-link v-if="isAuth" to="/wallet/ava">Wallet</router-link>-->

        <router-link to="/" class="logo"><img src="@/assets/wallet_logo.png"> A Wallet by AVA</router-link>
<!--        <p class="app_name">BETA WALLET</p>-->
        <v-spacer></v-spacer>
<!--        <language-select></language-select>-->
<!--        <day-night-toggle class="daynight"></day-night-toggle>-->
        <div v-if="isAuth">
            <button @click="logout">Log out</button>
        </div>
        <div v-else>
            <router-link to="/access">Access Wallet</router-link>
            <router-link to="/create" class="action_but">Get Started</router-link>
        </div>
    </div>
</template>
<script>
    import LanguageSelect from './LanguageSelect';
    import DayNightToggle from "@/components/misc/DayNightToggle";
    export default {
        components: {
            // LanguageSelect,
            // DayNightToggle
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
        margin-right: 15px;
    }

    button{
        font-weight: normal;
    }

    .daynight{
        margin-right: 15px;
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
            display: flex;
            align-items: center;

            img{
                height: 18px;
                object-fit: contain;
                margin-right: 25px;
            }
        }
        a {

        }
    }


    .action_but{
        background-color: #EBE4FB;
        color: #4E00FF !important;
        padding: 6px 18px;
        border-radius: 4px;
    }
</style>
