<template>
    <div>
            <h3>Assets</h3>
            <table>
                <thead>
                <tr>
                    <th>Code</th>
                    <th>Title</th>
                    <th>Balance</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="asset in assets" :key="asset.key">
                    <td>{{asset.key}}</td>
                    <td>{{asset.title}}</td>
                    <td>{{asset.balance}}</td>
                </tr>
                </tbody>
            </table>
    </div>
</template>
<script>
    export default {
        data(){
            return{
            }
        },
        computed: {
            assets(){
                return this.$store.state.assets;
            }
        }
    }
</script>
<style scoped>
    table{
        width: 100%;
    }

    table th{
        padding: 5px 20px;
        text-align: left;
    }

    table tbody td{
        padding: 20px 20px;
        text-align: left;
    }
</style>