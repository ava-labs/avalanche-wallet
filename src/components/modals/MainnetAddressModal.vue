<template>
    <modal ref="modal" :title="$t('modal.mainnet.title')">
        <div class="mainnet_body">
            <p style="margin-bottom: 14px !important; font-size: 18px;">{{$t('modal.mainnet.desc')}}</p>
            <p class="addr">{{address}}</p>
        </div>
    </modal>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import {Vue, Component, Prop, Watch} from 'vue-property-decorator';

    import Modal from './Modal.vue';
    import CopyText from "../misc/CopyText.vue";
    import {AVMKeyChain, AVMKeyPair} from "avalanche/dist/apis/avm";
    import AvaHdWallet from "@/js/AvaHdWallet";
    import {getPreferredHRP} from "avalanche/dist/utils";

    @Component({
        components: {
            Modal,
            CopyText
        }
    })
    export default class MainnetAddressModal extends Vue{
        open(){
            // @ts-ignore
            this.$refs.modal.open();
        }

        get address(){
            let wallet: AvaHdWallet = this.$store.state.activeWallet;
            if(!wallet){
                return '-'
            }
            let key = wallet.externalHelper.getKeyForIndex(0);

            let keychain = new AVMKeyChain(getPreferredHRP(1),'X');
            let mainnetKey = keychain.importKey(key.getPrivateKey());
            return mainnetKey.getAddressString();
        }

    }
</script>
<style scoped lang="scss">
    .mainnet_body{
        padding: 30px;
        text-align: center;
    }

    .addr{
        padding: 12px;
        background-color: var(--bg-wallet);
    }

</style>
