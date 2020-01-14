<template>
    <modal ref="modal">
        <v-tabs grow>
            <v-tab>Send</v-tab>
            <v-tab>Receive</v-tab>
            <v-tab-item>
                <send></send>
            </v-tab-item>
            <v-tab-item>
                <receive></receive>
            </v-tab-item>
        </v-tabs>
    </modal>
</template>
<script>
    import Modal from "./Modal";
    import Send from './SendReceive/Send';
    import Receive from './SendReceive/Receive';

    export default {
        components: {
            Modal,
            Send,
            Receive
        },
        methods: {
            open(){
                this.$refs.modal.open();
            }
        },
        mounted(){
            this.$store.state.modals['send_receive'] = this;
        }
    }
</script>
<style scoped>
    .v-tab{
        background-color: #1f1f1f;
        color: #d2d2d2 !important;
    }

    .v-tab-item{
        background-color: #333333 !important;
    }
</style>
