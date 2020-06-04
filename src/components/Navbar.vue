<template>
    <div id="nav">
        <router-link to="/" class="logo"><img src="@/assets/wallet_logo.png"> <span class="slogan">by AVA</span></router-link>
        <v-spacer></v-spacer>


        <div class="buts_right">
            <network-menu></network-menu>
            <template v-if="isAuth">
                <button @click="logout">Log out</button>
            </template>
            <template v-else>
                <router-link to="/access">Access Wallet</router-link>
                <router-link to="/create" class="action_but">Get Started</router-link>
            </template>
        </div>

        <div class="mobile_right">
            <v-btn @click="isDrawer = !isDrawer" icon>
                <fa icon="bars"></fa>
            </v-btn>
        </div>

        <!--   MOBILE MENU     -->
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
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';
    // import LanguageSelect from './LanguageSelect';
    // import DayNightToggle from "@/components/misc/DayNightToggle";
    import NetworkMenu from './NetworkSettings/NetworkMenu.vue';

    @Component({
        components:{
            NetworkMenu
        }
    })
    export default class Navbar extends Vue {
        isDrawer: boolean = false;

        get isAuth(): boolean{
            return this.$store.state.isAuth;
        }

        logout():void{
            this.$store.dispatch('logout');
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
        white-space: nowrap;
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
                margin-right: 5px;
            }
        }
        a {

        }
    }

    .buts_right{
        display: flex;
        align-items: center;
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
        .slogan{
            /*display: none;*/
        }
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
