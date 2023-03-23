<template>
    <div>
        <label>{{ $t('multisig_alias') }}</label>
        <form @submit.prevent="addAlias">
            <div class="alias_input">
                <button class="fetch_button" @click.prevent="fetchMultisigAliases">
                    <fa icon="search" />
                </button>
                <input
                    class="multisigAliasInput"
                    type="text"
                    v-model="multisigAliasInput"
                    @input="verifyAddresses"
                />
            </div>
            <p class="err">{{ error }}</p>
            <v-btn
                type="submit"
                :loading="isLoading"
                :disabled="!multisigAliasInput || !!error"
                class="addAliasButton button_primary ava_button"
                depressed
                block
            >
                {{ $t('add_multisig_alias') }}
            </v-btn>
        </form>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Component, Vue } from 'vue-property-decorator'
import Spinner from '@/components/misc/Spinner.vue'
import { ava, bintools } from '@/AVA'
import { getMultisigAliases } from '@/explorer_api'

@Component({
    components: {
        Spinner,
    },
})
export default class AddMultisigAlias extends Vue {
    multisigAliasInput: string = ''
    error: string = ''
    isLoading: boolean = false

    addAlias() {
        this.isLoading = true
        this.error = ''

        setTimeout(async () => {
            try {
                const multisigAliases = this.multisigAliasInput
                    .split(',')
                    .map((item: string) => item.trim())
                const multisigWallets = await this.$store.dispatch('addWalletsMultisig', {
                    keys: multisigAliases,
                })
                if (!multisigWallets || multisigWallets.length === 0) {
                    this.error = 'No address intersection with signing wallets found!'
                } else {
                    this.$emit('success', {
                        title: `New multisig wallets added`,
                        message: `Added ${multisigWallets.length} multisig ${
                            multisigWallets.length > 1 ? 'wallets' : 'wallet'
                        } from ${multisigAliases.length} multisig ${
                            multisigAliases.length > 1 ? 'aliases' : 'alias'
                        }`,
                    })
                    this.clear()
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

    async fetchMultisigAliases() {
        this.isLoading = true
        this.error = ''

        try {
            const staticAddresses = this.$store.getters['staticAddresses']('P')
            const multisigAliases = await getMultisigAliases(staticAddresses)
            if (!multisigAliases || multisigAliases.length === 0) {
                this.error = 'No multisig alias found'
            } else {
                multisigAliases.forEach((alias: string, index: number) => {
                    multisigAliases[index] = 'P-' + alias
                })
                this.multisigAliasInput = multisigAliases.join(', ')
                this.verifyAddresses()
            }
        } catch (e) {
            this.error = 'Error fetching multisig alias'
            console.error(e)
        } finally {
            this.isLoading = false
        }
    }

    verifyAddresses() {
        this.error = ''
        const multisigAliases = this.multisigAliasInput
            .split(',')
            .map((item: string) => item.trim())
        try {
            multisigAliases.forEach((alias: string) => {
                const parts = alias.split('-')
                if (parts.length !== 2 || parts[0] !== 'P') {
                    throw new Error('Invalid multisig alias')
                }
                bintools.parseAddress(alias, 'P', ava.getHRP())
            })
        } catch (e) {
            this.error = 'At least one multisig alias is invalid'
        }
    }

    clear() {
        this.isLoading = false
        this.multisigAliasInput = ''
        this.error = ''
    }
}
</script>
<style scoped lang="scss">
label {
    color: #909090;
    font-size: 12px;
}

.multisigAliasInput {
    background-color: transparent;
    border-style: none;
    color: inherit;
    outline: none;
    text-align: center;
    width: 100%;
    margin: 0;
    padding: 0px 12px;
}

.err {
    text-align: center;
    color: var(--error);
}

.addAliasButton {
    margin-top: 14px;
}

.alias_input {
    display: flex;
    align-items: center;
    height: 40px;
    margin-bottom: 8px;
}

.alias_input button {
    font-size: 19px;
    height: 100%;
    padding-right: 12px;
    padding-left: 12px;
    border-style: none;
    border-right: 1px solid #d2d2d2;
    text-align: center;
    opacity: 0.7;
}

.fetch_button {
    height: 100%;
    opacity: 0.8;
}

.fetch_button:hover {
    opacity: 1;
}

.fetch_button[disabled] {
    opacity: 0.8;
    cursor: default;
}
</style>
