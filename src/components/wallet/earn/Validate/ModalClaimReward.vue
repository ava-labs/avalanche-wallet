<template>
    <modal ref="modal" title="Claim Reward" @beforeClose="beforeClose">
        <div class="modal-claim-reward-div">
            <div v-if="!claimed">
                <div>
                    <h3>
                        {{
                            $t('validator.rewards.modal_claim.are_you_sure', {
                                amountClaim: amountText,
                                symbol: symbol,
                            })
                        }}
                    </h3>
                    <br />
                    <p class="text-modal">
                        {{
                            $t('validator.rewards.modal_claim.kindy_be_aware', {
                                fee: feeTx,
                                symbol: nativeAssetSymbol,
                            })
                        }}
                    </p>
                    <br />
                </div>
                <div class="modal-claim-reward-div-options">
                    <v-btn depressed class="button_primary" @click="close()">
                        {{ $t('validator.rewards.modal_claim.cancel') }}
                    </v-btn>
                    <v-btn depressed class="button_secondary btn-claim" @click="confirmClaim()">
                        {{ $t('validator.rewards.modal_claim.claim') }}
                    </v-btn>
                </div>
            </div>
            <div class="confirmed-claimed" v-else>
                <br />
                <h2>
                    {{
                        $t('validator.rewards.modal_claim.confirmed_claimed', {
                            amount: confirmedClaimedAmountText,
                            symbol: symbol,
                        })
                    }}
                </h2>
                <br />
            </div>
        </div>
    </modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import Modal from '../../../modals/Modal.vue'
import { ValidatorRaw } from '@/components/misc/ValidatorList/types'
import { BN } from '@c4tplatform/caminojs'
import { WalletHelper } from '../../../../helpers/wallet_helper'
import * as SDK from '@c4tplatform/camino-wallet-sdk/dist'
import { ava } from '@/AVA'

@Component({
    components: {
        Modal,
    },
})
export default class ModalClaimReward extends Vue {
    @Prop() nodeId!: string
    @Prop() nodeInfo!: ValidatorRaw
    @Prop() amountText!: string
    @Prop() symbol!: string
    @Prop() amount!: BN

    claimed: boolean = false
    confirmedClaimedAmountText: string = ''

    open() {
        // @ts-ignore
        this.$refs.modal.open()
    }

    close() {
        // @ts-ignore
        this.$refs.modal.close()
    }

    beforeClose() {
        this.confirmedClaimedAmountText = ''
        this.$emit('beforeCloseModal', this.claimed)
        this.claimed = false
    }

    async confirmClaim() {
        try {
            await WalletHelper.buildClaimTx(
                this.nodeInfo.rewardOwner.addresses[0],
                new BN(this.amount),
                this.$store.state.activeWallet
            )
            this.confirmedClaimedAmountText = new BN(this.amount).toString()
            this.claimed = true
        } catch (e) {
            console.error(e)
            this.claimed = false
        }
    }

    get feeTx() {
        return SDK.bnToBigAvaxX(ava.PChain().getTxFee())
    }

    get nativeAssetSymbol(): string {
        return this.$store.getters['Assets/AssetAVA']?.symbol ?? ''
    }
}
</script>
<style scoped lang="scss">
@use '../../../../styles/main';

.modal-claim-reward-div {
    padding: 30px 22px;
    text-align: center;
    width: 600px;
    overflow-x: hidden;
}

.options-buttons {
    width: 100%;
    display: flex;
}

.btn-options {
    position: relative;
    height: 24px !important;
}

.btn-claim {
    position: relative;
    left: 15px;
}

.text-modal {
    text-align: justify;
    color: rgb(187, 16, 16);
}

@media screen and (max-width: 720px) {
    .modal-claim-reward-div {
        width: 350px;
    }
}

@media screen and (min-width: 720px) and (max-width: 1440px) {
    .modal-claim-reward-div {
        width: 475px;
    }
}

.confirmed-claimed {
    top: 50%;
    left: 50%;
}
</style>
