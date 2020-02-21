<template>
    <div class="subcards">
        <backup-export></backup-export>
        <backup-import></backup-import>
<!--        <div class="card_header">-->
<!--            <h4>Export Key File</h4>-->
<!--            <p>Download you keys in a password encrypted file. </p>-->
<!--            <v-text-field type="password" hint="Minimum 9 characters." label="Password" persistent-hint></v-text-field>-->
<!--            <v-btn depressed>Download</v-btn>-->
<!--        </div>-->

    </div>
</template>
<script>
    import BackupExport from './BackupExport';
    import BackupImport from './BackupImport';

    export default {
        components: {
            BackupExport,
            BackupImport
        }
    }
</script>
<style scoped>
    .subcards{
        /*display: grid;*/
        /*grid-template-columns: 1fr 1fr;*/
        /*grid-gap: 25px;*/
    }

</style>
<style>
    .subcards > div{
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }

    .subcards > div > p{
        flex-grow: 1;
    }

    .subcards .v-btn{
        margin-top: 15px;
        color: #fff;
    }
</style>