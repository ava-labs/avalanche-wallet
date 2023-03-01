<template>
    <div style="width: 100%">
        <v-btn
            v-if="multisigAliases.length > 0"
            @click="openModal"
            class="button_secondary sidebar_button"
            small
            depressed
        >
            Choose alias
        </v-btn>
        <Modal ref="modal" title="Alias picker">
            <v-radio-group v-model="defaultAlias" @change="saveDefaultAddress">
                <div class="assets">
                    <span v-if="!account" class="label">
                        <fa icon="exclamation-triangle"></fa>
                        You need to save account in order to set Default value
                    </span>
                    <div class="row panel_nav">
                        <div class="address_info_container">
                            <h3 class="label">Personal</h3>
                            <span class="label">{{ 'P-' + personalAddress }}</span>
                        </div>
                        <v-radio
                            :disabled="!account"
                            :value="personalAddress"
                            class="default_radio_button"
                        >
                            <span slot="label" class="label">Default</span>
                        </v-radio>
                        <v-btn
                            @click="chooseAlias(personalAddress)"
                            :disabled="defaultAlias === personalAddress"
                            class="button_primary"
                            small
                            depressed
                        >
                            Activate
                        </v-btn>
                    </div>
                    <div
                        class="row panel_nav"
                        v-for="(multisigAlias, index) in multisigAliases"
                        :key="index"
                    >
                        <div class="address_info_container">
                            <h3 class="label">Multisig alias {{ index + 1 }}</h3>
                            <span class="label">{{ 'P-' + multisigAlias }}</span>
                        </div>
                        <v-radio
                            :disabled="!account"
                            :value="multisigAlias"
                            class="default_radio_button"
                        >
                            <span slot="label" class="label">Default</span>
                        </v-radio>
                        <v-btn
                            @click="chooseAlias(multisigAlias)"
                            :disabled="defaultAlias === multisigAlias"
                            class="button_primary"
                            small
                            depressed
                        >
                            Activate
                        </v-btn>
                    </div>
                </div>
            </v-radio-group>
        </Modal>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import Modal from '@/components/modals/Modal.vue'
import { overwriteAccountAtIndex } from '@/helpers/account_helper'
import { iUserAccountEncrypted } from '@/store/types'

@Component({
    components: { Modal },
})
export default class AliasPicker extends Vue {
    @Prop() updateAlias: any
    @Prop() selectedAlias?: string
    defaultAlias?: string = ''
    $refs!: {
        modal: Modal
    }

    created() {
        this.defaultAlias = this.account?.defaultAddress || this.selectedAlias
        if (!this.defaultAlias) {
            this.updateAlias(this.personalAddress)
            this.defaultAlias = this.personalAddress
        } else if (this.defaultAlias && this.account?.defaultAddress && !this.selectedAlias)
            this.chooseAlias(this.defaultAlias)
    }
    openModal() {
        this.$refs.modal.open()
    }

    saveDefaultAddress() {
        console.log('saveDefaultAddress', this.defaultAlias)
        const account = this.account
        if (!account) return
        overwriteAccountAtIndex(
            { ...account, defaultAddress: this.defaultAlias },
            this.accountIndex
        )
    }

    get account(): iUserAccountEncrypted | null {
        return this.$store.getters['Accounts/account']
    }

    get accountIndex(): number {
        return this.$store.state.accounts.indexOf(this.account)
    }

    chooseAlias(alias: string) {
        if (alias !== this.defaultAlias) {
            this.$store.state.activeWallet.selectedAlias = 'P-' + alias
            this.updateAlias(alias)
            this.defaultAlias = alias
        } else {
            this.$store.state.activeWallet.selectedAlias = undefined
        }
        this.$store.dispatch('Assets/updateUTXOs')
        this.$store.dispatch('History/updateTransactionHistory')
    }

    get multisigAliases(): string[] {
        return this.$store.getters['Accounts/multisigAliases']
    }

    get personalAddress(): string {
        return this.$store.state.activeWallet.getCurrentAddressAvm().split('-')[1]
    }
}
</script>
<style scoped lang="scss">
@use '../../../styles/main';
@import '../../../styles/main';

.assets {
    padding: 0 1.5rem;
    gap: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

.row {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    justify-self: center;
    @include component-wrapper;
    background-color: var(--bg-wallet-light);
    font-size: 14px;

    > * {
        outline: none !important;
        padding: 4px 8px;
        border-radius: var(--border-radius-sm);
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
    min-height: 40px;
}

.label {
    color: var(--primary-contrast-text);
}

.default_radio_button {
    margin: 0 !important;
}

.address_info_container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-right: auto;
}
</style>
