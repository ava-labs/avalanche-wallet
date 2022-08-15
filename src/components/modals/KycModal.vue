<template>
    <div>
        <Modal
            ref="modal"
            :title="$t('kyc_process.title')"
            class="modal_main"
            @beforeClose="beforeClose"
        >
            <div v-if="!userDataSubmitted" class="form">
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
                        class="button_primary"
                    >
                        {{ $t('kyc_process.submit') }}
                    </v-btn>
                </form>
            </div>
            <div id="sumsub-websdk-container"></div>
        </Modal>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Component, Vue } from 'vue-property-decorator'
import Modal from '@/components/modals/Modal.vue'
import { generateToken } from '@/kyc_api'
import snsWebSdk from '@sumsub/websdk'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'

interface UserData {
    email: string
    phone: string
}

@Component({
    components: {
        Modal,
    },
})
export default class KycModal extends Vue {
    $refs!: {
        modal: Modal
    }

    userDataSubmitted: boolean = false
    isLoading: boolean = false
    userData: UserData = {
        email: '',
        phone: '',
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
                    customCssStr: 'body {background-color: whitesmoke !important;}',
                },
            })
            .withOptions({ addViewportTag: false, adaptIframeHeight: true })
            .on('idCheck.applicantStatus', async () => {
                await this.$store.dispatch('Accounts/updateKycStatus')
            })
            .build()
        snsWebSdkInstance.launch('#sumsub-websdk-container')
    }

    async getNewAccessToken() {
        const result = await generateToken('0x' + this.wallet.getEvmAddress())
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
        @include main.mobile-device {
            width: 100%;
            bottom: initial;
        }
    }

    .modal_bg {
        position: fixed;
    }
}

h1 {
    font-weight: normal;
}

.form {
    padding: 20px;
    border-radius: 4px;
    overflow: auto;
}

form {
    margin-top: 12px;

    label {
        font-size: 12px;
    }

    > div {
        display: flex;
        flex-direction: column;
        margin-bottom: 5px;
    }
}

input {
    color: var(--primary-color);
    background-color: var(--bg-light);
    border-radius: 4px;
    padding: 6px 6px;
    font-size: 13px;
    outline: none;
}
</style>
