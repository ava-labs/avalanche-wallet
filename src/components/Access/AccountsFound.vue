<template>
    <div v-if="accounts.length" class="accounts">
        <span class="savedAccounts">Saved Camino Wallets</span>
        <div
            class="flex_container menu_option"
            v-for="(acct, i) in accounts"
            :key="i"
            @click="selectAccount(i)"
        >
            <Identicon :value="acct.name" diameter="40"></Identicon>
            <p>{{ acct.name }}</p>
            <v-icon class="goTo">mdi-chevron-right</v-icon>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { iUserAccountEncrypted } from '@/store/types'
import Identicon from '@/components/misc/Identicon.vue'

@Component({
    components: {
        Identicon,
    },
})
export default class AccountsFound extends Vue {
    @Prop() navigate: any

    accounts: iUserAccountEncrypted[] = []

    created() {
        this.refreshAccounts()
    }
    refreshAccounts() {
        let accountsRaw = localStorage.getItem('accounts') || '{}'
        this.accounts = JSON.parse(accountsRaw) || []
    }

    selectAccount(index: number) {
        this.navigate(`/access/account/${index}`)
    }
}
</script>
<style scoped lang="scss">
@use '../../styles/main';
@use '../../styles/abstracts/variables';
@use './menu';

.accounts {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.account {
    background-color: var(--bg-light);
    padding: 12px;
    margin: 2px 0;
    cursor: pointer;
    p {
        flex-grow: 1;
        text-align: left;
        padding: 0 1em;
    }

    &:hover {
        opacity: 0.6;
    }
}

.savedAccounts {
    margin: 0;
    font-family: ClashDisplay;
    font-weight: 500;
    line-height: 1.5;
    font-size: 1rem;
    margin-bottom: 0.5rem;
}

.v-icon {
    color: var(--primary-color);
    width: 20px;
    height: 20px;
    font-size: 22px;
}

.goTo {
    margin-left: auto;
}

.access_card {
    background-color: var(--bg-light) !important;
    padding: main.$container-padding;
}
h3 {
    margin-top: 1rem;
}

.options {
    margin: 30px auto;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 30px;
}

@include main.mobile-device {
    .card {
        padding: main.$container-padding-mobile;
    }

    .options {
        display: block;
        grid-template-columns: none;
    }
}
@media only screen and (max-width: variables.$mobile_width) {
    .access_card {
        padding: main.$container-padding-mobile;
    }
}
</style>
