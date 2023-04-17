<template>
    <div v-if="!isLedger && wallet" style="width: 100%">
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
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import KycModal from '@/components/modals/KycModal.vue'
import { WalletType } from '@/js/wallets/types'
@Component({
    components: {
        KycModal,
    },
})
export default class AccountKycItem extends Vue {
    $refs!: {
        kyc_modal: KycModal
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

    openKyc() {
        this.$refs.kyc_modal.open()
    }
}
</script>
<style scoped lang="scss">
@use '../../../styles/main';

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
    // max-width: 163px;
    width: '100%';
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
    color: var(--success);
    pointer-events: none;
    display: inline-flex;
    align-items: center;
    width: 100%;
    justify-content: center;
    .v-icon {
        color: var(--success);
        margin-right: 10px;
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
    .success_button {
        .v-icon {
            font-size: 20px;
            padding-right: 4px;
        }
    }
}
</style>
