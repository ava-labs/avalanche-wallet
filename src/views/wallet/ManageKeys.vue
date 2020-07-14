<template>
    <div>
        <div>
            <div class="card_body">
                <header>
                    <h1>My Keys</h1>
                    <div class="button_container">
                        <button class="but_primary ava_button_secondary" @click="importKeys">
                            <fa icon="download"></fa>
                            Import Keys
                        </button>
                        <ImportKeys ref="import"></ImportKeys>
                        <button class="but_primary ava_button_secondary" @click="exportKeys">
                            <fa icon="upload"></fa>
                            Export Keys
                        </button>
                        <ExportKeys ref="export"></ExportKeys>
                    </div>
                </header>
                <my-keys></my-keys>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';
    import MyKeys from "@/components/wallet/manage/MyKeys.vue";
    import ImportKeys from "@/components/modals/ImportKeys.vue";
    import ExportKeys from "@/components/modals/ExportKeys.vue";

    @Component({
        components: {
            MyKeys,
            ImportKeys,
            ExportKeys
        }
    })
    export default class ManageKeys extends Vue {

        importKeys(){
            // @ts-ignore
            this.$refs.import.open();
        }

        exportKeys(){
            // @ts-ignore
            this.$refs.export.open();
        }

    }
</script>
<style scoped lang="scss">
    @use '../../main';

    header {
        display: flex;
        align-items: center;
        justify-content: space-between;

    }
    
    h1 {
        font-weight: lighter;
    }
</style>
