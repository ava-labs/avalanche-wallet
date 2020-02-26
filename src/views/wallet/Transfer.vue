<template>
    <div>
        <div class="transfer_main">
            <div class="transfer_col" type="send">
                <send></send>
            </div>
            <div class="transfer_col" type="receive">
                <receive></receive>
            </div>
        </div>
    </div>
</template>
<script>
    import Send from '@/components/wallet/transfer/Send';
    import Receive from '@/components/wallet/transfer/Receive';
    export default {
        components: {
            Send,
            Receive
        },
    }
</script>
<style scoped>
    .transfer_main{
        display: grid;
        grid-template-columns: 50% 50%;
        color: #d2d2d2;
    }
    .transfer_col{
        background-color: #353535;
        min-height: 20px;
        padding: 15px 0px;
        margin: 0px 15px;
        border-radius: 5px;
    }


    @media only screen and (max-width: 600px) {
        .transfer_main{
            display: block;
        }

        .transfer_col{
            margin: 10px;
        }
    }

    @media only screen and (max-width: 1400px) {
        .transfer_main{
            display: block;
        }

        .transfer_col{
            margin: 10px;
        }
    }
</style>

<style>
    .transfer_main h4{
        font-size: 18px;
        padding-bottom: 10px;
        margin-bottom: 15px;
    }
    .transfer_col[type='send'] h4{
        border-bottom: 1px solid #d88383;
    }
    .transfer_col[type='receive'] h4{
        border-bottom: 1px solid #6ca771;
    }


    @media only screen and (max-width: 600px) {
        .transfer_main h4{
            font-size: 12px;
        }
    }
</style>