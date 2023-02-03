<template>
    <div v-if="!isLedger && wallet" class="userItem">
        <template v-if="account">
            <button class="account_but" @click="openSettings">
                <p>Manage Account</p>
            </button>
            <AccountSettingsModal ref="settings_modal"></AccountSettingsModal>
        </template>
        <template v-else>
            <SaveAccountModal :setAccount="setAccount" ref="save_modal"></SaveAccountModal>
            <button class="warning_button" @click="save">
                <fa icon="exclamation-triangle" class="volatile_alert"></fa>
                {{ $t('keys.save_account.title') }}
            </button>
        </template>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { iUserAccountEncrypted } from '@/store/types'
import Identicon from '@/components/misc/Identicon.vue'
import SaveAccountModal from '@/components/modals/SaveAccount/SaveAccountModal.vue'
import AccountSettingsModal from '@/components/modals/AccountSettings/AccountSettingsModal.vue'
import { WalletType } from '@/js/wallets/types'

@Component({
    components: {
        AccountSettingsModal,
        SaveAccountModal,
        Identicon,
    },
})
export default class AccountUserItem extends Vue {
    @Prop() type: any
    @Prop() setAccount: any

    $refs!: {
        save_modal: SaveAccountModal
        settings_modal: AccountSettingsModal
    }

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
    openSettings() {
        this.$refs.settings_modal.open()
    }

    save() {
        this.$refs.save_modal.open()
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
