<template>
    <div class="my_keys">
        <v-alert type="info" v-if="rememberKey" text>
            Your private keys are remembered until you close this tab or logout of your wallet.
        </v-alert>
        <key-row :address="selected"
                 class="key_row"
                 :is_default="true"
        ></key-row>
        <hr>
        <transition-group name="fade">
            <key-row v-for="addr in addresses"
                     :key="addr"
                     :address="addr"
                     class="key_row"
                     @select="selectKey"
                     @remove="removeKey"
            ></key-row>
        </transition-group>
    </div>
</template>
<script>
    import KeyRow from "@/components/wallet/keys/KeyRow";

    export default {
        components: {
            KeyRow,
        },
        methods: {
            selectKey(addr){
                this.$store.commit('selectAddress', addr);
            },
            removeKey(addr){

                let msg = this.$t('keys.del_check');
                let isConfirm = confirm(msg);

                if(isConfirm){
                    this.$store.dispatch('removeKey', addr)
                }

                if(this.rememberKey){
                    this.$store.dispatch('saveKeys');
                }
            }
        },
        computed: {
            rememberKey(){
                return this.$store.state.rememberKey;
            },
            selected(){
                return this.$store.state.selectedAddress;
            },
            // non default addresses
            addresses(){
                let res = [];
                let allAddr = this.$store.state.addresses;

                for(var i=0; i<allAddr.length; i++){
                    let addr = allAddr[i];
                    if(addr !== this.selected){
                        res.push(addr);
                    }
                }
                return res;
            },
            balance(){
                return this.$store.state.Assets.assetsDict;
            },

        }
    }
</script>
<style scoped lang="scss">

    .default_key{

    }


    .key_row{
        background-color: #F5F6FA;
        padding: 15px;
        border-radius: 2px;
        margin-bottom: 10px;
        transition-duration: 0.2s;
    }

    .my_keys{
        padding-top: 15px;
    }
    .addressItem {
        /*border-bottom: 1px solid #EAEDF4;*/
        /*border-radius: 14px;*/


        &[selected]{
            /*border-color: #2960CD;*/
            /*background-color: #edf3ff;*/
        }
    }


</style>
