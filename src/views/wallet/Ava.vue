<template>
    <div class="ava_view">
        <div class="floaters">
            <assets class="assets floater"></assets>
            <send-receive class="send_receive"></send-receive>
        </div>
    </div>
</template>
<script>
    import Assets from "@/components/wallet/ava/Assets";
    import SendReceive from '../../components/wallet/ava/SendReceive';

    export default {
        components: {
            Assets,
            SendReceive
        },
    }
</script>
<style scoped>
    .ava_view{
        padding: 50px;
    }

    .floaters{
        display: flex;
    }



    .floaters > div{

    }

    .assets{
        flex-grow: 1;
        overflow: hidden;
        background-color: #fff;
    }



    .send_receive{
        flex-basis: 320px;
        display: flex;
        flex-direction: column;
    }
</style>
<style>
    .floater{
        min-height: 20px;
        border-radius: 4px;
        margin: 20px;
        height: max-content;
        box-shadow: 9px 6px 10px rgba(0,0,0,0.2);
        background-color: #fff;
    }

    .floater h3{
        font-size: 16px;
        padding: 12px;
        background-color: #cbceda;
    }
</style>