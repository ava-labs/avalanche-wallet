<template>
    <div>
        <Modal
            ref="modal"
            :title="$t('kyc_process.title')"
            class="modal_main"
            @beforeClose="beforeClose"
        >
            <div v-if="!userDataSubmitted" class="KYCform">
                <div class="request-text">
                    {{ $t('kyc_process.info_explanation_p1') }}
                    <br />
                    {{ $t('kyc_process.info_explanation_p2') }}
                </div>
                <form @submit.prevent="submitUserData">
                    <div>
                        <label>{{ $t('kyc_process.your_email_address') }}</label>
                        <input
                            type="text"
                            :placeholder="$t('kyc_process.email_address')"
                            v-model="userData.email"
                        />
                    </div>
                    <div>
                        <label>{{ $t('kyc_process.your_phone_number') }}</label>
                        <input
                            type="tel"
                            :placeholder="$t('kyc_process.phone_number')"
                            v-model="userData.phone"
                        />
                    </div>
                    <v-btn
                        type="submit"
                        :disabled="submitUserDataDisabled"
                        :loading="isLoading"
                        class="button_submit_form"
                    >
                        {{ $t('kyc_process.submit') }}
                    </v-btn>
                </form>
            </div>
            <div id="sumsub-websdk-container"></div>
            <div v-if="verficationCompleted" class="kyc_action">
                <v-btn type="cancel" @click="close" class="outlined_button">Close</v-btn>
            </div>
        </Modal>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import Modal from '@/components/modals/Modal.vue'
import { generateToken } from '@/kyc_api'
import snsWebSdk from '@sumsub/websdk'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import { WalletType, WalletNameType } from '@c4tplatform/camino-wallet-sdk'
import { SingletonWallet } from '@/js/wallets/SingletonWallet'
const EC = require('elliptic').ec
const { isHexStrict, toHex, toUint8Array } = require('@arcblock/forge-util')
interface UserData {
    email: string
    phone: string
}

function strip0x(input: string) {
    return isHexStrict(input) ? input.replace(/^0x/i, '') : input
}
@Component({
    components: {
        Modal,
    },
})
export default class KycModal extends Vue {
    @Prop() walle!: WalletType
    $refs!: {
        modal: Modal
    }
    /**/
    modalLight: string = '#FFF'
    modalDark: string = '#242729'
    background: string = 'body {background-color: red !important;}'
    verficationCompleted: boolean = false
    /**/
    userDataSubmitted: boolean = false
    isLoading: boolean = false
    userData: UserData = {
        email: '',
        phone: '',
    }
    @Watch('$root.theme', { immediate: true })
    onthemechange(val: string) {
        if (val === 'night') {
            this.background =
                ".step.active .line, .step.active .bullet:before, .radio-item .checkmark:after, .step.active.pending .bullet:before {\
    background-color: #149ded;\
}\
.accent {\
    color: #149ded;\
}\
.step .title, .title  {\
    color: #f5f5f5;\
}\
.step.active .title {\
    color: #149ded;\
    font-size: 14px;\
    font-weight: 400;\
}\
section {\
    border-radius: 12px;\
    box-shadow: rgb(0 0 0 / 10%) 0px 0px 5px;\
    background-color: #1e293b;\
}\
p , h3, h2, label, .markdown-instructions li , .markdown-instructions p,.line-form .line-form-item > .phone-input,\
.line-form .line-form-item > input{\
    color : #f5f5f5 !important;\
    font-size : 14px;\
}\
.document-examples, .upload {\
    gap : 10px;\
}\
.upload-payment-item {\
    margin : 0px;\
}\
.upload-payment-item .upload-item , .mobile-button{\
    border: 1px solid rgba(203, 213, 225, 0.12);\
    border-radius: 7px;\
    box-shadow: rgb(0 0 0 / 10%) 0px 0px 5px;\
}\
 .mobile-button h3{\
    color : #149ded !important;\
 }\
 button.submit,\
button[type='submit'] {\
    border-radius: 12px;\
    background-color: transparent;\
    background-image: none;\
    color: #149ded;\
    border: 1px solid #149ded;\
}\
button:active:not(:disabled):not(.disabled),\
button:hover:not(:disabled):not(.disabled):not(:active) {\
    box-shadow: none;\
}\
button.submit:active:not(:disabled),\
button.submit:hover:not(:disabled):not(.disabled):not(:active),\
button[type='submit']:active:not(:disabled),\
button[type='submit']:hover:not(:disabled):not(.disabled):not(:active) {\
     background-image: none;\
}\
button {\
    border-radius: 12px;\
    background-color: transparent;\
    font-weight: 600;\
    text-align: center;\
    color: #149ded;\
    border: 1px solid #149ded;\
}\
.line-form .line-form-item > span {\
    border-bottom: none;\
}\
button.submit .arrow, button[type=submit] .arrow {\
    margin-right: 0;\
    margin-left: 5px;\
}\
button .arrow {\
    margin-right: 5px;\
}\
.upload-item h4.requiredDoc:after {\
    color: #149ded;\
}\
.popup {\
    background: #1e293b !important;\
}\
.popup .message-content p {\
    color: #f5f5f5 !important;\
}\
.step.pending .bullet {\
    background-color: #f5f5f5;\
    background-image: none;\
    border-color: #f5f5f5;\
}\
.step.pending .line , .step.active .line, .step.success .line{\
    background-color: #149ded;\
}\
.step.success .bullet {\
    background-color: #149ded;\
    border-color: #f5f5f5;\
}\
.error-message.warn {\
    background-color: #0f172a;\
}\
.radio-item input:disabled~.checkmark:after {\
  background-color: #149ded;\
}\
.document-status {\
    background-color: transparent !important;\
}\
"
            // 'body {background-color: var(--secondary-color) !important; min-height: 450px !important;} .line {background-color: black !important;}'
        } else {
            this.background =
                ".step.active .line, .step.active .bullet:before, .radio-item .checkmark:after, .step.active.pending .bullet:before {\
    background-color: #149ded;\
}\
.accent {\
    color: #149ded;\
}\
.step .title, .title  {\
    color: #0f172a;\
}\
.step.active .title {\
    color: #149ded;\
    font-size: 14px;\
    font-weight: 400;\
}\
section {\
    border-radius: 12px;\
    box-shadow: rgb(0 0 0 / 10%) 0px 0px 5px;\
    background-color: transparent;\
}\
p , h3, h2, label, .markdown-instructions li , .markdown-instructions p,.line-form .line-form-item > .phone-input,\
.line-form .line-form-item > input{\
    color : #0f172a !important;\
    font-size : 14px;\
}\
.document-examples, .upload {\
    gap : 10px;\
}\
.upload-payment-item {\
    margin : 0px;\
}\
.upload-payment-item .upload-item , .mobile-button{\
    border: 1px solid rgba(203, 213, 225, 0.12);\
    border-radius: 7px;\
    box-shadow: rgb(0 0 0 / 10%) 0px 0px 5px;\
}\
 .mobile-button h3{\
    color : #149ded !important;\
 }\
 button.submit,\
button[type='submit'] {\
    border-radius: 12px;\
    background-color: transparent;\
    background-image: none;\
    color: #149ded;\
    border: 1px solid #149ded;\
}\
button:active:not(:disabled):not(.disabled),\
button:hover:not(:disabled):not(.disabled):not(:active) {\
    box-shadow: none;\
}\
button.submit:active:not(:disabled),\
button.submit:hover:not(:disabled):not(.disabled):not(:active),\
button[type='submit']:active:not(:disabled),\
button[type='submit']:hover:not(:disabled):not(.disabled):not(:active) {\
     background-image: none;\
}\
button {\
    border-radius: 12px;\
    background-color: transparent;\
    font-weight: 600;\
    text-align: center;\
    color: #149ded;\
    border: 1px solid #149ded;\
}\
.line-form .line-form-item > span {\
    border-bottom: none;\
}\
button.submit .arrow, button[type=submit] .arrow {\
    margin-right: 0;\
    margin-left: 5px;\
}\
button .arrow {\
    margin-right: 5px;\
}\
.upload-item h4.requiredDoc:after {\
    color: #149ded;\
}\
.popup {\
    background: #e2e8f0 !important;\
}\
.popup .message-content p {\
    color: #0f172a !important;\
}\
.step.pending .bullet {\
    background-color: #0f172a;\
    background-image: none;\
    border-color: #0f172a;\
}\
.step.pending .line , .step.active .line, .step.success .line{\
    background-color: #149ded;\
}\
.step.success .bullet {\
    background-color: #149ded;\
    border-color: #0f172a;\
}\
.error-message.warn {\
    background-color: transparent;\
}\
.radio-item input:disabled~.checkmark:after {\
  background-color: #149ded;\
}\
.document-status {\
    background-color: transparent !important;\
}\
"
        }
    }
    get walletType(): WalletNameType {
        return this.wallet.type
    }
    get privateKeyC(): string | null {
        if (this.walletType === 'ledger') return null
        let wallet = this.wallet as SingletonWallet | MnemonicWallet
        return wallet.ethKey
    }
    get submitUserDataDisabled() {
        return !this.userData.email || !this.userData.phone || this.isLoading
    }

    launchWebSdk(accessToken: string, applicantEmail: any, applicantPhone: any) {
        let snsWebSdkInstance = snsWebSdk
            .init(accessToken, () => this.getNewAccessToken())
            .withConf({
                email: applicantEmail,
                phone: applicantPhone,
                uiConf: {
                    customCssStr: this.background,
                },
            })
            .withOptions({ addViewportTag: false, adaptIframeHeight: true })
            .on('idCheck.applicantStatus', async (applicantStatus) => {
                await this.$store.dispatch('Accounts/updateKycStatus')
                if (applicantStatus.reviewStatus === 'completed') {
                    this.verficationCompleted = true
                }
            })
            .build()
        snsWebSdkInstance.launch('#sumsub-websdk-container')
    }

    async getNewAccessToken() {
        const secp256k1 = new EC('secp256k1')
        const compressed = false
        const pk = secp256k1
            .keyFromPrivate(strip0x(toHex(`0x${this.privateKeyC}`)), 'hex')
            .getPublic(compressed, 'hex')
        let PublicKey = `0x${pk}`
        const result = await generateToken('0x' + this.wallet.getEvmAddress(), PublicKey)
        return result.token
    }

    get wallet() {
        let wallet: MnemonicWallet = this.$store.state.activeWallet
        return wallet
    }

    async submitUserData() {
        if (!this.userData.email || !this.userData.phone) return
        try {
            this.isLoading = true
            const accessToken = await this.getNewAccessToken()
            this.launchWebSdk(accessToken, this.userData.email, this.userData.phone)
            this.userDataSubmitted = true
        } finally {
            this.isLoading = false
        }
    }

    async open() {
        this.$refs.modal.open()
    }

    async close() {
        await this.$store.dispatch('Accounts/updateKycStatus')
        this.$refs.modal.close()
    }

    beforeClose() {
        this.userDataSubmitted = false
        this.userData = {
            email: '',
            phone: '',
        }
    }
}
</script>
<style scoped lang="scss">
@use '../../styles/main';

.modal_main::v-deep {
    .modal_body {
        width: 70%;
        max-width: 750px;
        height: min-content !important;
        /* min-height: 450px !important; */
        border-radius: var(--border-radius-sm) !important;
        overflow: auto;
        min-height: 200px;
        @include main.mobile-device {
            max-height: 90vh;
            max-width: none;
            width: 80%;
            min-height: fit-content;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        }
    }

    .modal_bg {
        width: 100vw !important;
        position: fixed;
    }
}

h1 {
    font-weight: normal;
}

.outlined_button {
    border-width: 1px;
    border-style: solid;
    border-radius: var(--border-radius-sm);
    padding: 10px 24px;
    border-color: var(--primary-btn-border-color);
    color: var(--primary-btn-border-color);
    background-color: var(--bg) !important;
    height: auto;
}

.kyc_action {
    display: flex;
    background-color: var(--bg);
    border-bottom: var(--bg);
    color: var(--primary-color);
    border-top: 2px solid var(--bg-light);
    position: relative;
    padding: 16px 22px;
}
.KYCform {
    padding: 20px;
    border-radius: var(--border-radius-sm);
    overflow: auto;
    .request-text {
        padding: 1rem;
        /* border: var(--primary-border); */
        text-align: center;
        color: var(--primary-contrast-text);
        border-radius: var(--border-radius-sm);
        margin-bottom: 25px;
        box-shadow: var(--box-shadow);
        background-color: var(--bg-light);
    }
    form {
        display: grid;
        gap: 10px;
        label {
            font-size: 14px;
            margin-bottom: 10px !important;
            color: var(--primary-contrast-text);
        }
        > div {
            display: flex;
            flex-direction: column;
            margin-bottom: 5px;
        }
    }
}

.popup {
    background: #1e293b;
}
.popup .message-content p {
    color: #f5f5f5;
}

/* .document-status {
    background-color: transparent !important;
} */
/* .steps {
}
.step .activ {
}

.step.active .line {
    background-color: red;
}
.bullet::before {
    background-color: black;
}
.title {
    color: white;
}

.step .title {
    color: #f5f5f5;
}
.step.active .title {
    color: #149ded;
} */
/* button.submit,
button[type='submit'] {
    border-radius: 12px;
    background-color: transparent;
    background-image: none;
    color: #149ded;
    border: 1px solid #149ded;
}
.upload-payment-item .upload-item {
    border: 1px solid rgba(203, 213, 225, 0.12);
    border-radius: 7px;
    box-shadow: rgb(0 0 0 / 10%) 0px 0px 5px;
    background-color: var(--white-color);
}

section {
    border-radius: 7px;
    box-shadow: rgb(0 0 0 / 10%) 0px 0px 5px;
    background-color: #1e293b;
} */
.step.active.pending .bullet:before {
    background-color: var(--orange-color);
}
.line-form .line-form-item > .phone-input,
.line-form .line-form-item > input {
    color: red;
}
.line-form .line-form-item > span {
    border-bottom: none;
}

button {
    border-radius: 12px;
    background-color: transparent;
    font-weight: 600;
    text-align: center;
    color: #7c8ab5;
    border: 1px solid #149ded;
}
input {
    color: var(--primary-color);
    background-color: var(--bg-light);
    border-radius: var(--border-radius-sm);
    padding: 10px 10px;
    font-size: 13px;
    outline: none;
}

/* .step.pending .bullet {
    background-color: #0f172a;
    background-image: none;
    border-color: #0f172a;
} */
</style>
