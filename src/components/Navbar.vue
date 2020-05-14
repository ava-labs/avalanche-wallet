<template>
    <div id="nav">
<!--        <router-link v-if="!isAuth" to="/">Home</router-link>-->
<!--        <router-link v-if="isAuth" to="/wallet/ava">Wallet</router-link>-->

        <router-link to="/" class="logo"><img src="@/assets/wallet_logo.png">by AVA</router-link>
<!--        <p class="app_name">BETA WALLET</p>-->
        <v-spacer></v-spacer>
<!--        <language-select></language-select>-->
<!--        <day-night-toggle class="daynight"></day-night-toggle>-->
        <div class="buts_right">
            <div v-if="isAuth">
                <button @click="logout">Log out</button>
            </div>
            <div v-else>
                <router-link to="/access">Access Wallet</router-link>
                <router-link to="/create" class="action_but">Get Started</router-link>
            </div>
        </div>

        <div class="mobile_right">
            <v-btn @click="isDrawer = !isDrawer" icon>
                <fa icon="bars"></fa>
            </v-btn>
        </div>


        <v-navigation-drawer v-model="isDrawer" fixed style="z-index: 999;" hide-overlay>
            <v-list dense nav>
                <v-list-item>
                    <img src="@/assets/wallet_logo.png">
                </v-list-item>
                <template v-if="isAuth">
                    <v-list-item to="/wallet/">Home</v-list-item>
                    <v-list-item to="/wallet/keys">Manage Keys</v-list-item>
                    <v-list-item to="/wallet/transfer">Transfer</v-list-item>
                    <v-list-item @click="logout">Log out</v-list-item>
                </template>
                <template v-else>
                    <v-list-item to="/access">Access Wallet</v-list-item>
                    <v-list-item to="/create" class="action_but">Get Started</v-list-item>
                </template>
            </v-list>
        </v-navigation-drawer>
    </div>
</template>
<script>
    import LanguageSelect from './LanguageSelect';
    import DayNightToggle from "@/components/misc/DayNightToggle";
    export default {
        data(){
            return {
                isDrawer: false,
            }
        },
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


    .mobile_right{
        display: none;
    }

    @media only screen and (max-width: main.$mobile_width) {
        .buts_right{
            display: none;

            .router-link-exact-active{
                background-color: #42b983;
            }
        }

        .mobile_right{
            display: block;
        }


    }
</style>
