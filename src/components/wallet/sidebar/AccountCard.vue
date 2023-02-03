<template>
    <div v-if="!isLedger && wallet" class="userItem">
        <div v-if="account" class="account_but">
            <Identicon :value="account.baseAddresses.join('')" diameter="18"></Identicon>
            <p>{{ account.name }}</p>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { iUserAccountEncrypted } from '@/store/types'
import Identicon from '@/components/misc/Identicon.vue'
import { WalletType } from '@/js/wallets/types'

@Component({
    components: {
        Identicon,
    },
})
export default class AccountCard extends Vue {
    get account(): iUserAccountEncrypted | null {
        return this.$store.getters['Accounts/account']
    }

    get wallet(): WalletType | null {
        return this.$store.state.activeWallet
    }

    get isLedger() {
        let w = this.wallet
        if (!w) return false
        return w.type === 'ledger'
    }
}
</script>
<style scoped lang="scss">
@use '../../../styles/main';
.userItem {
    width: auto;
}
.sidebar_account_menu {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 14px 24px;
    border: 1px solid transparent;
    border-radius: 3px;
    position: relative;
    overflow: hidden;
}
.account_but {
    color: var(--primary-color);
    display: flex;
    flex-direction: row;
    align-items: center;
    text-transform: capitalize;
    width: 100%;
    p {
        text-align: left;
        margin-left: 12px !important;
        width: 80%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &:hover {
        opacity: 0.5;
    }
}

@include main.mobile-device {
    .account_but {
        width: 100% !important;
        p {
            width: 100% !important;
            margin-left: 13px !important;
        }
    }
}

.warning_button {
    text-align: left;
    color: var(--warning);
    width: 100%;
    svg {
        margin-right: 10px;
    }
    &:hover {
        opacity: 0.5;
    }
}

@include main.medium-device {
    .userItem {
        width: 100%;
    }
    .warning_button {
        svg {
            margin-right: 14px;
        }
    }
}
</style>
