<template>
    <div class="assets_view">
        <h2>ASSETS</h2>
        <div id="asset_cards">
            <asset-card class="asset_card" v-for="asset in assets" :key="asset.key" :asset="asset" @click="select(asset)" :selected="selected===asset.key"></asset-card>
        </div>
    </div>
</template>
<script>
    import AssetCard from "@/components/wallet/assets/AssetCard";
    export default {
        data(){
            return{
                selected: null,
                assets: [
                    {
                        title: "Bitcoin",
                        key: "BTC",
                    },
                    {
                        title: "Tether",
                        key: "TTH",
                    },
                    {
                        title: "Ethereum",
                        key: "ETH",
                    },
                    {
                        title: "Doge Coin",
                        key: "DGC",
                    },
                    {
                        title: "Kyber",
                        key: "KBC",
                    },
                    {
                        title: "Gun Coin",
                        key: "GNC",
                    },
                    {
                        title: "Collin Coin",
                        key: "CLC",
                    }
                ]
            }
        },
        methods: {
            select(asset){
                console.log("TO");
                this.selected = asset.key;
            }
        },
        components:{
            AssetCard
        }
    }
</script>
<style scoped>
    .assets_view{
        padding: 20px 0px;
    }
    #asset_cards{
        display: flex;
        flex-wrap: wrap;
    }
    .asset_card{
        background-color: #fff;
        border: 1px solid #eaeaea;
        margin: 30px;
        width: 240px;
        transition-duration: 0.2s;
        cursor: pointer;
        border-radius: 4px;
        flex-shrink: 0;
    }

    .asset_card:hover{
        border: none;
        background-color: #42b983;
        transform: scale3d(1.2,1.2,1);
        box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
    }
</style>