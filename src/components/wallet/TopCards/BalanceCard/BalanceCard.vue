<template>
    <div class="balance_card">
        <UtxosBreakdownModal ref="utxos_modal"></UtxosBreakdownModal>
        <div class="fungible_card">
            <div class="header">
                <div class="refresh">
                    <Spinner v-if="isUpdateBalance" class="spinner"></Spinner>
                    <button v-else @click="updateBalance">
                        <fa icon="sync"></fa>
                    </button>
                </div>
                <h4>{{ $t('top.title2') }}</h4>
                <template v-if="!isBreakdown">
                    <button class="breakdown_toggle" @click="toggleBreakdown">
                        <fa icon="eye"></fa>
                        {{ $t('top.balance.show') }}
                    </button>
                </template>
                <template v-else>
                    <button class="breakdown_toggle" @click="toggleBreakdown">
                        <fa icon="eye-slash"></fa>
                        {{ $t('top.balance.hide') }}
                    </button>
                </template>
                <button @click="showUTXOsModal" class="breakdown_toggle">Show UTXOs</button>
            </div>
            <div class="balance_row">
                <p class="balance" data-cy="wallet_balance" v-if="!balanceTextRight">
                    {{ balanceTextLeft }} AVAX
                </p>
                <p class="balance" data-cy="wallet_balance" v-else>
                    {{ balanceTextLeft }}
                    <span>.{{ balanceTextRight }}</span>
                    AVAX
                </p>
                <div style="display: flex; flex-direction: row">
                    <p class="balance_usd">
                        <b>$ {{ totalBalanceUSDText }}</b>
                        USD
                    </p>
                    <p class="balance_usd" style="background-color: transparent">
                        <b>1 AVAX</b>
                        =
                        <b>${{ avaxPriceText }}</b>
                        USD
                    </p>
                </div>
            </div>
            <!--            <button class="expand_but">Show Breakdown<fa icon="list-ol"></fa></button>-->
            <div class="alt_info">
                <div class="alt_non_breakdown" v-if="!isBreakdown">
                    <div>
                        <label>{{ $t('top.balance.available') }}</label>
                        <p>{{ unlockedText }} AVAX</p>
                    </div>
                    <div v-if="hasLocked">
                        <label>{{ $t('top.locked') }}</label>
                        <p>{{ balanceTextLocked }} AVAX</p>
                    </div>
                    <div v-if="hasMultisig">
                        <label>Multisig</label>
                        <p>{{ balanceTextMultisig }} AVAX</p>
                    </div>
                    <div>
                        <label>{{ $t('top.balance.stake') }}</label>
                        <p>{{ stakingText }} AVAX</p>
                    </div>
                </div>
                <div class="alt_breakdown" v-else>
                    <div>
                        <label>{{ $t('top.balance.available') }} (X)</label>
                        <p>{{ avmUnlocked | cleanAvaxBN }} AVAX</p>
                        <label>{{ $t('top.balance.available') }} (P)</label>
                        <p>{{ platformUnlocked | cleanAvaxBN }} AVAX</p>
                        <label>{{ $t('top.balance.available') }} (C)</label>
                        <p>{{ evmUnlocked | cleanAvaxBN }} AVAX</p>
                    </div>
                    <div v-if="hasLocked">
                        <label>{{ $t('top.balance.locked') }} (X)</label>
                        <p>{{ avmLocked | cleanAvaxBN }} AVAX</p>
                        <label>{{ $t('top.balance.locked') }} (P)</label>
                        <p>{{ platformLocked | cleanAvaxBN }} AVAX</p>
                        <label>{{ $t('top.balance.locked_stake') }} (P)</label>
                        <p>{{ platformLockedStakeable | cleanAvaxBN }} AVAX</p>
                    </div>
                    <div v-if="hasMultisig">
                        <label>Multisig (X)</label>
                        <p>{{ avmMultisig | cleanAvaxBN }} AVAX</p>
                        <label>Multisig (P)</label>
                        <p>{{ platformMultisig | cleanAvaxBN }} AVAX</p>
                    </div>
                    <div>
                        <label>{{ $t('top.balance.stake') }}</label>
                        <p>{{ stakingText }} AVAX</p>
                    </div>
                </div>
            </div>
        </div>
        <NftCol class="nft_card"></NftCol>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop, Ref, Watch } from 'vue-property-decorator'
import AvaAsset from '@/js/AvaAsset'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import Spinner from '@/components/misc/Spinner.vue'
import NftCol from './NftCol.vue'
import Tooltip from '@/components/misc/Tooltip.vue'

import Big from 'big.js'
import { BN } from 'avalanche/dist'
import { ONEAVAX } from 'avalanche/dist/utils'
import { bnToBig } from '@/helpers/helper'
import { priceDict } from '@/store/types'
import { WalletType } from '@/js/wallets/types'
import UtxosBreakdownModal from '@/components/modals/UtxosBreakdown/UtxosBreakdownModal.vue'

@Component({
    components: {
        UtxosBreakdownModal,
        Spinner,
        NftCol,
        Tooltip,
    },
    filters: {
        cleanAvaxBN(val: BN) {
            let big = Big(val.toString()).div(Big(ONEAVAX.toString()))
            return big.toLocaleString()
        },
    },
})
export default class BalanceCard extends Vue {
    isBreakdown = true

    $refs!: {
        utxos_modal: UtxosBreakdownModal
    }

    updateBalance(): void {
        this.$store.dispatch('Assets/updateUTXOs')
        this.$store.dispatch('History/updateTransactionHistory')
    }

    showUTXOsModal() {
        this.$refs.utxos_modal.open()
    }
    get ava_asset(): AvaAsset | null {
        let ava = this.$store.getters['Assets/AssetAVA']
        return ava
    }

    toggleBreakdown() {
        this.isBreakdown = !this.isBreakdown
    }

    get avmUnlocked(): BN {
        if (!this.ava_asset) return new BN(0)
        return this.ava_asset.amount
    }

    get avmLocked(): BN {
        if (!this.ava_asset) return new BN(0)
        return this.ava_asset.amountLocked
    }

    get evmUnlocked(): BN {
        if (!this.wallet) return new BN(0)
        // convert from ^18 to ^9
        let bal = this.wallet.ethBalance
        return bal.div(new BN(Math.pow(10, 9).toString()))
    }

    get totalBalance(): BN {
        if (!this.ava_asset) return new BN(0)

        let tot = this.ava_asset.getTotalAmount()
        // add EVM balance
        tot = tot.add(this.evmUnlocked)
        return tot
    }

    get totalBalanceBig(): Big {
        if (this.ava_asset) {
            let denom = this.ava_asset.denomination
            let bigTot = bnToBig(this.totalBalance, denom)
            return bigTot
        }
        return Big(0)
    }

    get avaxPriceText() {
        return this.priceDict.usd
    }

    get totalBalanceUSD(): Big {
        let usdPrice = this.priceDict.usd
        let usdBig = this.totalBalanceBig.times(Big(usdPrice))
        return usdBig
    }

    get totalBalanceUSDText(): string {
        if (this.isUpdateBalance) return '--'
        return this.totalBalanceUSD.toLocaleString(2)
    }
    // should be unlocked (X+P), locked (X+P) and staked and lockedStakeable
    get balanceText(): string {
        if (this.ava_asset !== null) {
            let denom = this.ava_asset.denomination
            return this.totalBalanceBig.toLocaleString(denom)
        } else {
            return '?'
        }
    }

    get balanceTextLeft(): string {
        if (this.isUpdateBalance) return '--'
        let text = this.balanceText
        if (text.includes('.')) {
            let left = text.split('.')[0]
            return left
        }
        return text
    }

    get balanceTextRight(): string {
        if (this.isUpdateBalance) return ''
        let text = this.balanceText
        if (text.includes('.')) {
            let right = text.split('.')[1]
            return right
        }
        return ''
    }

    // Locked balance is the sum of locked AVAX tokens on X and P chain
    get balanceTextLocked(): string {
        if (this.isUpdateBalance) return '--'

        if (this.ava_asset !== null) {
            let denom = this.ava_asset.denomination
            let tot = this.platformLocked.add(this.platformLockedStakeable)
            // let otherLockedAmt = this.platformLocked.add(this.platformLockedStakeable)
            let pLocked = Big(tot.toString()).div(Math.pow(10, denom))
            let amt = this.ava_asset.getAmount(true)
            amt = amt.add(pLocked)

            return amt.toLocaleString(denom)
        } else {
            return '--'
        }
    }

    get balanceTextMultisig() {
        if (this.isUpdateBalance) return '--'

        if (this.ava_asset !== null) {
            let denom = this.ava_asset.denomination
            return bnToBig(this.avmMultisig.add(this.platformMultisig), denom).toLocaleString()
        } else {
            return '--'
        }
    }

    get avmMultisig(): BN {
        if (this.ava_asset !== null) {
            return this.ava_asset.amountMultisig
        } else {
            return new BN(0)
        }
    }

    get platformBalance() {
        return this.$store.getters['Assets/walletPlatformBalance']
    }

    get platformUnlocked(): BN {
        return this.platformBalance.available
    }

    get platformMultisig(): BN {
        return this.platformBalance.multisig
    }

    get platformLocked(): BN {
        return this.platformBalance.locked
    }

    get platformLockedStakeable(): BN {
        return this.platformBalance.lockedStakeable
    }

    get unlockedText() {
        if (this.isUpdateBalance) return '--'

        if (this.ava_asset) {
            let xUnlocked = this.ava_asset.amount
            let pUnlocked = this.platformUnlocked

            let denom = this.ava_asset.denomination

            let tot = xUnlocked.add(pUnlocked).add(this.evmUnlocked)

            let amtBig = bnToBig(tot, denom)

            return amtBig.toLocaleString(denom)
        } else {
            return '--'
        }
    }

    get pBalanceText() {
        if (!this.ava_asset) return '--'
        if (this.isUpdateBalance) return '--'

        let denom = this.ava_asset.denomination
        let bal = this.platformUnlocked
        let bigBal = Big(bal.toString())
        bigBal = bigBal.div(Math.pow(10, denom))

        if (bigBal.lt(Big('1'))) {
            return bigBal.toLocaleString(9)
        } else {
            return bigBal.toLocaleString(3)
        }
    }

    get stakingAmount(): BN {
        return this.$store.getters['Assets/walletStakingBalance']
    }

    get stakingText() {
        let balance = this.stakingAmount
        if (!balance) return '0'
        if (this.isUpdateBalance) return '--'

        let denom = 9
        let bigBal = Big(balance.toString())
        bigBal = bigBal.div(Math.pow(10, denom))

        if (bigBal.lt(Big('1'))) {
            return bigBal.toString()
        } else {
            return bigBal.toLocaleString()
        }
    }

    get wallet(): WalletType | null {
        return this.$store.state.activeWallet
    }

    get isUpdateBalance(): boolean {
        if (!this.wallet) return true
        return this.wallet.isFetchUtxos
    }

    get priceDict(): priceDict {
        return this.$store.state.prices
    }

    get hasLocked(): boolean {
        return (
            !this.avmLocked.isZero() ||
            !this.platformLocked.isZero() ||
            !this.platformLockedStakeable.isZero()
        )
    }
    get hasMultisig(): boolean {
        return !this.avmMultisig.isZero() || !this.platformMultisig.isZero()
    }
}
</script>
<style scoped lang="scss">
@use '../../../../main';
.balance_card {
    display: grid;
    grid-template-columns: 1fr 230px;
    column-gap: 20px;
}

.nft_card {
    border-left: 2px solid var(--bg-light);
}
.fungible_card {
    height: 100%;
    display: grid !important;
    grid-template-rows: max-content 1fr max-content;
    flex-direction: column;
}

.where_info {
    grid-row: 2;
    grid-column: 1/3;
    margin-top: 8px;
    /*max-width: 460px;*/
}
.header {
    display: flex;

    h4 {
        margin-left: 12px;
        flex-grow: 1;
    }
}
h4 {
    font-weight: normal;
}

.alert_cont {
    margin: 0;
}

.balance_row {
    align-self: center;
}
.balance {
    font-size: 2.4em;
    white-space: normal;
    /*font-weight: bold;*/
    font-family: Rubik !important;

    span {
        font-size: 0.8em;
        /*color: var(--primary-color-light);*/
    }
}

.balance_usd {
    width: max-content;
    background: var(--bg-light);
    color: var(--primary-color-light);
    font-size: 13px;
    padding: 1px 6px;
    border-radius: 3px;
    margin-right: 6px !important;
}

.refresh {
    width: 20px;
    height: 20px;
    color: var(--primary-color);

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
.buts {
    width: 100%;
    text-align: right;
}
.buts button {
    font-size: 18px;
    margin: 0px 18px;
    margin-right: 0px;
    position: relative;
    outline: none !important;
}

.buts img {
    height: 20px;
    width: 20px;
    object-fit: contain;
    outline: none !important;
}
.buts button[tooltip]:hover:before {
    border-radius: 4px;
    /*left: 0;*/
    left: 0;
    transform: translateX(-50%);
    content: attr(tooltip);
    position: absolute;
    background-color: #303030;
    bottom: 100%;
    color: #ddd;
    width: max-content;
    max-width: 100px;
    font-size: 14px;
    padding: 4px 8px;
}

.alt_info > div {
    display: grid;
    grid-template-columns: repeat(4, max-content);
    column-gap: 0px;
    margin-top: 12px;
    > div {
        position: relative;
        padding: 0 24px;
        border-right: 2px solid var(--bg-light);
        &:first-of-type {
            padding-left: 0;
        }
        &:last-of-type {
            border: none;
        }
    }

    label {
        font-size: 13px;
        color: var(--primary-color-light);
    }
}

.nft_card {
    padding-left: 20px;
}

.breakdown_toggle {
    color: var(--primary-color-light);
    font-size: 13px;
    outline: none !important;
    margin-left: 12px;

    &:hover {
        color: var(--secondary-color);
    }
}

@include main.medium-device {
    .balance_card {
        display: block;
        //grid-template-columns: 1fr 120px;
    }

    .balance {
        font-size: 1.8rem !important;
    }

    .balance_usd {
        font-size: 11px;
    }
    .nft_col {
        display: none;
    }

    .alt_info {
        font-size: 12px;
    }
}

@include main.mobile-device {
    .balance_card {
        grid-template-columns: none;
        display: block !important;
    }

    .nft_col {
        display: none;
    }

    .nft_card {
        padding: 0;
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid var(--primary-color-light);
        border-left: none;
    }

    .balance {
        font-size: 2em !important;
    }

    .where_info {
    }

    .alt_info {
        > div {
            text-align: left;
            grid-template-columns: none;
            column-gap: 0;
        }

        .alt_non_breakdown,
        .alt_breakdown {
            > div {
                padding: 8px 0;
                border-right: none;
                border-bottom: 1px solid var(--bg-light);

                &:last-of-type {
                    border: none;
                }
            }
        }
    }

    .alt_non_breakdown {
        display: none !important;
    }
}
</style>
