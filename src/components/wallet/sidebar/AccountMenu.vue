<template>
    <div v-if="!isLedger && wallet">
        <template v-if="kycStatus">
            <button class="success_button">
                <v-icon>mdi-check-decagram</v-icon>
                {{ $t('kyc_process.kyc_verified') }}
            </button>
        </template>
        <template v-else>
            <KycModal ref="kyc_modal"></KycModal>
            <button class="sidebar_button button_secondary" @click="openKyc">
                <v-icon color="#fff">mdi-check-decagram</v-icon>
                {{ $t('kyc_process.verify_kyc') }}
            </button>
        </template>
        <hr />
        <template v-if="account">
            <button class="account_but" @click="openSettings">
                <Identicon :value="account.baseAddresses.join('')" diameter="18"></Identicon>
                <p>{{ account.name }}</p>
            </button>
            <AccountSettingsModal ref="settings_modal"></AccountSettingsModal>
        </template>
        <template v-else>
            <SaveAccountModal ref="save_modal"></SaveAccountModal>
            <button class="warning_button" @click="save">
                <fa icon="exclamation-triangle" class="volatile_alert"></fa>
                {{ $t('keys.save_account.title') }}
            </button>
        </template>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { iUserAccountEncrypted } from '@/store/types'
import Identicon from '@/components/misc/Identicon.vue'
import SaveAccountModal from '@/components/modals/SaveAccount/SaveAccountModal.vue'
import AccountSettingsModal from '@/components/modals/AccountSettings/AccountSettingsModal.vue'
import { WalletType } from '@/js/wallets/types'
import KycModal from '@/components/modals/KycModal.vue'

@Component({
    components: {
        KycModal,
        AccountSettingsModal,
        SaveAccountModal,
        Identicon,
    },
})
export default class AccountMenu extends Vue {
    $refs!: {
        save_modal: SaveAccountModal
        settings_modal: AccountSettingsModal
        kyc_modal: KycModal
    }

    get account(): iUserAccountEncrypted | null {
        return this.$store.getters['Accounts/account']
    }

    get kycStatus(): boolean {
        return this.$store.getters['Accounts/kycStatus']
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

    openKyc() {
        this.$refs.kyc_modal.open()
    }
}
</script>
<style scoped lang="scss">
@use '../../../styles/main';
.sidebar_account_menu {
    display: flex;
    flex-direction: row;
    align-items: center;
    // padding: 4px 12px;
    padding: 14px 24px;
    border: 1px solid transparent;
    border-radius: 3px;
    position: relative;
    overflow: hidden;
}
.account_but {
    //padding: 4px 8px;
    //border-radius: 4px;
    //background-color: var(--bg-light);
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

.sidebar_button {
    width: max-content;
    border-radius: var(--border-radius-sm);
    height: 40px;
    text-align: center;
    padding: 10px 20px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    width: 100%;
    justify-content: center;
    max-width: 163px;
}

hr {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    // color: var(--primary-border-color);
    border: none;
    border-top: var(--secondary-border);
}

.warning_button {
    text-align: left;
    color: var(--warning);
    svg {
        margin-right: 10px;
    }
    &:hover {
        opacity: 0.5;
    }
}

.success_button {
    text-align: left;
    color: var(--success);
    pointer-events: none;
    .v-icon {
        color: var(--success);
        margin-right: 4px;
    }
}

@include main.medium-device {
    .warning_button {
        svg {
            margin-right: 14px;
        }
    }
}
@include main.mobile-device {
    hr {
        border-color: var(--sidebar-links);
        opacity: 0.2;
    }
    .success_button {
        .v-icon {
            font-size: 20px;
            padding-right: 4px;
        }
    }
}
</style>
