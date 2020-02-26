<template>
    <div>
<!--            <h3>Assets</h3>-->
        <div class="table_bg">
            <div class="tabletop">
                <h4>{{$t('assets.title')}}</h4>
                <img v-if="isUpdateBalance" src="/gif/loading_2.gif">
                <button v-else @click="updateAssets"><fa icon="sync"></fa></button>
            </div>
            <div v-if="assets.length === 0" class="noassets">
                <p>{{$t('assets.empty')}}</p>
            </div>
            <table v-else>
                <thead>
                <tr>
                    <th>Asset</th>
                    <th>Balance</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="asset in assets" :key="asset.id">
                    <td class="col_0">{{asset.symbol}}<br><span>{{asset.name}}</span></td>
                    <td class="col_1">{{asset.toString()}}</td>
                </tr>
                </tbody>
            </table>
        </div>

    </div>
</template>
<script>
    export default {
        data(){
            return{
                crypto_view: 'AVA'
            }
        },
        computed: {
            assets(){
                return this.$store.getters['Assets/assetsArray'];
            },
            isUpdateBalance(){
                return this.$store.state.Assets.isUpdateBalance;
            },
        },
        methods: {
            updateAssets(){
                this.$store.dispatch('Assets/updateUTXOs');
            }
        },

    }
</script>
<style scoped>
    .tabletop{
        text-align: left;
        padding: 8px 15px;
        display: flex;
        background-color: #6ca7a7;
        color: #fff;
    }

    .table_bg{
        color: #444;
        background-color: #fff;
    }

    .tabletop img{
        height: 24px;
        width: 24px;
        object-fit: contain;
    }
    .tabletop h4{
        flex-grow: 1;
    }

    .noassets{
        padding: 15px;
    }
    .noassets p{
        margin: 0;
    }

    table{
        width: 100%;
        /*min-width: 50%;*/
        border-collapse: collapse;
    }

    table th{
        padding: 5px 20px;
        text-align: left;
    }

    table thead{
        display: none;
        border-bottom: 1px solid #909090;
    }

    table tbody td{
        /*padding: 20px 20px;*/
        padding: 4px 6px;
        text-align: left;
        font-size: 13px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        word-break: break-all;
        max-width: 200px;

        /*border-bottom: 1px solid #3a3a3a;*/

    }

    td button{
        outline: none;
        border: 1px solid #a0a0a0;
        color: #a0a0a0;
        margin: 4px;
        padding: 2px 8px;
        border-radius: 4px;
    }
    td button:hover{
        border-color: #fff;
        color: #fff;
    }


    table .col_0{
        padding-left: 30px;
    }

    .col_0 span{
        font-size: 12px;
        font-weight: bold;
    }

    table .col_1{
        text-align: right;
        padding-right: 30px;
    }

    .asset_code{
        font-weight: bold;
    }

    .buts a{
        color: #ddd;
        border: 1px solid #a0a0a0 !important;
        margin: 4px;
        font-size: 11px;
        background-color: transparent;
    }

    .cryptoToggle{
        cursor: pointer;
        text-decoration: underline;
    }


    @media only screen and (max-width: 600px) {
        table th {
            font-size: 12px;
            text-align: center;
        }
        /*table tbody td {*/
        /*    font-size: 12px;*/
        /*    padding: 8px 0px;*/
        /*    text-align: center;*/
        /*}*/


        th.buts,td.buts{
            padding: 0;
            display: none;
            /*display: block;*/
        }
    }
</style>