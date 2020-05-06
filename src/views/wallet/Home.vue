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
    .header{
        display: flex;
        align-items: center;

        h1{
            margin-right: 30px;
        }

        button{
            padding: 8px 24px;
            border-radius: 4px;
            font-size: 14px;
            transition-duration: 0.2s;
            background-color: #E7E7E7;
            margin: 0px 5px;


            &[active]{
                background-color: #000;
                color: #fff;
            }
        }
    }


    .pages{
        margin-top: 30px;
    }


</style>
