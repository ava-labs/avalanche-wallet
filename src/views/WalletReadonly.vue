<template>
    <div class="content">
        <template v-if="isLoading">
            <Spinner style="width: 40px" class="_spin"></Spinner>
            <p>Loading Wallet</p>
        </template>
        <div v-if="!isLoading" class="wallet_body">
            <Balances
                :balances="balances"
                :stake-amt="stakeAmt"
                class="balances section"
            ></Balances>
            <div class="">
                <v-btn
                    depressed
                    class="button_secondary"
                    small
                    @click="downloadRewardsHistory"
                    :loading="isStakeDownloading"
                    disabled
                >
                    Download Staking History
                </v-btn>
            </div>
            <v-btn @click="logout" small style="margin-top: 1em" depressed>Logout</v-btn>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import {
    PublicMnemonicWallet,
    iAvaxBalance,
    BN,
    createCsvNormal,
    createCsvStaking,
    ethersProvider,
    getTransactionSummary,
    parseStakingTxs,
    HistoryItemType,
    isHistoryStakingTx,
} from '@avalabs/avalanche-wallet-sdk'
import { UTXOSet as AVMUTXOSet } from 'avalanche/dist/apis/avm'
import { UTXOSet as PlatformUTXOSet, TransferableOutput } from 'avalanche/dist/apis/platformvm'
import Balances from '@/views/wallet_readonly/Balances.vue'
import { downloadCSVFile } from '@/store/modules/history/history_utils'
import Addresses from '@/views/wallet_readonly/Addresses.vue'
import Spinner from '@/components/misc/Spinner.vue'
import { Network } from 'avalanche/dist/utils'
import { getPriceAtUnixTime } from '@/helpers/price_helper'
// import {ethers} from "ethers";
@Component({
    components: { Spinner, Addresses, Balances },
})
export default class WalletReadonly extends Vue {
    isWalletLoading = true
    isBalanceLoading = false
    isStakeDownloading = false

    balances: iAvaxBalance | null = null
    stakeAmt: BN | null = null
    addressX = ''
    addressP = ''
    addressC = ''
    utxosX: null | AVMUTXOSet = null
    utxosP: null | PlatformUTXOSet = null
    stakeOuts: null | TransferableOutput[] = null

    get wallet(): PublicMnemonicWallet {
        //@ts-ignore
        return this.$route.params.wallet
    }

    get evmAddress(): string {
        //@ts-ignore
        return this.$route.params.evmAddress
    }
    updateAddresses() {
        this.addressX = this.wallet.getAddressX()
        this.addressP = this.wallet.getAddressP()
        this.addressC = this.wallet.getAddressC()
    }

    async updateBalance() {
        this.isBalanceLoading = true
        this.utxosX = await this.wallet.updateUtxosX()
        this.utxosP = await this.wallet.updateUtxosP()
        await this.wallet.updateAvaxBalanceC()

        const avaxBalance = this.wallet.getAvaxBalance()
        this.balances = avaxBalance

        const cBal = await ethersProvider.getSigner(this.evmAddress).getBalance('latest')
        avaxBalance.C = new BN(cBal.toString())

        const { staked, stakedOutputs } = await this.wallet.getStake()
        this.stakeAmt = staked
        this.stakeOuts = stakedOutputs
        this.isBalanceLoading = false
    }

    async downloadAvaxHistory() {
        const hist = await this.wallet.getHistory()
        const csvContent = createCsvNormal(hist)
        const encoding = 'data:text/csv;charset=utf-8,'
        downloadCSVFile(encoding + csvContent, 'avax_transfers')
    }

    async downloadRewardsHistory() {
        try {
            this.isStakeDownloading = true
            // const hist = await this.wallet.getHistory()
            const hist = await this.wallet.getHistoryP()
            let parsed: HistoryItemType[] = []

            for (let i = 0; i < hist.length; i++) {
                const tx = hist[i]
                try {
                    const summary = await getTransactionSummary(
                        tx,
                        this.wallet.getAllAddressesPSync(),
                        this.evmAddress
                    )
                    parsed.push(summary)
                } catch (e) {
                    console.log('Error parsing transaction: ', tx.id)
                    console.log(e)
                }
            }

            parsed = parsed.map((item) => {
                if (isHistoryStakingTx(item)) {
                    let unixTime = item.stakeEnd.getTime()
                    let price = getPriceAtUnixTime(unixTime)
                    return {
                        ...item,
                        avaxPrice: price,
                    }
                } else {
                    return item
                }
            })

            const csvContent = createCsvStaking(parsed)
            const encoding = 'data:text/csv;charset=utf-8,'
            const fileName = `avax_staking_txs_${new Date().toLocaleDateString()}`
            downloadCSVFile(encoding + csvContent, fileName)
        } catch (e) {
            this.isStakeDownloading = false
            this.$store.dispatch('Notifications/add', {
                type: 'error',
                title: 'Request Failed',
                message: 'Failed to download rewards history.',
            })
            console.log(e)
        }
        this.isStakeDownloading = false
    }

    created() {
        if (!this.wallet) {
            this.logout()
        }
    }

    logout() {
        this.$router.push('/access')
    }
    mounted() {
        this.init()
    }

    destroyed() {
        this.wallet.destroy()
    }

    init() {
        this.isWalletLoading = true
        this.wallet.resetHdIndices().then(() => {
            this.updateAddresses()
            this.isWalletLoading = false
            this.updateBalance()
        })
    }

    get isLoading() {
        return this.isWalletLoading || this.isBalanceLoading
    }

    get network(): Network | null {
        return this.$store.state.Network.selectedNetwork
    }

    @Watch('network')
    onNetworkChange() {
        this.init()
    }
}
</script>
<style scoped lang="scss">
.wallet_body {
    display: flex;
    flex-direction: column;
}

.content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.section {
    border: 1px solid var(--primary-color-light);
    border-radius: 1em;
    padding: 1em;
    margin-bottom: 1em;
}

._spin {
    width: 40px;
    height: 40px;
    font-size: 25px;
}
</style>
