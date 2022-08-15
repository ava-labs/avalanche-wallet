<template>
    <div class="my_keys">
        <p class="label">{{ $t('keys.active_wallet') }}</p>
        <key-row
            v-if="activeWallet"
            :wallet="activeWallet"
            class="key_row"
            :is_default="true"
        ></key-row>
        <hr v-if="inactiveWallets.length > 0" />
        <p class="label" v-if="inactiveWallets.length > 0">Other Keys</p>
        <transition-group name="fade">
            <key-row
                v-for="wallet in inactiveWallets"
                :wallet="wallet"
                :key="wallet.id"
                class="key_row"
                @select="selectWallet"
                @remove="removeWallet(wallet)"
            ></key-row>
        </transition-group>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import KeyRow from '@/components/wallet/manage/KeyRow.vue'
import RememberKey from '@/components/misc/RememberKey.vue'
import { WalletType } from '@/js/wallets/types'

@Component({
    components: {
        KeyRow,
        RememberKey,
    },
})
export default class MyKeys extends Vue {
    selectWallet(wallet: WalletType) {
        this.$store.dispatch('activateWallet', wallet)
        this.$store.dispatch('History/updateTransactionHistory')
    }

    get account() {
        return this.$store.getters['Accounts/account']
    }

    async removeWallet(wallet: WalletType) {
        let msg = this.$t('keys.del_check') as string
        let isConfirm = confirm(msg)

        if (isConfirm) {
            await this.$store.dispatch('Accounts/deleteKey', wallet)
            await this.$store.dispatch('removeWallet', wallet)
            this.$store.dispatch('Notifications/add', {
                title: this.$t('keys.remove_success_title'),
                message: this.$t('keys.remove_success_msg'),
            })
        }
    }

    get inactiveWallets(): WalletType[] {
        let wallets = this.wallets

        let res = wallets.filter((wallet) => {
            if (this.activeWallet === wallet) return false
            return true
        })

        return res
    }

    get wallets(): WalletType[] {
        return this.$store.state.wallets
    }

    get activeWallet(): WalletType {
        return this.$store.state.activeWallet
    }
}
</script>
<style scoped lang="scss">
@use "../../../styles/main";

.default_key {
}

hr {
    border-top: 1px solid var(--bg-light);
    border-left: 1px solid var(--bg-light);
    border-right: 1px solid var(--bg-light);
    border-color: var(--bg-light) !important;
    margin: 12px 0;
}

.label {
    font-size: 13px;
    color: #999;
    font-weight: bold;
    padding: 2px 10px;
}
.key_row {
    background-color: var(--bg-light);
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 10px;
    transition-duration: 0.2s;
}

.my_keys {
    padding-top: 15px;
}
.addressItem {
    &[selected] {
    }
}

.volatile_cont {
    max-width: 380px;
    /*border-top: 1px solid #eee;*/
    margin-top: 20px;
    padding-top: 20px;
    /*display: grid;*/
    /*grid-template-columns: 1fr 1fr;*/
}

.remember_comp {
    /*padding: 20px 0;*/
}

.alert_box {
    /*margin: 0px 25px;*/
    font-size: 0.9rem;
}
</style>
<style lang="scss">
.volatile_cont {
    .v-expansion-panel {
        background-color: transparent !important;
    }

    .passwords input {
        background-color: #d2e9fd;
    }

    .v-expansion-panel-header,
    .v-expansion-panel-content__wrap {
        padding: 8px 0;
    }
}
</style>
