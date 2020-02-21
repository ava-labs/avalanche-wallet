<template>
    <div>
        <h2>Advanced</h2>
        <div class="card_body">
            <div class="section">
                <h4>Scan Paper Wallet <span><fa icon="qrcode"></fa></span></h4>
                <scan-wallet></scan-wallet>
            </div>
            <hr>
            <div class="section">
                <h4>Backup Wallet <span><fa icon="download"></fa></span></h4>
                <BackupWallet></BackupWallet>
            </div>
        </div>
    </div>
</template>
<script>
    import ScanWallet from "@/components/wallet/advanced/ScanWallet";
    import BackupWallet from "@/components/wallet/advanced/BackupWallet";
    export default {
        components: {
            ScanWallet,
            BackupWallet
        }

    }
</script>
<style scoped>
    h4{
        display: block;
        text-align: left;
        font-size: 17px;
        font-weight: bold;
        margin-bottom: 8px;
    }

    h4 span{
        float: right;
    }

    .section{
        padding: 20px 0;
    }
</style>