<template>
    <div>
        <div class="rewards-div">
            <div>
                <h4 class="input_label">{{ $t('validator.rewards.claim.reward_owner') }}</h4>
                <span class="disabled_input" role="textbox">
                    {{ rewardOwner }}
                </span>
            </div>
            <br />
            <div>
                <h4>{{ $t('validator.rewards.claim.claimable_validation') }}</h4>
                <div class="reward-claim-div">
                    <h1>{{ pRewardAmountText }} {{ symbol }}</h1>
                    <v-btn
                        class="button_secondary btn-claim-reward"
                        depressed
                        @click="openModalClaimReward"
                    >
                        {{ $t('validator.rewards.claim.claim_rewards') }}
                    </v-btn>
                </div>
            </div>
        </div>
        <ModalClaimReward
            :nodeId="nodeId"
            :nodeInfo="nodeInfo"
            ref="modal_claim_reward"
            :amountText="pRewardAmountText"
            :symbol="symbol"
        ></ModalClaimReward>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import ModalClaimReward from './ModalClaimReward.vue'
import { ValidatorRaw } from '@/components/misc/ValidatorList/types'
import { WalletHelper } from '../../../../helpers/wallet_helper'
import { BN } from '@c4tplatform/caminojs'
import AvaAsset from '@/js/AvaAsset'
import Big from 'big.js'

@Component({
    components: {
        ModalClaimReward,
    },
})
export default class ClaimRewards extends Vue {
    @Prop() nodeId!: string
    @Prop() nodeInfo!: ValidatorRaw

    rewardAmount: BN = new BN(0)
    loading: boolean = false

    get symbol(): string {
        return this.$store.getters['Assets/AssetAVA']?.symbol ?? ''
    }

    $refs!: {
        modal_claim_reward: ModalClaimReward
    }

    mounted() {
        this.getClaimableReward()
    }

    get rewardOwner() {
        if (this.nodeInfo != null && this.nodeInfo != undefined) {
            return this.nodeInfo.rewardOwner.addresses[0].toString()
        } else {
            return null
        }
    }

    async getClaimableReward() {
        this.loading = true
        let responseClaimable = await WalletHelper.getClaimables(
            this.nodeInfo.rewardOwner.addresses[0].toString(),
            this.nodeInfo.txID
        )

        if (responseClaimable != null && responseClaimable != undefined) {
            this.rewardAmount = responseClaimable.validatorRewards
        }

        this.loading = false
    }

    openModalClaimReward() {
        this.$refs.modal_claim_reward.open()
    }

    get ava_asset(): AvaAsset | null {
        let ava = this.$store.getters['Assets/AssetAVA']
        return ava
    }

    get pRewardAmountText() {
        if (!this.ava_asset) return '--'

        let denom = this.ava_asset.denomination
        let bal = this.rewardAmount
        let bigBal = Big(bal.toString())
        bigBal = bigBal.div(Math.pow(10, denom))

        if (bigBal.lt(Big('1'))) {
            return bigBal.toLocaleString(9)
        } else {
            return bigBal.toLocaleString(3)
        }
    }
}
</script>
<style scoped lang="scss">
@use '../../../../styles/main';

.rewards-div {
    margin-top: 1rem;
}

.disabled_input {
    display: inline-block;
    border-radius: var(--border-radius-sm);
    color: var(--primary-color-light);
    background-color: var(--bg-light);
    padding: 6px 14px;
    white-space: nowrap;
    width: 70%;
}

.disabled_input:focus-visible {
    outline: 0;
}

@media screen and (max-width: 900px) {
    .disabled_input {
        width: 100%;
    }
}

@media screen and (max-width: 900px) {
    .disabled_input {
        width: 100%;
    }
}

@media screen and (min-width: 720px) and (max-width: 1440px) {
    .disabled_input {
        width: 100%;
    }
}

h4 {
    font-weight: normal;
}

.reward-claim-div {
    width: 100%;
    display: flex;
}

.btn-claim-reward {
    position: relative;
    left: 15px;
    height: 24px !important;
    top: 5px;
}
</style>
