<template>
    <div>
        <div v-if="accounts.length">
            <hr />
            <h3>{{ $t('access.accounts_found') }}</h3>
            <div
                class="flex_container"
                v-for="(acct, index) in accounts"
                :key="acct.baseAddresses.join('')"
            >
                <Identicon :address="acct.baseAddresses.join('')" diameter="40"></Identicon>
                <router-link
                    class="account_card option button_primary"
                    :to="{ name: 'Account', params: { account: acct, index } }"
                >
                    {{ acct.name }}
                </router-link>
                <fa icon="trash" @click="deleteAccount(acct)"></fa>
            </div>
            <hr />
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { removeAccountByID } from '@/helpers/account_helper'
import { iUserAccountEncrypted } from '@/store/types'
import Identicon from '@/components/misc/Identicon.vue'

@Component({
    components: {
        Identicon,
    },
})
export default class AccountsFound extends Vue {
    accounts: iUserAccountEncrypted[] = []

    created() {
        this.refreshAccounts()
    }
    refreshAccounts() {
        let accountsRaw = localStorage.getItem('accounts') || '{}'
        this.accounts = JSON.parse(accountsRaw) || []
    }
    deleteAccount(acct: iUserAccountEncrypted) {
        let isConfirm = confirm('Are you sure you want to delete this account?')
        if (isConfirm) {
            removeAccountByID(acct.baseAddresses)
            this.refreshAccounts()
        }
    }
}
</script>
<style scoped lang="scss">
@use '../../main';

.flex_container {
    display: flex;
    align-items: center;
    svg {
        &:hover {
            opacity: 0.8;
            box-shadow: 2px 4px 5px rgba(0, 0, 0, 0.2);
        }
    }
}
.account_card {
    margin: 30px auto;
    display: grid;
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
        box-shadow: 4px 8px 10px rgba(0, 0, 0, 0.2);
    }
}

@include main.mobile-device {
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
