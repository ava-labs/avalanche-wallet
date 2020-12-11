<template>
    <modal ref="modal" :title="$t('modal.mainnet.title')">
        <div class="mainnet_body">
            <p style="margin-bottom: 14px !important; font-size: 18px">
                {{ $t('modal.mainnet.desc') }}
            </p>
            <p class="addr">{{ address }}</p>
        </div>
    </modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

import Modal from './Modal.vue'
import CopyText from '../misc/CopyText.vue'
import { KeyChain as AVMKeyChain, KeyPair as AVMKeyPair } from 'avalanche/dist/apis/avm'
import AvaHdWallet from '@/js/wallets/AvaHdWallet'
import { getPreferredHRP } from 'avalanche/dist/utils'
import { LedgerWallet } from '@/js/wallets/LedgerWallet'
import { avm, bintools } from '@/AVA'

@Component({
    components: {
        Modal,
        CopyText,
    },
})
export default class MainnetAddressModal extends Vue {
    open() {
        // @ts-ignore
        this.$refs.modal.open()
    }

    get address() {
        let wallet: AvaHdWallet | LedgerWallet = this.$store.state.activeWallet
        if (!wallet) {
            return '-'
        }
        let hrp = getPreferredHRP(1)
        let address = wallet.externalHelper.getAddressForIndex(0)
        let addrRaw = bintools.parseAddress(address, 'X')
        let addrMainnet = bintools.addressToString(hrp, 'X', addrRaw)

        return addrMainnet
    }
}
</script>
<style scoped lang="scss">
.mainnet_body {
    padding: 30px;
    text-align: center;
}

.addr {
    padding: 12px;
    background-color: var(--bg-wallet);
}
</style>
