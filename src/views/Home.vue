<template>
    <div class="home">
        <div class="home_wrapper">
            <img class="logo" src="@/assets/wallet_logo.png" />
            <h2>Our Asset Wallet is Bold and Secure.</h2>
            <div class="login_wrapper">
                <div class="login_option">
                    <header>
                        <div class="img_container">
                            <img src="@/assets/diamond-primary.png" alt />
                        </div>
                        <h3>Welcome Back!</h3>
                        <p>You can 'Access' your existing AVA wallet here.</p>
                    </header>
                    <router-link to="/access" class="primary">Access</router-link>
                </div>
                <div class="login_option">
                    <header>
                        <div class="img_container">
                            <img src="@/assets/diamond-secondary.png" alt />
                        </div>
                        <h3>Hi! Are you new to Avalanche?</h3>
                        <p>'Create' a new wallet to send, receive and SWAP all your assets.</p>
                    </header>
                    <router-link to="/create" class="secondary">Create New Wallet</router-link>
                </div>
            </div>
        </div>
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
    background-color: #fff;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    position: relative;

    a {
        margin: 10px;
        text-align: center;
        display: block;
        border-radius: 6px;
        font-family: "DM Sans", sans-serif;
        font-weight: 700;
        text-transform: uppercase;
        color: main.$white !important;
        padding: 8px 18px;

        &:hover {
            opacity: 0.7;
        }

        &.primary {
            background-color: main.$primary-color !important;
        }

        &.secondary {
            background-color: main.$secondary-color !important;
        }
    }

    .home_wrapper {
        display: flex;
        flex-direction: column;
        align-content: center;
        justify-content: center;

        h2 {
            text-align: center;
            font-size: main.$xl-size;
            font-weight: 400;
        }

        .login_wrapper {
            margin-top: main.$vertical-padding;
            display: grid;
            grid-template-columns: 540px 540px;
            grid-template-rows: 540px;
            column-gap: 40px;

            .login_option {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: space-between;
                background-color: main.$background-color;
                padding: main.$container-padding;
                padding-top: 60px;

                img {
                    width: 100px;
                    height: 100px;
                    max-height: none;
                }

                h3 {
                    padding-top: main.$m-size;
                    font-family: "DM Sans", sans-serif;
                    font-size: main.$m-size;
                    text-transform: uppercase;
                    color: main.$primary-color-light;
                }

                p {
                    font-size: main.$l-size;
                }

                a {
                    margin: 0;
                }
            }
        }
    }
}

.logo {
    margin-bottom: 30px;
}

.auth {
    position: relative;
    width: 460px;
    max-width: 100vw;
    border-radius: 4px;
    box-shadow: 3px 4px 20px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    background-color: #fafafa;
    margin: 15vh auto;
}

.menu_option {
    border: 1px solid #eaeaea;
    background-color: #fff;
    margin-bottom: 15px;
    border-radius: 6px;
    padding: 12px;
}

.menu_option h4 {
    font-size: 20px;
}

.menu_option button {
    background-color: #42b983;
    color: #fff;
    font-weight: bold;
    border-radius: 14px;
    padding: 3px 12px;
    font-size: 13px;
    transition-duration: 0.2s;
}
.menu_option button:hover {
    transform: translateX(5px);
}

.backBut {
    font-size: 12px;
    color: #42b983;
}

.options {
    display: flex;
    margin-bottom: 15px;
}
.options div {
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

.options div p {
    color: #333;
}
.options div[active] {
    border-color: #42b983;
    background-color: #42b983;
}
.options div[active] p {
    color: #fff;
}

.options div p:first-child {
    font-size: 30px;
}

.options div p {
    font-size: 16px;
    font-weight: bold;
}

.imgcover {
    text-align: center;
    padding: 12px;
    background-color: #3a403d;
}
img {
    max-height: 40px;
    object-fit: contain;
}
.private_in {
    display: flex;
    align-items: center;
    color: #333;
    background-color: #a5a5a5;
    margin-bottom: 8px;
    padding: 0px 12px;
}

.private_in button {
    font-size: 24px;
    /*padding: 8px 0;*/
    padding-right: 12px;
    /*border-bottom: 1px solid;*/
}
.pkIn {
    padding: 0;
    margin: 0;
}
.pkIn >>> input::placeholder {
    color: #333 !important;
}
.pkIn >>> input {
    color: #333 !important;
    text-align: center;
}
.pkIn >>> .v-input__slot::before {
    display: none;
    border-color: #d2d2d240 !important;
}

.bgdots {
    position: absolute;
    width: 100%;
    /*height: 100%;*/
    min-height: calc(100vh - 80px);
    background-image: url("/img/dots_bg.svg");
    background-repeat: repeat;
    background-size: 20px;
    opacity: 1;
    z-index: 0;
}

p {
    color: #333;
    margin: 4px 0 !important;
}

/*.auth >>> input{*/
/*    text-align: center;*/
/*    color: #ddd !important;*/
/*}*/

.auth_body {
    padding: 30px;
}

.v-text-field >>> input {
    border-color: #d2d2d2 !important;
}

hr {
    margin: 14px auto;
    border-top: none;
    border-color: #d2d2d2;
}

@media only screen and (max-width: 600px) {
    h2 {
        color: #ddd;
    }
    .auth {
        /*height: 100;*/
        /*margin: 0;*/
        border-radius: 0;
        box-shadow: none;
        /*background-color: transparent;*/
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
        /*background-color: transparent;*/
    }

    .auth_body {
        padding: 30px 24px;
    }

    .options {
        /*flex-direction: column;*/
    }

    /*p{*/
    /*    color: #ddd;*/
    /*}*/

    .home {
        .home_wrapper {
            .login_wrapper {
                grid-template-columns: none;
            }
        }
    }
}
</style>
