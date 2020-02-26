<template>
    <div>
        <h2>{{$t('advanced.title')}}</h2>
        <div class="card_body">
            <div class="section">
                <h4>{{$t('advanced.paper.title')}} <span><fa icon="qrcode"></fa></span></h4>
                <scan-wallet></scan-wallet>
            </div>
            <hr>
            <div class="section">
                <h4>{{$t('advanced.export.title')}} <span><fa icon="download"></fa></span></h4>
                <BackupExport></BackupExport>
            </div>
            <hr>
            <div class="section">
                <h4>{{$t('advanced.import.title')}} <span><fa icon="upload"></fa></span></h4>
                <BackupImport></BackupImport>
            </div>

        </div>
    </div>
</template>
<script>
    import ScanWallet from "@/components/wallet/advanced/ScanWallet";
    // import BackupWallet from "@/components/wallet/advanced/BackupWallet";

    import BackupExport from "@/components/wallet/advanced/BackupExport";
    import BackupImport from "@/components/wallet/advanced/BackupImport";
    export default {
        components: {
            ScanWallet,
            // BackupWallet,
            BackupExport,
            BackupImport
        }

    }
</script>
<style scoped>
    h4{
        display: block;
        text-align: left;
        font-size: 25px;
        font-weight: bold;
        margin-bottom: 8px;
        border-left: 3px solid #42b983;
        padding-left: 12px;
    }

    h4 span{
        float: right;
    }

    hr{
        opacity: 0.2;
    }
    .section{
        padding: 40px 0;
    }
</style>