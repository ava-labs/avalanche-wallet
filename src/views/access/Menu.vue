<template>
    <div class="access_card">
        <h1>{{ $t('access.title') }}</h1>
        <router-link to="/create" class="link">{{ $t('access.create') }}</router-link>
        <div class="menus">
            <AccountsFound></AccountsFound>
            <div class="options">
                <router-link to="/access/privatekey" class="menu_option button_primary">
                    {{ $t('access.but_private_key') }}
                </router-link>
                <router-link to="/access/mnemonic" class="menu_option button_primary">
                    {{ $t('access.but_mnemonic') }}
                </router-link>
                <router-link to="/access/keystore" class="menu_option button_primary">
                    {{ $t('access.but_keystore') }}
                </router-link>
                <LedgerButton class="menu_option button_primary"></LedgerButton>
                <!--            <TorusGoogle class="option button_primary" text="Google"></TorusGoogle>-->
            </div>
        </div>

        <ToS style="margin: 20px !important"></ToS>
        <router-link to="/" class="link">{{ $t('access.cancel') }}</router-link>
    </div>
</template>

<script lang="ts">
// import TorusGoogle from "@/components/Torus/TorusGoogle";
import { Vue, Component } from 'vue-property-decorator'
import LedgerButton from '@/components/Ledger/LedgerButton.vue'
import AccountsFound from '@/components/Access/AccountsFound.vue'
import ToS from '@/components/misc/ToS.vue'

@Component({
    components: {
        ToS,
        LedgerButton,
        AccountsFound,
    },
})
export default class Menu extends Vue {}
</script>

<style scoped lang="scss">
@use "../../main";
@use '/src/components/Access/menu';

.access_card {
    //background-color: var(--bg-light) !important;
    //padding: main.$container-padding;
    margin: 0px auto;
    display: flex;
    flex-direction: column;
    align-items: center;
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
    display: flex;
    flex-direction: column;
    margin-top: 30px;
    //display: grid;
    //grid-template-columns: repeat(4, 1fr);
    //grid-gap: 30px;
}

.menus {
    width: 440px;
    max-width: 100%;
    margin-top: 1em;
}

//.option {
//    position: relative;
//    transition-duration: 0.1s;
//    transition-timing-function: ease-in;
//    border-radius: 6px;
//    font-family: 'DM Sans', sans-serif;
//    font-weight: 700 !important;
//    text-transform: uppercase;
//    font-size: main.$s-size;
//    display: flex;
//    align-items: center;
//    //justify-content: center;
//    padding: 12px;
//    margin: 2px 0;
//
//    background-color: var(--bg-light) !important;
//    color: var(--primary-color) !important;
//
//    &:hover {
//        box-shadow: 4px 8px 10px rgba(0, 0, 0, 0.2);
//    }
//}

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

    //.option {
    //    width: 100%;
    //    margin: 12px 0px;
    //    display: block;
    //}
}
</style>
