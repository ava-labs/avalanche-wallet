<template>
    <modal ref="modal" :title="title">
        <div class="add_key_body">
            <img src="@/assets/import_key_bg.png" class="bg" />
            <p class="explain">Add additional keys to use with your wallet.</p>
            <v-tabs
                color="#4C2E56"
                height="38"
                :grow="true"
                v-model="selectedTab"
                :show-arrows="false"
                :centered="true"
                :mobile-breakpoint="900"
            >
                <!--                <v-tab key="private">{{$t('private_key')}}</v-tab>-->
                <v-tab key="mnemonic">{{ $t('keys.import_key_option1') }}</v-tab>
                <v-tab key="keystore">{{ $t('keys.import_key_option2') }}</v-tab>
                <v-tab-item>
                    <AddMnemonic @success="handleImportSuccess"></AddMnemonic>
                </v-tab-item>
                <v-tab-item>
                    <add-key-file @success="handleImportSuccess"></add-key-file>
                </v-tab-item>
            </v-tabs>
        </div>
    </modal>
</template>

<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import Modal from '@/components/modals/Modal.vue'
import AddKeyFile from '@/components/wallet/manage/AddKeyFile.vue'
import AddKeyString from '@/components/wallet/manage/AddKeyString.vue'
import AddMnemonic from '@/components/wallet/manage/AddMnemonic.vue'
interface ITab {
    id: number
    name: string
}

@Component({
    components: {
        Modal,
        AddKeyFile,
        AddKeyString,
        AddMnemonic,
    },
})
export default class ImportKeys extends Vue {
    isActive: boolean = false
    title: string = ''
    selectedTab: string = ''
    created() {
        this.title = this.$t('keys.import_key_title') as string
    }

    open() {
        // @ts-ignore
        this.$refs.modal.open()
        this.selectedTab = 'private' // explicitly set v-model value for modal
    }

    close() {
        this.isActive = false
    }

    handleImportSuccess() {
        // @ts-ignore
        this.$refs.modal.close()
        this.close()
        this.$store.dispatch('Notifications/add', {
            title: this.$t('keys.import_key_success_title'),
            message: this.$t('keys.import_key_success_msg'),
        })
    }
}
</script>

<style scoped lang="scss">
@use '../../main';

.add_key_body {
    padding: 30px;
    max-width: 450px;
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
    display: block;
    max-height: 50px;
    object-fit: contain;
    width: 100%;
    //margin: 12px auto;
}

.explain {
    text-align: center;
    margin: 14px 0 !important;
}

@include main.mobile-device {
    .add_key_body {
        max-width: 100%;
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
