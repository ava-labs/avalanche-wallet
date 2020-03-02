<template>
    <div>
        <p>{{$t('advanced.paper.desc')}}</p>
        <label>{{$t('advanced.paper.pk')}}</label>
        <qr-input @change="qr_change" v-model="pk"></qr-input>
        <v-btn
                class="addKeyBut"
                depressed
                @click="addKey"
                color="#42b983"
                :disabled="!canAdd"
        >{{$t('advanced.paper.submit')}}</v-btn>
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
    }
</style>