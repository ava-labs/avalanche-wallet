<template>
    <div class="access_card">
        <h1>{{ $t('access.title') }}</h1>
        <div @click="click('/create')" class="link">{{ $t('access.create') }}</div>
        <div class="menus">
            <AccountsFound class="accounts_menu"></AccountsFound>
            <div class="options">
                <div @click="click('/access/privatekey')" class="menu_option button_primary">
                    {{ $t('access.but_private_key') }}
                    <v-icon>mdi-shield-key-outline</v-icon>
                </div>
                <div @click="click('/access/mnemonic')" class="menu_option button_primary">
                    {{ $t('access.but_mnemonic') }}
                    <v-icon>mdi-list-box-outline</v-icon>
                </div>
                <div @click="click('/access/keystore')" class="menu_option button_primary">
                    {{ $t('access.but_keystore') }}
                    <v-icon>mdi-file-key-outline</v-icon>
                </div>
                <LedgerButton class="menu_option button_primary" disabled></LedgerButton>
            </div>
        </div>

        <ToS :navigate="navigate" style="margin: 20px !important"></ToS>
        <div @click="click('/login')" class="link">{{ $t('access.cancel') }}</div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import LedgerButton from '@/components/Ledger/LedgerButton.vue'
import AccountsFound from '@/components/Access/AccountsFound.vue'
import ToS from '@/components/misc/ToS.vue'
import ImageDayNight from '@/components/misc/ImageDayNight.vue'

@Component({
    components: {
        ImageDayNight,
        ToS,
        LedgerButton,
        AccountsFound,
    },
})
export default class Menu extends Vue {
    @Prop() navigate: any
    click(string: string) {
        this.navigate(string)
    }
}
</script>

<style scoped lang="scss">
@use '../../styles/main';
@use '/src/components/Access/menu';

.access_card {
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

.accounts_menu {
    margin-bottom: 30px;
    display: flex;
    flex-direction: column;
}

.options {
    display: flex;
    flex-direction: column;
}

.menu_option {
    justify-content: space-between;
    align-items: center;
    img {
        width: 24px;
        height: 24px;
        margin: 0;
        object-fit: contain;
    }
}

.v-icon {
    color: var(--icon-color-light);
}

.menus {
    width: 440px;
    margin-top: 1em;
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

    .menus {
        width: 100%;
    }
}

@media only screen and (max-width: main.$mobile_width) {
    .access_card {
        padding: main.$container-padding-mobile;
    }
}
</style>
