<template>
    <div class="network_row" :active="isSelected">
        <img src="@/assets/network_ava.png">
        <div class="name_col">
            <p class="name">{{network.name}}</p>
            <p class="url">{{endpoint}}</p>
        </div>
        <div class="stat_col">
            <button  @click="select" v-if="!isSelected">Select</button>
            <p v-else>Connected</p>
        </div>
    </div>
</template>
<script>
    export default {
        props: {
            network: {
                type: Object,
                required: true
            }
        },
        computed:{
            endpoint(){
                let net = this.network;
                return `${net.protocol}://${net.url}:${net.port}`
            },
            isSelected(){
                if(this.network === this.$store.state.Network.selectedNetwork){
                    return true;
                }
                return false;
            }
        },
        methods: {
            async select(){
                await this.$store.dispatch('Network/setNetwork', this.network)
            }
        }
    }
</script>
<style scoped lang="scss">
    .stat_col{
        font-size: 12px;
        color: #2960CD;
        text-align: right;
    }

    .network_row{
        padding: 12px 0px;
        display: grid;
        grid-template-columns: 40px 1fr 80px;
        column-gap: 15px;
        border-bottom: 1px solid #EAEDF4;

        > *{
            align-self: center;
        }
    }
    img{
        width: 100%;
        object-fit: contain;
    }
    .network_row[active]{
        .stat_col{
            color: #5ECB08 !important;
        }
    }
    .name_col{
        line-height: 1em;
        word-break: break-word;
        /*overflow: auto;*/
        /*text-overflow: ellipsis;*/

    }



    .url{
        color: #909090;
        font-size: 12px;
    }
</style>
