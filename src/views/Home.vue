<template>
    <div class="home">
        <b-container>
            <b-row>
                <b-col>
                    <div class="home_wrapper">
                        <img v-if="$root.theme === 'day'" class="logo" src="@/assets/wallet_logo.svg" />
                        <img v-else class="logo" src="@/assets/wallet_logo_dark.svg" />
                        <!--            <h1>Our Asset Wallet is Bold and Secure.</h1>-->
                        <h1>The AVAX Wallet</h1>
                        <div class="login_wrapper">
                            <div class="login_option">
                                <header>
                                    <div class="img_container">
                                        <img v-if="$root.theme === 'day'" src="@/assets/diamond-primary.svg" alt />
                                        <img v-else src="@/assets/diamond-primary-night.svg" alt />
                                    </div>
                                    <h2>Welcome Back!</h2>
                                    <p>You can 'Access' your existing AVAX wallet here.</p>
                                </header>
                                <router-link to="/access" class="ava_button button_primary">Access</router-link>
                            </div>
                            <div class="login_option">
                                <header>
                                    <div class="img_container">
                                        <img v-if="$root.theme === 'day'" src="@/assets/diamond-secondary.png" alt />
                                        <img v-else src="@/assets/diamond-secondary-night.svg" alt />
                                    </div>
                                    <h2>Are you new to Avalanche?</h2>
                                    <p>'Create' a new wallet to send, receive and SWAP all your assets.</p>
                                </header>
                                <router-link to="/create" class="ava_button button_secondary">Create New Wallet</router-link>
                            </div>
                        </div>
                    </div>
                </b-col>
            </b-row>
        </b-container>

    </div>
</template>

<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";

@Component({
    name: "home"
})
export default class Home extends Vue {}
</script>

<style scoped lang="scss">
@use "../main";

.home {
    padding-top: 100px;
    /*background-color: #fff;*/
    display: flex;
    justify-content: center;
    align-items: flex-start;
    position: relative;

    a {
        margin: 10px;
        text-align: center;
        display: block;
    }

    .home_wrapper {
        display: flex;
        flex-direction: column;
        align-content: center;
        justify-content: center;

        h1 {
            text-align: center;
            font-size: main.$xl-size;
            font-weight: 400;
        }

        .login_wrapper {
            margin-top: 60px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: main.$container-padding;

            .login_option {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: space-between;
                background-color: var(--bg-light);
                padding: 60px 90px main.$container-padding
                    main.$container-padding;

                header {
                    margin-bottom: 60px;

                    img {
                        width: 89px;
                        height: 89px;
                        max-height: none;
                    }

                    h2 {
                        padding-top: main.$s-size;
                        font-family: "DM Sans", sans-serif;
                        font-size: main.$s-size;
                        text-transform: uppercase;
                        color: var(--primary-color-light);
                    }

                    p {
                        margin-top: 10px !important;
                        font-size: main.$l-size;
                    }
                }

                a {
                    margin: 0;
                }
            }
        }
    }
}

/* ==========================================
   Nav
   ========================================== */

@include main.night-mode{

}
.logo {
    margin-bottom: 30px;
}

img {
    max-height: 40px;
    object-fit: contain;
}




@media only screen and (max-width: 600px) {
    .auth {
        border-radius: 0;
        box-shadow: none;
    }

    .menu_option {
        padding: 5vh 12px;
    }
    .menu_option button {
        width: 100%;
        padding: 8px;
    }

    .imgcover {
        display: none;
    }


    .home {
        .home_wrapper {

            h1 {
                font-size: main.$xl-size-mobile;
            }

            .login_wrapper {
                grid-template-columns: none;
                display: flex;
                flex-direction: column;

                .login_option {
                    margin-bottom: main.$vertical-padding;
                    padding: 30px 15px;
                    align-items: center;

                    header {
                        display: flex;
                        flex-direction: column;
                        align-items: center;

                        margin-bottom: 30px;

                        img {
                            width: 40px;
                            height: 40px;
                        }

                        h2 {
                            padding-top: main.$s-size-mobile;
                            font-size: main.$s-size-mobile;
                        }

                        p {
                            margin-top: 10px !important;
                            font-size: main.$l-size-mobile;
                            text-align: center;
                        }
                    }

                    a {
                        margin: 0;
                    }
                }
            }
        }
    }
}
</style>
