<template>
    <modal ref="modal" title="Check Your Ledger Device" :can_close="false">
        <div class="ledger_block">
            <p style="margin-bottom: 14px !important; font-size: 18px;">Please confirm this action on your ledger device.</p>
            <p class="message">{{message}}</p>
        </div>
    </modal>
</template>
<script lang="ts">
import 'reflect-metadata';
import {Vue, Component, Prop, Watch} from 'vue-property-decorator';

import Modal from './Modal.vue';

@Component({
    components: {
        Modal,
    }
})
export default class MainnetAddressModal extends Vue{
    @Prop() message!: string;
    open(){
        // @ts-ignore
        this.$refs.modal.open();
    }
    close(){
        // @ts-ignore
        this.$refs.modal.close();
    }
}
</script>
<style scoped lang="scss">
.ledger_block{
    pointer-events: none;
    padding: 30px;
    text-align: center;
}

.message{
    padding: 12px;
    color: var(--primary-color);
    background-color: var(--bg-wallet);
}

</style>
