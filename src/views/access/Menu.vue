<template>
    <div class="access_card">
        <div class="img_container">
            <img v-if="$root.theme === 'day'" src="@/assets/diamond-primary.svg" alt />
            <img v-else src="@/assets/diamond-primary-night.svg" alt />
        </div>
        <h1>{{ $t('access.title') }}</h1>
        <router-link to="/create" class="link">{{ $t('access.create') }}</router-link>
        <hr />
        <div class="options">
            <router-link to="/access/privatekey" class="option button_primary">
                {{ $t('access.but_private_key') }}
            </router-link>
            <router-link to="/access/mnemonic" class="option button_primary">
                {{ $t('access.but_mnemonic') }}
            </router-link>
            <router-link to="/access/keystore" class="option button_primary">
                {{ $t('access.but_keystore') }}
            </router-link>
            <LedgerButton class="option button_primary"></LedgerButton>
            <!--            <TorusGoogle class="option button_primary" text="Google"></TorusGoogle>-->
        </div>
        <ToS style="margin: 20px !important"></ToS>
        <router-link to="/" class="link">{{ $t('access.cancel') }}</router-link>
    </div>
</template>

<script>
// import TorusGoogle from "@/components/Torus/TorusGoogle";
import LedgerButton from '@/components/Ledger/LedgerButton'
import ToS from '@/components/misc/ToS'

export default {
    components: {
        ToS,
        LedgerButton,
    },
}
</script>

<style scoped lang="scss">
@use "../../main";

.access_card {
    background-color: var(--bg-light) !important;
    padding: main.$container-padding;
}

img {
    width: main.$img-size;
    height: main.$img-size;
    margin-bottom: main.$vertical-padding;
}

h1 {
    font-size: main.$l-size;
    font-weight: 400;
}

hr {
    max-width: 67% !important;
    margin: main.$vertical-padding auto 0;
    color: main.$primary-color-light;
    opacity: 0.2;
}

.options {
    margin: 30px auto;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 30px;
}

.option {
    position: relative;
    transition-duration: 0.1s;
    transition-timing-function: ease-in;
    border-radius: 6px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 700 !important;
    text-transform: uppercase;
    padding: 8px 18px;
    font-size: main.$s-size;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        //transform: translateY(-5px);
        box-shadow: 4px 8px 10px rgba(0, 0, 0, 0.2);
    }

    h2 {
    }
}

@include main.mobile-device {
    img {
        width: main.$img-size-mobile;
        height: main.$img-size-mobile;
        margin-bottom: main.$vertical-padding-mobile;
    }

    h1 {
        font-size: main.$l-size-mobile;
    }

    .card {
        padding: main.$container-padding-mobile;
    }

    .options {
        display: block;
        grid-template-columns: none;
    }

    .option {
        width: 100%;
        margin: 12px 0px;
        display: block;
    }
}
</style>
