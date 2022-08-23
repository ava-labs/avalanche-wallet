<template>
    <div class="reward_row">
        <div class="top_bar">
            <div style="display: flex; justify-content: space-between">
                <p>{{ startDate.toLocaleString() }}</p>
                <p>{{ endDate.toLocaleString() }}</p>
            </div>
            <div
                class="reward_bar"
                :style="{
                    width: `${percFull * 100}%`,
                }"
            ></div>
        </div>
        <div class="data_row stake_info">
            <div>
                <label>NodeID</label>
                <p class="reward node_id">{{ staker.nodeID }}</p>
            </div>
            <div>
                <label>{{ $t('earn.rewards.row.stake') }}</label>
                <p class="reward">{{ stakeBig.toLocaleString() }} {{ nativeAssetSymbol }}</p>
            </div>
            <div style="text-align: right">
                <label>{{ $t('earn.rewards.row.reward') }}</label>
                <p class="reward">{{ rewardBig.toLocaleString() }} {{ nativeAssetSymbol }}</p>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { DelegatorRaw, ValidatorRaw } from '../../misc/ValidatorList/types'
import { BN } from '@c4tplatform/camino'
import Big from 'big.js'

@Component
export default class UserRewardRow extends Vue {
    now: number = Date.now()
    intervalID: any = null

    @Prop() staker!: ValidatorRaw | DelegatorRaw

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
    get startTime() {
        return parseInt(this.staker.startTime) * 1000
    }

    get endtime() {
        return parseInt(this.staker.endTime) * 1000
    }

    get startDate() {
        return new Date(this.startTime)
    }

    get endDate() {
        return new Date(this.endtime)
    }

    get rewardAmt(): BN {
        return new BN(this.staker.potentialReward)
    }

    get stakingAmt(): BN {
        return new BN(this.staker.stakeAmount)
    }

    get rewardBig(): Big {
        return Big(this.rewardAmt.toString()).div(Math.pow(10, 9))
    }

    get stakeBig(): Big {
        return Big(this.stakingAmt.toString()).div(Math.pow(10, 9))
    }

    get percFull(): number {
        let range = this.endtime - this.startTime
        let res = (this.now - this.startTime) / range
        return Math.min(res, 1)
    }

    get nativeAssetSymbol(): string {
        return this.$store.getters['Assets/AssetAVA']?.symbol ?? ''
    }
}
</script>
<style scoped lang="scss">
@use '../../../styles/main';

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
