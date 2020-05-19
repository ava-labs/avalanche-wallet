<template>
    <div>
        <div class="header">
            <h1>Assets</h1>
            <div>
                <button @click="tab='fungibles'" :active="tab===`fungibles`">Fungibles</button>
                <button @click="tab='collectibles'" :active="tab===`collectibles`">Collectibles</button>
            </div>
        </div>
        <div class="pages">
            <transition name="fade" mode="out-in">
                <fungibles v-if="tab===`fungibles`" key="fungibles"></fungibles>
                <collectibles v-else key="fungibles"></collectibles>
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
                tab: 'fungibles',
            }
        },
        components: {
            Fungibles,
            Collectibles
        }
    }
</script>
<style scoped lang="scss">
    @use '../../main';

    .header{
        display: flex;
        align-items: center;
        border-bottom: 2px solid transparent;

        /*justify-content: space-between;*/

        h1{
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


    .pages{
        margin-top: 30px;
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
            }
        }
    }


</style>
