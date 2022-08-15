<template>
    <Modal ref="modal" :can_close="false" :title="$t('modal.activateWallet.title')">
        <div class="remember_modal">
            <p>{{ $t('modal.activateWallet.desc') }}</p>
            <form @submit.prevent="onsubmit" autocomplete="off">
                <input type="password" placeholder="Password" v-model="password" class="password" />
                <p class="err">{{ err }}</p>
                <v-btn
                    type="submit"
                    :loading="isLoading"
                    depressed
                    class="ava_button button_primary submit"
                >
                    {{ $t('modal.activateWallet.submit') }}
                </v-btn>
                <button @click="cancel" class="cancel_but ava_button_secondary">
                    {{ $t('modal.activateWallet.cancel') }}
                    <br />
                    {{ $t('modal.activateWallet.cancel2') }}
                </button>
            </form>
        </div>
    </Modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Watch } from 'vue-property-decorator'
import Modal from '../Modal.vue'
import { AllKeyFileDecryptedTypes, AllKeyFileTypes } from '@/js/IKeystore'
import { extractKeysFromDecryptedFile, readKeyFile } from '@/js/Keystore'
import { SaveAccountInput } from '@/store/types'
@Component({
    components: { Modal },
})
export default class UpgradeToAccountModal extends Vue {
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
        let fileData: AllKeyFileTypes = JSON.parse(w)
        try {
            let keyFile: AllKeyFileDecryptedTypes = await readKeyFile(fileData, pass)
            this.isLoading = false
            let accessInput = extractKeysFromDecryptedFile(keyFile)
            await this.$store.dispatch('accessWalletMultiple', {
                keys: accessInput,
                activeIndex: keyFile.activeIndex,
            })

            // If they are using an old keystore version upgrade to a new one
            // if (keyFile.version !== KEYSTORE_VERSION) {
            //     let wallets = this.$store.state.wallets as MnemonicWallet[]
            //     let wallet = this.$store.state.activeWallet as
            //         | MnemonicWallet
            //         | SingletonWallet
            //         | null
            //     if (!wallet) throw new Error('No active wallet.')
            //     let activeIndex = wallets.findIndex((w) => w.id == wallet!.id)
            //     let file = await makeKeyfile(wallets, pass, activeIndex)
            //     let fileString = JSON.stringify(file)
            //     localStorage.setItem('w', fileString)
            // }

            // Save the wallets to an account using the same password
            let accountIn: SaveAccountInput = {
                password: pass,
                accountName: 'Account 1',
            }
            await this.$store.dispatch('Accounts/saveAccount', accountIn)

            // Wont be using this anymore
            localStorage.removeItem('w')

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
@use '../../../styles/main';
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
