<template>
    <div class="home_view">
        <div class="header">
            <h1>Assets</h1>
            <div>
                <button @click="tab='fungibles'" :active="tab===`fungibles`">Fungibles</button>
                <button @click="tab='collectibles'" :active="tab===`collectibles`">Collectibles</button>
            </div>
            <div style="flex-grow: 1"></div>
            <div class="search">
                <img src="@/assets/search.png">
                <input placeholder="Search assets.." v-model="search">
            </div>
        </div>
        <div class="pages">
            <transition name="fade" mode="out-in">
                <fungibles v-if="tab===`fungibles`" key="fungibles" :search="search"></fungibles>
                <collectibles v-else key="fungibles" :search="search"></collectibles>
            </transition>
        </div>


    </div>
</template>
<script>
    import Fungibles from '@/components/wallet/home/Fungibles';
    import Collectibles from '@/components/wallet/home/Collectibles';
    export default {
        data(){
            return {
                search: "",
                tab: 'fungibles',
            }
        },
        components: {
            Fungibles,
            Collectibles
        },
        watch: {
            tab(){
                this.search = "";
            }
        }
    }
</script>
<style scoped lang="scss">
    @use '../../main';


    .home_view{
        display: grid;
        grid-template-rows: max-content 1fr;
    }
    .header{
        display: flex;
        align-items: center;
        border-bottom: 2px solid transparent;
        flex-wrap: nowrap;
        white-space: nowrap;

        /*justify-content: space-between;*/

        h1{
            font-weight: normal;
            margin-right: 30px;
        }

        button{
            padding: 8px 24px;
            /*border-radius: 4px;*/
            font-size: 14px;
            font-weight: bold;
            /*transition-duration: 0.2s;*/
            /*background-color: #E7E7E7;*/
            margin: 0px 5px;


            &[active]{
                /*background-color: #000;*/
                color: #2960CD;
                border-bottom: 3px solid #2960CD;
            }
        }
    }

    .search{
        background-color: #F5F6FA;
        border-radius: 4px;
        /*flex-grow: 1;*/
        height: 46px;
        padding: 5px;
        display: flex;
        align-items: center;
        font-size: 13px;
        flex-basis: 420px;
        flex-shrink: 1;


        img{
            border-radius: 4px;
            padding: 10px 0px;
            background-color: #fff;
            height: 100%;
            object-fit: contain;
        }

        input{
            padding: 0px 16px;
            outline: none;
            flex-grow: 1;

            &::placeholder{
                color: #B3B7D3;
            }
        }
    }

    .pages{
        /*margin-top: 30px;*/
    }

    @media only screen and (max-width: main.$mobile_width) {
        .header{
            display: block;


            >div{
                overflow: hidden;
                display: flex;
            }
            button{
                flex-grow: 1;
                border-radius: 0px;
                margin: 0;
                font-size: 12px;
            }
        }

        .search{
            margin: 15px 0px;
        }

        .pages{
            /*min-height: 100vh;*/
            padding-bottom: 30px;
        }
    }

    @include main.medium-device {
        .header{
            flex-wrap: wrap;
        }

        .search{
            margin: 15px 0px;
            flex-basis: 100%;
        }
    }
</style>
