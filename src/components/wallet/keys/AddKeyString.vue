<template>
    <div>
        <label>{{$t('advanced.paper.pk')}}</label>
        <qr-input @change="qr_change" v-model="pk" class="qrIn"></qr-input>
        <v-btn
                class="addKeyBut"
                depressed
                @click="addKey"
                color="#2960CD"
                :disabled="!canAdd"
                block
        >Add Private Key</v-btn>
    </div>
</template>
<script>
    import { QrInput } from '@avalabs/vue_components';
    import {bintools, keyChain} from "@/AVA";

    export default {
        components: {
            QrInput
        },
        data(){
            return {
                pk: "",
                canAdd: false,
            }
        },
        methods: {
            qr_change(val){
                // this.pk = val;
                if(this.pk.length>10){
                    this.canAdd = true
                }else{
                    this.canAdd = false;
                }
            },
            addKey(){
                let parent = this;
                console.log("adding key: ",this.pk);

                this.$store.dispatch('addKey', this.pk).then(() => {
                    parent.pk = "";
                });
            }
        }
    }
</script>
<style scoped>
    .addKeyBut{
        color: #fff;
        text-transform: none;
        border-radius: 2px;
    }

    label{
        color: #909090;
        font-size: 12px;
    }

    /*.qrIn{*/
    /*    border: 1px solid #888;*/
    /*    border-radius: 4px;*/
    /*    background-color: #fff;*/
    /*    */
    /*}*/

    .qrIn{
        border-radius: 2px !important;
        height: 40px;
        font-size: 12px;
        background-color: #F5F6FA;
        /*border: 1px solid #ddd;*/
    }
</style>
