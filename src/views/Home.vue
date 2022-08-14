<template>
    <div class="home">
        <img class="blur" v-if="$root.theme === 'night'" src="@/assets/ellipse.svg/" alt />
        <div class="home--wrapper">
            <div class="header">
                <img src="@/assets/wallet-logo.svg" alt />
                <div class="header--title">
                    {{ $t('home.header') }}
                </div>
            </div>
            <div class="content">
                <h1 class="content--desc">{{ $t('home.desc') }}</h1>
                <div class="content--access-create">{{ $t('home.access_create') }}</div>
            </div>
            <div class="buttons-wrapper">
                <div>
                    <router-link
                        data-cy="access"
                        to="/access"
                        class="ava_button button_primary submit_but"
                    >
                        {{ $t('home.access.submit') }}
                    </router-link>
                </div>
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
            <ToS class="tos" style="align-self: center; margin: 30px !important"></ToS>
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
@use "../main";
.home {
    padding-top: 100px;
    display: flex;
    justify-content: center;
    min-height: calc(100vh - 80px);
    background-image: url('../assets/home_background.svg');
    background-size: cover;
    background-position: center;
    align-items: center;
    background-repeat: no-repeat;
    overflow: hidden;
    .blur {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
    &--wrapper {
        z-index: 50;
        margin-top: 100px;
        display: flex;
        flex-direction: column;
        margin-top: 100px;
        gap: 30px;
        align-items: center;
        .header {
            font-size: main.$l-size;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .content {
            max-width: 700px;
            text-align: center;
            &--desc {
                margin-bottom: 30px;
                font-size: main.$xl-size;
            }
            &--access-create {
                margin-bottom: 30px;
                font-size: main.$m-size;
                color: #cbd5e1;
            }
        }
    }
    .buttons-wrapper {
        display: flex;
        justify-content: center;
        gap: 30px;
        flex-wrap: wrap;
        align-items: center;
    }
}
.tos {
    margin-top: 14px !important;
    text-align: center;
}

.submit_but {
    width: max-content;
}
/* ==========================================
   Nav
   ========================================== */

@include main.mobile-device {
    .home {
        .header {
            &--title {
                font-size: main.$l-size-mobile;
            }
        }
        .content {
            &--desc {
                font-size: main.$xl-size-mobile;
            }
            &--access-create {
                font-size: main.$m-size-mobile;
            }
        }
    }
}

@media only screen and (max-width: 600px) {
}
</style>
