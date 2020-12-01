<template>
    <Modal
        ref="modal"
        :can_close="false"
        :title="$t('modal.activateWallet.title')"
    >
        <div class="remember_modal">
            <p>{{ $t('modal.activateWallet.desc') }}</p>
            <form @submit.prevent="onsubmit" autocomplete="off">
                <input
                    type="password"
                    placeholder="Password"
                    v-model="password"
                    class="password"
                />
                <p class="err">{{ err }}</p>
                <v-btn
                    type="submit"
                    :loading="isLoading"
                    depressed
                    color="#4C2E56"
                    class="ava_button button_primary submit"
                    >{{ $t('modal.activateWallet.submit') }}</v-btn
                >
                <button @click="cancel" class="cancel_but ava_button_secondary">
                    {{ $t('modal.activateWallet.cancel') }}<br />{{
                        $t('modal.activateWallet.cancel2')
                    }}
                </button>
            </form>
        </div>
    </Modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

import Modal from '../Modal.vue'
import { KeyFile } from '@/js/IKeystore'
import { readKeyFile } from '@/js/Keystore'
import { avm } from '@/AVA'
import { keyToKeypair } from '@/helpers/helper'
import * as bip39 from 'bip39'
@Component({
    components: { Modal },
})
export default class RememberWalletModal extends Vue {
    password: string = ''
    isLoading: boolean = false
    err: string = ''
    mounted() {
        this.openIfValid()
    }

    @Watch('$store.state.isAuth')
    onauthchange(val: boolean) {
        if (!val) {
            this.openIfValid()
        }
    }

    openIfValid() {
        let w = localStorage.getItem('w')
        if (w) {
            this.open()
        }
    }

    async onsubmit() {
        this.isLoading = true
        this.err = ''
        let w = localStorage.getItem('w')
        if (!w) return

        let pass = this.password
        let fileData: KeyFile = JSON.parse(w)
        let version = fileData.version

        try {
            let rawData = await readKeyFile(fileData, pass)
            let keys = rawData.keys
            this.isLoading = false
            let chainID = avm.getBlockchainAlias()

            let mnemonics: string[]
            // Convert old version private keys to mnemonic phrases
            if (['2.0', '3.0', '4.0'].includes(version)) {
                mnemonics = keys.map((key) => {
                    // Private keys from the keystore file do not have the PrivateKey- prefix
                    let pk = 'PrivateKey-' + key.key
                    let keypair = keyToKeypair(pk, chainID)

                    let keyBuf = keypair.getPrivateKey()
                    let keyHex: string = keyBuf.toString('hex')
                    let paddedKeyHex = keyHex.padStart(64, '0')
                    let mnemonic: string = bip39.entropyToMnemonic(paddedKeyHex)

                    return mnemonic
                })
            } else {
                // New versions encrypt the mnemonic so we dont have to do anything
                mnemonics = keys.map((key) => key.key)
            }

            await this.$store.dispatch('accessWalletMultiple', mnemonics)

            // These are not volatile wallets since they are loaded from storage
            this.$store.state.volatileWallets = []
            this.password = ''
            this.close()
        } catch (e) {
            this.isLoading = false
            if (e === 'INVALID_PASS') {
                this.err = this.$t('modal.activateWallet.err1') as string
            } else {
                this.err = this.$t('modal.activateWallet.err2') as string
            }
            return
        }
    }

    cancel() {
        localStorage.removeItem('w')
        this.close()
    }

    close() {
        //@ts-ignore
        this.$refs.modal.close()
    }

    open() {
        //@ts-ignore
        this.$refs.modal.open()
    }
}
</script>
<style scoped lang="scss">
@use '../../../main';

.remember_modal {
    padding: 30px;
}

form {
    display: flex;
    flex-direction: column;

    > * {
        margin: 6px 0px;
    }
}

.cancel_but {
    color: var(--primary-color-light);
    font-size: 0.8rem !important;
    text-transform: none !important;
}

.password {
    background-color: var(--bg-light);
    color: var(--primary-color);
    padding: 6px 14px;
}

.submit {
    margin-top: 30px;
}

.err {
    color: var(--error);
}
</style>
