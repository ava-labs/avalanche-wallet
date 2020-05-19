<template>
    <div class="network_menu" :connected="isConnected">
        <div class="toggle_but" @click="toggleMenu">
            <img src="@/assets/network_off.png" v-if="!isConnected">
            <img src="@/assets/network_on.png" v-else>
            <button v-if="isConnected">{{activeNetwork.name}}</button>
            <button v-else>Disconnected</button>
        </div>
        <transition name="fade">
            <div class="network_body" v-if="isActive">
                <div class="header">
                    <template v-if="page==='list'">
                        <h4>Networks</h4>
                        <button @click="viewCustom">Add Custom</button>
                    </template>
                    <template v-else>
                        <h4>Add Custom Network</h4>
                        <button @click="viewList">cancel</button>
                    </template>
                </div>

                <transition name="fade" mode="out-in">
                    <ListPage v-if="page==='list'"></ListPage>
                    <CustomPage v-else></CustomPage>
                </transition>

            </div>
        </transition>
    </div>
</template>
<script>
    import NetworkRow from './NetworkRow';
    import CustomPage from './CustomPage';
    import ListPage from './ListPage';
    export default {
        components: {
            ListPage,
            NetworkRow,
            CustomPage
        },
        data(){
            return{
                page: 'list',
                isActive: false
            }
        },
        methods: {
            viewCustom(){
                this.page = 'custom';
            },
            viewList(){
                this.page = 'list';
            },
            toggleMenu(){
                this.isActive = !this.isActive;
            }
        },
        computed: {
            isConnected(){
                return this.activeNetwork!==null;
            },
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

    .network_menu{
        position: relative;
    }

    .toggle_but{
        display: flex;
        color: #C4C4C4;
        min-width: 140px;
        margin-right: 30px;
        img{
            max-height: 24px;
            object-fit: contain;
            margin-right: 5px;
        }
    }

    .network_body{
        position: absolute;
        border: 1px solid #999;
        border-radius: 4px;
        width: 340px;
        bottom: -20px;
        right: 0;
        background-color: #fff;
        transform: translateY(100%);
    }

    .header{
        border-bottom: 1px solid #EAEDF4;
        padding: 10px 15px;
        display: flex;
        h4{
            flex-grow: 1;
        }

        button{
            background-color: #2960CD;
            color: #fff;
            font-size: 12px;
            padding: 3px 14px;
            border-radius: 4px;
        }
    }


    .network_menu[connected]{
        .toggle_but{
            color: #2960CD;
        }
    }

</style>
