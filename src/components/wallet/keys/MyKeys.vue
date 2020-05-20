<template>
    <div>
        <transition-group name="fade">
            <key-row v-for="addr in addresses"
                     :key="addr"
                     :address="addr"
                     :selected="selected === addr"
                     :can-remove="addresses.length > 1"
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
            KeyRow
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
            }
        },
        computed: {
            selected(){
                return this.$store.state.selectedAddress;
            },
            addresses(){
                return this.$store.state.addresses;
            },
            balance(){
                return this.$store.state.Assets.assetsDict;
            },

        }
    }
</script>
<style scoped lang="scss">
    .addressItem {
        border: 1px solid #ddd;
        margin: 15px 0px;
        border-radius: 14px;
        transition-duration: 0.2s;

        &[selected]{
            border-color: #866FBE;
            background-color: #EBE4FB;
        }
    }


</style>
