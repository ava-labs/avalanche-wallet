<template>
    <modal ref="modal" :title="title">
        <div class="export_body">
            <export-wallet @success="handleExportSuccess"></export-wallet>
        </div>
    </modal>
</template>

<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";
import Modal from "@/components/modals/Modal.vue";
import ExportWallet from "@/components/wallet/manage/ExportWallet.vue";

@Component({
    components: {
        Modal,
        ExportWallet
    }
})
export default class ExportKeys extends Vue {
    isActive: boolean = false;
    title: string = "Export Keys";

    open() {
        // @ts-ignore
        this.$refs.modal.open();
    }

    close() {
        this.isActive = false;
    }

    handleExportSuccess() {
        // @ts-ignore
        this.$refs.modal.close();
        this.close();
    }
}
</script>

<style scoped lang="scss">
@use '../../main';

.export_body {
    padding: 30px;
    width: 450px;
    min-height: 315px;
}

.close_but {
    position: absolute;
    top: 12px;
    right: 20px;
    background-color: transparent;
    border: none;
    outline: none;
    opacity: 0.2;

    &:hover {
        opacity: 1;
    }
}

.bg {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
}

.explain {
    text-align: center;
}

.but_primary {
    width: 80%;
    margin: 0px auto;
    padding: 8px 30px;
}

@include main.mobile-device {
    .export_body {
        width: 90vw;
    }
}
</style>

<style lang="scss">
@use '../../main';

.v-tab.v-tab {
    font-weight: 700;
}

.v-tabs-slider-wrapper {
    color: main.$secondary-color;
    caret-color: main.$secondary-color;
    height: 3px !important;
}
</style>
