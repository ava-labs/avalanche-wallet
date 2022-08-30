<template>
    <div class="home">
        <div class="container">
            <div class="row">
                <div class="col">
                    <div class="home_wrapper">
                        <h1>{{ $t('home.desc') }}</h1>
                        <div class="login_wrapper">
                            <div class="login_option">
                                <header>
                                    <div class="img_container">
                                        <img
                                            v-if="$root.theme === 'day'"
                                            src="@/assets/diamond-primary.svg"
                                            alt
                                        />
                                        <img v-else src="@/assets/diamond-primary-night.svg" alt />
                                    </div>
                                    <h2>{{ $t('home.access.title') }}</h2>
                                    <p>{{ $t('home.access.desc') }}</p>
                                </header>
                                <div>
                                    <router-link
                                        data-cy="access"
                                        to="/access"
                                        class="ava_button button_primary submit_but"
                                    >
                                        {{ $t('home.access.submit') }}
                                    </router-link>
                                </div>
                            </div>
                            <div class="login_option">
                                <header>
                                    <div class="img_container">
                                        <img
                                            v-if="$root.theme === 'day'"
                                            src="@/assets/diamond-secondary.png"
                                            alt
                                        />
                                        <img
                                            v-else
                                            src="@/assets/diamond-secondary-night.svg"
                                            alt
                                        />
                                    </div>
                                    <h2>{{ $t('home.create.title') }}</h2>
                                    <p>{{ $t('home.create.desc') }}</p>
                                </header>
                                <div>
                                    <router-link
                                        data-cy="create"
                                        to="/create"
                                        class="ava_button button_secondary submit_but"
                                    >
                                        {{ $t('home.create.submit') }}
                                    </router-link>
                                </div>
                            </div>
                        </div>
                        <ToS class="tos" style="align-self: center; margin: 30px !important"></ToS>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import 'reflect-metadata'
import { Vue, Component } from 'vue-property-decorator'
import ToS from '@/components/misc/ToS.vue'

@Component({
    name: 'home',
    components: { ToS },
})
export default class Home extends Vue {}
</script>

<style scoped lang="scss">
@use "../styles/main";

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
            font-size: 22px;
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
                border-radius: 1rem;
                align-items: flex-start;
                justify-content: space-between;
                background-color: var(--bg-light);
                padding: 60px 90px main.$container-padding main.$container-padding;

                header {
                    margin-bottom: 60px;

                    img {
                        width: 89px;
                        height: 89px;
                        max-height: none;
                    }

                    h2 {
                        padding-top: main.$s-size;
                        font-family: 'DM Sans', sans-serif;
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

.tos {
    margin-top: 14px !important;
}

.submit_but {
    width: max-content;
}
/* ==========================================
   Nav
   ========================================== */

@include main.night-mode {
}
.logo {
    margin-bottom: 30px;
}

img {
    max-height: 50px;
    object-fit: contain;
}

@include main.medium-device {
    .login_option {
        padding: 30px 40px !important;
        p {
            font-size: 1.4rem !important;
        }
    }
}

@include main.mobile-device {
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

@media only screen and (max-width: 600px) {
}
</style>
