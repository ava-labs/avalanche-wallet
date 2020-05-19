<template>
    <div>
<!--        <div class="header">-->
<!--            <h4>Networks</h4>-->
<!--            <button>Add Custom</button>-->
<!--        </div>-->
        <div class="networks_list">
            <network-row v-for="net in networks" :key="net.name" class="network_row" :network="net"></network-row>
        </div>
    </div>
</template>
<script>
    import NetworkRow from './NetworkRow';

    export default {
        components:{
            NetworkRow
        },
        computed: {
            activeNetwork(){
                return this.$store.state.Network.selectedNetwork;
            },
            networks(){
                return this.$store.state.Network.networks;
            }
        }
    }
</script>
<style scoped lang="scss">


    .networks_list{
        padding: 0px 15px;
    }
</style>
