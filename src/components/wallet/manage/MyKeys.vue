<template>
    <div class="my_keys">
        <p class="label">{{ $t('keys.active_wallet') }}</p>
        <key-row
            v-if="activeWallet"
            :wallet="activeWallet"
            class="key_row"
            :is_default="true"
        ></key-row>
        <hr v-if="inactiveWallets.length > 0" />
        <p class="label" v-if="inactiveWallets.length > 0 || multiSigAliases.length > 0">
            {{ $t('keys.other_keys') }}
        </p>
        <div v-if="multiSigAliases.length > 0 && !imported" class="container">
            <p class="aliases--header">
                {{ $t('keys.multisig_aliases', { '0': multiSigAliases.length }) }}
            </p>
            <p class="">{{ error }}</p>
            <div class="aliases__content">
                <p>{{ $t('keys.import_wallets') }}</p>
                <div class="aliases__content--buttons">
                    <button
                        @click="dismiss"
                        class="addAliasButton button_primary ava_button_secondary"
                    >
                        {{ $t('keys.button5') }}
                    </button>
                    <button
                        @click="addAlias"
                        :loading="isLoading"
                        class="button_secondary ava_button addAliasButton"
                        depressed
                        block
                    >
                        {{ $t('keys.button4') }}
                    </button>
                </div>
            </div>
        </div>
        <transition-group name="fade">
            <key-row
                v-for="wallet in inactiveWallets"
                :wallet="wallet"
                :key="wallet.id"
                class="key_row"
                @select="selectWallet"
                @remove="removeWallet(wallet)"
            ></key-row>
        </transition-group>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Watch } from 'vue-property-decorator'

import KeyRow from '@/components/wallet/manage/KeyRow.vue'
import RememberKey from '@/components/misc/RememberKey.vue'
import { WalletType } from '@/js/wallets/types'
import { bintools } from '@/AVA'
import { MultisigWallet } from '@/js/wallets/MultisigWallet'

@Component({
    components: {
        KeyRow,
        RememberKey,
    },
})
export default class MyKeys extends Vue {
    error: string = ''
    isLoading: boolean = false
    imported: boolean = false
    selectWallet(wallet: WalletType) {
        this.$store.dispatch('activateWallet', wallet)
    }

    get account() {
        return this.$store.getters['Accounts/account']
    }
    beforeMount() {
        for (const alias of this.multiSigAliases as string[]) {
            const aliasBuffer = bintools.stringToAddress(`P-${alias}`)
            for (const wallet of this.$store.state.wallets) {
                if (wallet.type === 'multisig') {
                    if ((wallet as MultisigWallet).alias().compare(aliasBuffer) === 0) {
                        this.imported = true
                    }
                }
            }
        }
    }
    async removeWallet(wallet: WalletType) {
        let msg = this.$t('keys.del_check') as string
        let isConfirm = confirm(msg)

        if (isConfirm) {
            await this.$store.dispatch('removeWallet', wallet)
            let { dispatchNotification } = this.globalHelper()
            dispatchNotification({
                message: this.$t('notifications.keys_remove_success'),
                type: 'success',
            })
        }
    }
    dismiss() {
        this.$store.dispatch('fetchMultiSigAliases', { disable: true })
    }
    addAlias() {
        this.isLoading = true
        this.error = ''

        setTimeout(async () => {
            try {
                const multisigAliases = this.multiSigAliases.map(
                    (alias: string): string => 'P-' + alias
                )
                const multisigWallets = await this.$store.dispatch('addWalletsMultisig', {
                    keys: multisigAliases,
                })
                if (!multisigWallets || multisigWallets.length === 0) {
                    this.error = 'No address intersection with signing wallets found!'
                } else {
                    let { dispatchNotification } = this.globalHelper()
                    dispatchNotification({
                        message: `Added ${multisigWallets.length} multisig ${
                            multisigWallets.length > 1 ? 'wallets' : 'wallet'
                        } from ${multisigAliases.length} multisig ${
                            multisigAliases.length > 1 ? 'aliases' : 'alias'
                        }`,
                        type: 'success',
                    })
                    this.imported = true
                    this.error = ''
                }
            } catch (e: any) {
                if (e.message.includes('already')) {
                    this.error = this.$t('keys.import_key_duplicate_err') as string
                } else {
                    this.error = this.$t('keys.import_key_err') as string
                }
                console.error(e)
            } finally {
                this.isLoading = false
            }
        }, 200)
    }
    get inactiveWallets(): WalletType[] {
        let wallets = this.wallets

        let res = wallets.filter((wallet) => {
            if (this.activeWallet === wallet) return false
            return true
        })

        return res
    }

    get wallets(): WalletType[] {
        return this.$store.state.wallets
    }

    get activeWallet(): WalletType {
        return this.$store.state.activeWallet
    }
    @Watch('wallets.length')
    async onWalletsChange() {
        if (this.wallets.length > 1)
            await this.$store.dispatch('fetchMultiSigAliases', { disable: false })
    }
    get multiSigAliases(): string[] {
        return this.$store.getters.multiSigAliases
    }
}
</script>

<style scoped lang="scss">
.container {
    background-color: var(--bg-light);
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 10px;
    transition-duration: 0.2s;
    display: flex;
    flex-direction: column;
    font-size: 14px;
    font-weight: 700;
    gap: 4px;
    .aliases__content {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex-wrap: wrap;
        &--buttons {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            flex-wrap: wrap;
        }
    }
}
.addAliasButton {
    padding: 7px 15px;
    font-size: 14px;
    margin-top: 10px;
}
hr {
    border-top: 1px solid var(--bg-light);
    border-left: 1px solid var(--bg-light);
    border-right: 1px solid var(--bg-light);
    border-color: var(--bg-light) !important;
    margin: 12px 0;
}
.label {
    font-size: 13px;
    color: #999;
    font-weight: bold;
    padding: 2px 10px;
}
.key_row {
    background-color: var(--bg-light);
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 10px;
    transition-duration: 0.2s;
}

.my_keys {
    padding-top: 15px;
}

.volatile_cont {
    max-width: 380px;
    /*border-top: 1px solid #eee;*/
    margin-top: 20px;
    padding-top: 20px;
    /*display: grid;*/
    /*grid-template-columns: 1fr 1fr;*/
}

.alert_box {
    /*margin: 0px 25px;*/
    font-size: 0.9rem;
}
</style>
<style lang="scss">
.volatile_cont {
    .v-expansion-panel {
        background-color: transparent !important;
    }

    .passwords input {
        background-color: #d2e9fd;
    }

    .v-expansion-panel-header,
    .v-expansion-panel-content__wrap {
        padding: 8px 0;
    }
}
</style>
