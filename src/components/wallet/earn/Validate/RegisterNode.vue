<template>
    <div>
        <div class="refresh_div">
            <div class="refresh">
                <Spinner v-if="loadingRefreshRegisterNode" class="spinner"></Spinner>
                <button v-else @click="refresh">
                    <v-icon>mdi-refresh</v-icon>
                </button>
            </div>
        </div>
        <br />
        <div class="requirements_list">
            <h4>{{ $t('earn.validate.requirements_introduction') }}</h4>
            <div class="requirement_title">
                <fa v-if="isKycVerified" class="success_status_icon" icon="check-circle"></fa>
                <fa v-else class="error_status_icon" icon="times-circle"></fa>
                <h4>
                    {{ $t('earn.validate.warns.kyc_verified') }}
                    <a
                        href="https://docs.camino.network/to/wallet-validate-kyc-kyb"
                        target="_blank"
                    >
                        <fa icon="external-link-alt"></fa>
                    </a>
                </h4>
            </div>
            <div class="requirement_title">
                <fa v-if="isConsortiumMember" class="success_status_icon" icon="check-circle"></fa>
                <fa v-else class="error_status_icon" icon="times-circle"></fa>
                <h4>
                    {{ $t('earn.validate.warns.consortium_member_verified') }}
                    <a
                        href="https://docs.camino.network/to/wallet-validate-c-member"
                        target="_blank"
                    >
                        <fa icon="external-link-alt"></fa>
                    </a>
                </h4>
            </div>
            <div class="requirement_title">
                <fa
                    v-if="hasEnoughUnlockedPlatformBalance"
                    class="success_status_icon"
                    icon="check-circle"
                ></fa>
                <fa v-else class="error_status_icon" icon="times-circle"></fa>
                <h4>
                    {{
                        $t('earn.validate.warns.camino_available', [
                            cleanAvaxBN(minPlatformUnlocked),
                        ])
                    }}
                    <a href="https://docs.camino.network/to/wallet-validate-cams" target="_blank">
                        <fa icon="external-link-alt"></fa>
                    </a>
                </h4>
            </div>
            <div class="requirement_title">
                <fa v-if="isNodeRegistered" class="success_status_icon" icon="check-circle"></fa>
                <fa v-else class="error_status_icon" icon="times-circle"></fa>
                <h4>
                    {{ $t('earn.validate.warns.consortium_member_address_linked_to_node') }}
                    <a
                        href="https://docs.camino.network/to/wallet-validate-reg-node"
                        target="_blank"
                    >
                        <fa icon="external-link-alt"></fa>
                    </a>
                </h4>
            </div>
        </div>
        <div
            v-if="isKycVerified && isConsortiumMember && hasEnoughUnlockedPlatformBalance"
            class="input_section"
        >
            <div>
                <h4 class="input_label">{{ $t('earn.validate.label_3') }}</h4>
                <span class="disabled_input" role="textbox">
                    {{ pChainAddress }}
                </span>
            </div>
            <div>
                <h4 class="input_label">{{ $t('earn.validate.label_1') }}</h4>
                <input
                    class="high_input"
                    type="password"
                    v-model="nodePrivateKey"
                    style="width: 100%; border-radius: var(--border-radius-sm)"
                    :placeholder="$t('earn.validate.description_1')"
                />
            </div>
            <v-btn
                @click="registerNode"
                class="button_secondary"
                depressed
                :disabled="
                    !isKycVerified ||
                    !isConsortiumMember ||
                    !hasEnoughUnlockedPlatformBalance ||
                    !nodePrivateKey
                "
                block
            >
                <Spinner v-if="loadingRegisterNode" class="spinner"></Spinner>
                <span v-else>
                    {{ $t('earn.validate.register_validator_node') }}
                </span>
            </v-btn>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { BN } from '@c4tplatform/caminojs/dist'
import { WalletHelper } from '@/helpers/wallet_helper'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import { SingletonWallet } from '@/js/wallets/SingletonWallet'
import { ava } from '@/AVA'
import { KeyPair } from '@c4tplatform/caminojs/dist/apis/avm'
import {
    bufferToNodeIDString,
    ONEAVAX,
    privateKeyStringToBuffer,
} from '@c4tplatform/caminojs/dist/utils'
import Big from 'big.js'
import Spinner from '@/components/misc/Spinner.vue'

@Component({
    components: {
        Spinner,
    },
})
export default class RegisterNode extends Vue {
    @Prop() isKycVerified!: boolean
    @Prop() isConsortiumMember!: boolean
    @Prop() minPlatformUnlocked!: BN
    @Prop() hasEnoughUnlockedPlatformBalance!: boolean
    @Prop() isNodeRegistered!: boolean
    @Prop() loadingRefreshRegisterNode!: boolean

    helpers = this.globalHelper()
    nodePrivateKey = ''
    loadingRegisterNode: boolean = false

    cleanAvaxBN(val: BN) {
        let big = Big(val.toString()).div(Big(ONEAVAX.toString()))
        return big.toLocaleString()
    }

    get addresses() {
        let wallet: MnemonicWallet = this.$store.state.activeWallet
        return wallet.getAllAddressesP()
    }

    get wallet() {
        let wallet: SingletonWallet = this.$store.state.activeWallet
        return wallet
    }

    get pChainAddress() {
        return this.wallet.getCurrentAddressPlatform()
    }

    async registerNode() {
        try {
            let hrp = ava.getHRP()
            let keypair = new KeyPair(hrp, 'P')
            keypair.importKey(privateKeyStringToBuffer(this.nodePrivateKey.trim()))
            let nodeId = bufferToNodeIDString(keypair.getAddress())
            const result = await WalletHelper.registerNodeTx(
                this.wallet,
                this.nodePrivateKey.trim(),
                undefined,
                nodeId,
                this.addresses[0]
            )
            console.log(result)
            this.loadingRegisterNode = true
            setTimeout(() => {
                this.$emit('registered')
                this.helpers.dispatchNotification({
                    message: this.$t('notifications.register_node_success'),
                    type: 'success',
                })
                this.loadingRegisterNode = false
            }, 2000)
        } catch (error) {
            console.error(error)
            this.helpers.dispatchNotification({
                message: this.$t('notifications.register_node_failed'),
                type: 'error',
            })
        }
    }

    refresh() {
        this.$emit('refresh')
    }
}
</script>
<style scoped lang="scss">
@use '../../../../styles/main';

.success_status_icon {
    color: var(--success);
}

.error_status_icon {
    color: var(--error);
}

input {
    color: var(--primary-color);
    background-color: var(--bg-light);
    padding: 6px 14px;
}

.disabled_input {
    display: inline-block;
    border-radius: var(--border-radius-sm);
    color: gray;
    background-color: var(--bg-light);
    padding: 6px 14px;
}

.disabled_input:focus-visible {
    outline: 0;
}

a {
    color: #0085ff !important;
}

.input_label {
    margin-bottom: 0.5rem;
}

.requirements_list {
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.requirement_title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.input_section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

input::placeholder {
    white-space: pre-line;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
}

@media only screen and (max-width: main.$mobile_width) {
    .high_input {
        line-height: 4;
    }
}

.refresh {
    width: 20px;
    height: 20px;
    .v-icon {
        color: var(--primary-color);
    }

    button {
        outline: none !important;
    }
    img {
        object-fit: contain;
        width: 100%;
    }

    .spinner {
        color: var(--primary-color) !important;
    }
}

.refresh_div {
    position: relative;
    float: right;
    margin-top: -5%;
}
</style>
