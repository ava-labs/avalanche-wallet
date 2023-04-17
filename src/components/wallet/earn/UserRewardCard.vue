<template>
    <div class="offer_row">
        <h2 class="offer_title">{{ rewardTitle }}</h2>
        <div class="offer_detail">
            <div class="offer_detail_left">
                <div>
                    <label>{{ $t('earn.rewards.active_earning.lock_start') }}:</label>
                    <p class="reward">{{ startDate }}</p>
                </div>
                <div>
                    <label>{{ $t('earn.rewards.active_earning.lock_end') }}:</label>
                    <p class="reward">{{ endDate }}</p>
                </div>
                <div>
                    <label>{{ $t('earn.rewards.active_earning.min_lock') }}:</label>
                    <p class="reward">{{ minLockAmount.toLocaleString() }} CAM</p>
                </div>
                <div>
                    <label>{{ $t('earn.rewards.active_earning.reward') }}:</label>
                    <p class="reward">{{ rewardPercent }} %</p>
                </div>
            </div>
            <div class="offer_detail_right">
                <div>
                    <label>{{ $t('earn.rewards.active_earning.locked_amount') }}:</label>
                    <p class="reward">{{ depositAmount | cleanAvaxBN }} {{ nativeAssetSymbol }}</p>
                </div>
                <div>
                    <label>{{ $t('earn.rewards.active_earning.pending_reward') }}:</label>
                    <p class="reward">
                        {{ pendingRewardsAmount | cleanAvaxBN }} {{ nativeAssetSymbol }}
                    </p>
                </div>
                <div>
                    <label>{{ $t('earn.rewards.active_earning.already_claimed') }}:</label>
                    <p class="reward">
                        {{ alreadyClaimedAmount | cleanAvaxBN }} {{ nativeAssetSymbol }}
                    </p>
                </div>
            </div>
        </div>
        <button class="claim_button button_primary" @click="openModal" :disabled="!claimDisabled">
            {{ $t('earn.rewards.active_earning.claim') }}
        </button>
        <ModalClaimDepositReward
            ref="modal_claim_reward"
            :depositTxID="depositTxID"
            :amount="pendingRewards"
        />
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { BN } from '@c4tplatform/caminojs'
import Big from 'big.js'
import { ONEAVAX } from '@c4tplatform/caminojs/dist/utils'
import AvaAsset from '@/js/AvaAsset'
import ModalClaimDepositReward from './ClaimDepositRewardModal.vue'

@Component({
    filters: {
        cleanAvaxBN(val: BN) {
            let big = Big(val.toString()).div(Big(ONEAVAX.toString()))
            return big.toLocaleString()
        },
    },
    components: {
        ModalClaimDepositReward,
    },
})
export default class UserRewardCard extends Vue {
    now: number = Date.now()
    intervalID: any = null
    claimDisabled: boolean = true

    @Prop() depositTxID!: string
    @Prop() title!: string
    @Prop() start!: BN
    @Prop() end!: BN
    @Prop() minLock!: BN
    @Prop() rewards!: string
    @Prop() lockedAmount!: BN
    @Prop() pendingRewards!: BN
    @Prop() alreadyClaimed!: BN

    $refs!: {
        modal_claim_reward: ModalClaimDepositReward
    }

    updateNow() {
        this.now = Date.now()
    }

    created() {
        this.intervalID = setInterval(() => {
            this.updateNow()
        }, 2000)
    }
    destroyed() {
        clearInterval(this.intervalID)
    }

    get rewardTitle() {
        return Buffer.from(this.title.replace('0x', ''), 'hex').toString()
    }

    get startDate() {
        const startDate = new Date(parseInt(this.start.toString()) * 1000)

        return startDate.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        })
    }

    get endDate() {
        const endDate = new Date(parseInt(this.end.toString()) * 1000)

        return endDate.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        })
    }

    get minLockAmount() {
        return new Big(this.minLock.toString())
    }

    get depositAmount() {
        return new Big(this.lockedAmount.toString())
    }

    get pendingRewardsAmount() {
        return new Big(this.pendingRewards.toString())
    }

    get alreadyClaimedAmount() {
        return new Big(this.alreadyClaimed.toString())
    }

    get rewardPercent() {
        const interestRateBase = 365 * 24 * 60 * 60
        const interestRateDenominator = 1000000 * interestRateBase

        return (parseInt(this.rewards) / interestRateDenominator) * interestRateBase * 100
    }

    get ava_asset(): AvaAsset | null {
        let ava = this.$store.getters['Assets/AssetAVA']
        return ava
    }

    get nativeAssetSymbol(): string {
        return this.ava_asset?.symbol ?? ''
    }

    get isClaimDisabled() {
        return !(parseInt(this.pendingRewards.toString()) > 0)
    }

    openModal() {
        this.$refs.modal_claim_reward.open()
    }
}
</script>
<style scoped lang="scss">
@use '../../../styles/main';

.offer_row {
    display: flex;
    flex-direction: column;
    border-radius: var(--border-radius-sm);
    overflow: hidden;
    font-size: 14px;
    background-color: var(--bg-light);
    padding: 1rem;
}

.offer_title {
    margin-bottom: 1rem;
}

.offer_detail {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 1.25rem;
    .offer_detail_left {
        border-right: 2px solid var(--bg-wallet-light);
    }
}

.node_id {
    word-break: break-all;
}

.top_bar {
    height: max-content;
    position: relative;
    padding: 2px 8px;
    border-bottom: 2px solid var(--bg-wallet-light);
}
.reward_row {
    border-radius: var(--border-radius-sm);
    overflow: hidden;
    font-size: 14px;
    //border: 2px solid var(--bg-light);
    background-color: var(--bg-light);
}

.data_row {
    grid-column: 1/3;
    display: grid;
    grid-template-columns: 1fr 280px;
    align-items: center;
}

.date {
    z-index: 1;
}
.reward_bar {
    background-color: var(--success);
    position: absolute;
    opacity: 0.5;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 0;
}

.stake_info {
    padding: 6px 12px;
    display: grid;
    column-gap: 14px;
    grid-template-columns: 2fr 1fr 1fr;
    /*justify-content: space-between;*/
    /*text-align: right;*/
    text-align: left;

    > div {
        align-self: baseline;
    }
}

label {
    color: var(--primary-color-light) !important;
}

.claim_button {
    border-radius: var(--border-radius-sm);
    width: min-content;
    padding: 8px 30px;
    margin-left: auto;
    &[disabled] {
        background-color: var(--primary-color) !important;
    }
}

@include main.mobile-device {
    .offer_detail {
        grid-template-columns: 1fr;
        grid-gap: 0.5rem;
        .offer_detail_left {
            border-right: none;
        }
    }
}

@include main.mobile-device {
    .stake_info {
        grid-column: 1/3;
        border-left: none;
        border-top: 3px solid var(--bg);

        > div:first-of-type {
            text-align: left;
        }
    }
}
</style>
