<template>
    <div class="addressItem" :selected="is_default">
        <ExportKeys v-if="walletType === 'mnemonic'" :wallets="[wallet]" ref="export_wallet" />
        <MnemonicPhraseModal
            v-if="walletType === 'mnemonic'"
            :phrase="mnemonicPhrase"
            ref="modal"
        />
        <HdDerivationListModal :wallet="wallet" ref="modal_hd" v-if="isHDWallet" />
        <MultisigOwnersModal
            :wallet="wallet"
            ref="modal_multisig"
            v-if="walletType === 'multisig'"
        />
        <PrivateKey
            v-if="walletType === 'singleton'"
            :privateKey="privateKey"
            ref="modal_priv_key"
        />
        <PrivateKey
            v-if="walletType !== 'ledger' && walletType !== 'multisig'"
            :privateKey="privateKeyC"
            :publicKey="publicKeyC"
            ref="modal_priv_key_c"
        />
        <div class="rows">
            <div class="header">
                <v-icon :class="is_default ? 'active' : ''">{{ icon }}</v-icon>
                <div class="header_cols">
                    <div class="detail">
                        <div class="edit-wallet-name-container">
                            <h3 v-show="!isEditable" class="addressVal">
                                {{ walletName }}
                            </h3>
                            <input
                                ref="editNameInput"
                                v-show="isEditable"
                                v-model="customWalletName"
                                class="wallet-name-edit"
                                @keydown.enter.prevent="onClickEdit"
                                @keydown.esc.prevent="onCancel"
                            />
                            <Tooltip :text="$t('keys.edit_wallet_name_tooltip')">
                                <button @click.prevent="onClickEdit">
                                    <fa icon="pen"></fa>
                                </button>
                            </Tooltip>
                        </div>
                        <span class="addressVal">
                            {{ walletTitle }}
                        </span>
                    </div>
                    <div class="buts">
                        <Tooltip :text="$t('keys.tooltip')" v-if="isVolatile">
                            <fa icon="exclamation-triangle" class="volatile_alert"></fa>
                        </Tooltip>
                        <Tooltip
                            v-if="
                                is_default &&
                                walletType !== 'singleton' &&
                                walletType !== 'multisig'
                            "
                            :text="$t('keys.hd_addresses')"
                            class="row_but circle"
                            @click.native="showPastAddresses"
                        >
                            <fa icon="list-ol"></fa>
                        </Tooltip>
                        <Tooltip
                            v-if="walletType === 'singleton' || walletType === 'mnemonic'"
                            :text="$t('keys.export_key')"
                            class="row_but circle"
                            @click.native="showExportModal"
                        >
                            <fa class="fa-regular" icon="upload"></fa>
                        </Tooltip>
                        <div class="text_buts">
                            <button
                                v-if="walletType === 'mnemonic' && is_default"
                                @click="showModal"
                                data-cy="manage-key-mnemonic"
                            >
                                {{ $t('keys.view_key') }}
                            </button>
                            <button
                                v-if="walletType === 'singleton'"
                                @click="showPrivateKeyModal"
                                data-cy="manage-key-singleton"
                            >
                                {{ $t('keys.view_priv_key') }}
                            </button>
                            <button
                                v-if="walletType === 'multisig'"
                                @click="showMultisigOwnerModal"
                                data-cy="manage-key-multisig"
                            >
                                {{ $t('keys.view_multisig_owners') }}
                            </button>
                            <button
                                v-else-if="walletType !== 'ledger'"
                                @click="showPrivateKeyCModal"
                                data-cy="manage-key-private-key-c"
                            >
                                {{ $t('keys.view_static_keys') }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="!is_default" class="text_buts">
                <Tooltip
                    :text="$t('keys.activate_key')"
                    class="row_but circle"
                    :disabled="activating"
                    @click.native="select"
                >
                    <Spinner v-if="activating" class="spinner"></Spinner>
                    <fa v-else icon="star"></fa>
                </Tooltip>
                <Tooltip :text="$t('keys.remove_key')" class="row_but circle">
                    <button @click.prevent="remove">
                        <img
                            src="@/assets/trash_can_dark.svg"
                            style="height: 16px"
                            alt="Trashcan"
                        />
                    </button>
                </Tooltip>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Component, Prop, Vue } from 'vue-property-decorator'

import MnemonicPhraseModal from '@/components/modals/MnemonicPhraseModal.vue'
import HdDerivationListModal from '@/components/modals/HdDerivationList/HdDerivationListModal.vue'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import Tooltip from '@/components/misc/Tooltip.vue'
import Spinner from '@/components/misc/Spinner.vue'

import ExportKeys from '@/components/modals/ExportKeys.vue'
import PrivateKey from '@/components/modals/PrivateKey.vue'
import { WalletNameType, WalletType } from '@/js/wallets/types'
import { SingletonWallet } from '@/js/wallets/SingletonWallet'
import MnemonicPhrase from '@/js/wallets/MnemonicPhrase'
import { privateToPublic } from '@ethereumjs/util'
import MultisigOwnersModal from '@/components/modals/MultisigOwnersModal.vue'
import { MultisigWallet } from '@/js/wallets/MultisigWallet'

@Component({
    components: {
        MnemonicPhraseModal,
        HdDerivationListModal,
        MultisigOwnersModal,
        Spinner,
        Tooltip,
        ExportKeys,
        PrivateKey,
    },
})
export default class KeyRow extends Vue {
    @Prop() wallet!: WalletType
    @Prop({ default: false }) is_default?: boolean

    isEditable = false
    customWalletName = this.walletName
    activating = false

    $refs!: {
        export_wallet: ExportKeys
        modal: MnemonicPhraseModal
        modal_hd: HdDerivationListModal
        modal_priv_key: PrivateKey
        editNameInput: HTMLInputElement
    }

    get allMultisigWalletsOwners() {
        return this.$store.state.wallets
            .filter((wallet: WalletType) => wallet.type === 'multisig')
            .flatMap((wallet: MultisigWallet) => wallet.keyData.owner.addresses)
            .map((address: string) => address.split('-')[1])
    }

    get isVolatile() {
        return this.$store.state.volatileWallets.includes(this.wallet)
    }

    get walletTitle() {
        return this.wallet.getBaseAddress()
    }

    get walletName() {
        return this.wallet.name
    }

    get walletType(): WalletNameType {
        return this.wallet.type
    }
    get isHDWallet() {
        return ['mnemonic', 'ledger'].includes(this.walletType)
    }

    get mnemonicPhrase(): MnemonicPhrase | null {
        if (this.walletType !== 'mnemonic') return null
        let wallet = this.wallet as MnemonicWallet
        return wallet.getMnemonicEncrypted()
    }

    get privateKey(): string | null {
        if (this.walletType !== 'singleton') return null
        let wallet = this.wallet as SingletonWallet
        return wallet.key
    }

    get privateKeyC(): string | null {
        if (this.walletType === 'ledger') return null
        let wallet = this.wallet as SingletonWallet | MnemonicWallet
        return wallet.ethKey
    }

    get publicKeyC(): string | null {
        if (this.walletType === 'ledger') return null
        let wallet = this.wallet as SingletonWallet | MnemonicWallet
        return '04' + privateToPublic(Buffer.from(wallet.ethKey, 'hex')).toString('hex')
    }

    get icon(): string {
        switch (this.walletType) {
            case 'mnemonic':
                return 'mdi-list-box-outline'
            case 'multisig':
                return 'mdi-account-group-outline'
            default:
                return 'mdi-shield-key-outline'
        }
    }

    onClickEdit() {
        this.isEditable = !this.isEditable
        if (!this.isEditable) {
            if (this.customWalletName === '') {
                this.customWalletName = this.walletName
                return
            } else if (this.customWalletName !== this.walletName) {
                this.wallet.name = this.customWalletName
                this.$store.state.volatileWallets.push(this.wallet)
            }
        } else {
            this.customWalletName = this.walletName
            this.$nextTick(() => this.$refs.editNameInput.focus())
        }
    }

    onCancel() {
        this.isEditable = false
        this.customWalletName = this.walletName
    }

    remove() {
        this.$emit('remove', this.wallet)
    }

    select() {
        this.activating = true
        setTimeout(() => this.$emit('select', this.wallet), 100)
    }

    showModal() {
        let modal = this.$refs.modal
        //@ts-ignore
        modal.open()
    }

    showPastAddresses() {
        let modal = this.$refs.modal_hd
        //@ts-ignore
        modal.open()
    }

    showExportModal() {
        //@ts-ignore
        this.$refs.export_wallet.open()
    }

    showPrivateKeyModal() {
        //@ts-ignore
        this.$refs.modal_priv_key.open()
    }

    showPrivateKeyCModal() {
        //@ts-ignore
        this.$refs.modal_priv_key_c.open()
    }

    showMultisigOwnerModal() {
        //@ts-ignore
        this.$refs.modal_multisig.open()
    }
}
</script>
<style scoped lang="scss">
@use '../../../styles/abstracts/mixins';

.addressItem {
    font-size: 12px;
    /*display: grid;*/
    /*grid-template-columns: 1fr max-content;*/
    /*grid-gap: 15px;*/
    overflow: auto;

    > * {
        align-self: center;
        overflow: auto;
    }
}

.key_logo {
    width: 32px;
}

.hdlist {
    grid-column: 1/3;
}

.buts {
    display: flex;
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;

    > * {
        margin: 0px 4px !important;
    }

    .text_buts {
        display: flex;
        flex-direction: column;

        > button {
            text-align: right;
            font-size: 13px;

            &:hover {
                color: var(--secondary-color);
            }
        }
    }
}

.row_but {
    margin: 0 8px;
    font-size: 16px;
}

.row_but.circle {
    $but_w: 32px;

    width: $but_w;
    height: $but_w;
    border-radius: $but_w;
    background-color: rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
    align-self: center;

    &:hover {
        background-color: var(--bg);
    }
}

.rows {
    overflow: auto;
    display: flex;
    flex-direction: row;
}

.addressItem .selBut {
    color: #867e89;
    padding: 4px 8px;

    span {
        font-size: 12px;
        line-height: normal;
    }
}

.spinner {
    margin-left: auto;
    margin-right: auto;
}

.header {
    display: grid;
    grid-template-columns: 32px 1fr;
    grid-gap: 14px;
    width: 100%;
    .img_container {
        height: 100%;
        display: flex;
        align-items: center;
    }
}

.header_cols {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.v-icon.v-icon::after {
    transform: unset;
    --webkit-transform: unset;
}

.v-icon.active {
    color: rgb(216, 69, 69);
}

.detail {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
}

.label {
    font-weight: bold;
}

.addressVal {
    overflow: auto;
    white-space: nowrap;
}

.edit-wallet-name-container {
    display: flex;
    gap: 0.5rem;
}

.wallet-name-edit {
    color: var(--primary-color);
    font-size: 1.17em;
    background-color: var(--bg-wallet-light);
    border-style: none;
    outline: none;
    text-align: center;
    height: 25px;
}

.del {
    align-self: start;
    opacity: 0.4;

    &:hover {
        opacity: 1;
    }
}

.volatile_alert {
    color: var(--warning);
    font-size: 15px;
    margin-left: 6px;
    margin-right: 6px;
}

@include mixins.mobile-device {
    .header_cols {
        display: block;
    }

    .detail {
        text-align: right;
        overflow: auto;
    }

    .bal_cols {
        border-top: 1px solid #ddd;
        padding-top: 12px;
        margin-top: 12px;
    }
}
</style>
