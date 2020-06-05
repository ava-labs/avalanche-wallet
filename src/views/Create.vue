<template>
    <div class="access_view">
        <create-wallet></create-wallet>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';

    import CreateWallet from '@/components/CreateWalletWorkflow/CreateWallet.vue';
    @Component({
        components: {
            CreateWallet,
        }
    })
    export default class Create extends Vue{

    }
</script>
<style scoped lang="scss">
    .access_view{
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .card{
        text-align: center;
    }

    .generate{
        display: block;
        margin: 30px auto;
        background-color: #000;
        padding: 8px 18px;
        border-radius: 6px;
        color: #fff !important;
    }

    .key_disp{
        margin: 30px auto;
        font-size: 12px;
    }

    a{
        color: #1D82BB !important;
    }
</style>
