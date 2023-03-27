<template>
    <div class="home">
        <svg
            class="blur"
            width="1019"
            height="621"
            viewBox="0 0 1019 621"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g filter="url(#filter0_f_2551_2336)">
                <ellipse cx="509.5" cy="310.5" rx="369.5" ry="170.5" fill="none" />
            </g>
            <defs>
                <filter
                    id="filter0_f_2551_2336"
                    x="0"
                    y="0"
                    width="1019"
                    height="621"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                    />
                    <feGaussianBlur stdDeviation="70" result="effect1_foregroundBlur_2551_2336" />
                </filter>
            </defs>
        </svg>
        <!-- <img class="blur" src="@/assets/ellipse.svg/" alt /> -->
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
                    <div
                        @click="click('/access')"
                        data-cy="access"
                        class="ava_button button_primary submit_but"
                    >
                        {{ $t('home.access.submit') }}
                    </div>
                </div>
                <div>
                    <div
                        data-cy="create"
                        @click="click('/create')"
                        class="ava_button button_secondary submit_but"
                    >
                        {{ $t('home.create.submit') }}
                    </div>
                </div>
            </div>
            <ToS
                class="tos"
                :navigate="navigate"
                style="align-self: center; margin: 30px !important"
            ></ToS>
        </div>
    </div>
</template>

<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import ToS from '@/components/misc/ToS.vue'
@Component({
    name: 'home',
    components: { ToS },
})
export default class Home extends Vue {
    @Prop() navigate: any
    click(string: string) {
        this.navigate(string)
    }
}
</script>

<style scoped lang="scss">
@use '../styles/abstracts/variables';
@use '../styles/abstracts/mixins';
@use '../styles/main';

.home {
    display: flex;
    justify-content: center;
    min-height: calc(100vh - 89px);
    background-image: url('../assets/home_background.svg');
    background-size: cover;
    background-position: center;
    align-items: center;
    background-repeat: no-repeat;
    overflow: hidden;
    svg {
        g {
            ellipse {
                fill: var(--bg);
            }
        }
    }
    .blur {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    &--wrapper {
        z-index: 1;
        margin-top: 100px;
        display: flex;
        flex-direction: column;
        gap: 30px;
        align-items: center;
        .header {
            font-size: main.$l-size;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 15px;
            font-family: 'ClashDisplay';
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
                color: var(--primary-color-light);
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
@include mixins.mobile-device {
    .home {
        svg {
            width: 100%;
        }
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
