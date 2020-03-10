<template>
    <div class="qr_input">
        <QRReader class="readerIn" @change="change"><button>
                <fa icon="camera"></fa>
            </button></QRReader>
        <input type="text" class="pk_in" placeholder="00000AVA00000"
               v-model="pk" @input="oninput">
<!--        <v-text-field-->
<!--                class="pk_in"-->
<!--                placeholder="00000AVA00000"-->
<!--                color="#333"-->
<!--                hide-details-->
<!--                v-model.trim="pk"-->
<!--                autocomplete="off"-->
<!--                single-line-->
<!--                @input="oninput"-->
<!--        ></v-text-field>-->
    </div>
</template>
<script>
    // import QRReader from "@/components/misc/QRReader";
    import QRReader from "@avalabs/qr_reader";

    // console.log(QRReader);
    export default {
        components: {
            QRReader
        },
        data(){
            return {
                pk: "",
            }
        },
        props: {
            value: String
        },
        watch: {
            value(val){
                this.pk = val;
            }
        },
        model:{
            prop: 'value',
            event: 'change',
        },
        mounted() {
            this.pk = this.value;
        },
        methods: {
            change(val){
                this.pk = val;
                this.emit();
            },
            oninput(){
                this.pk = this.pk.trim();
                this.emit();
            },
            emit(){
                this.$emit('change', this.pk);
            }
        }
    }
</script>
<style scoped>
    .qr_input{
        display: flex;
        align-items: center;
        color: #333;
        height: 45px;
        background-color: #f8f8f8;
        margin-bottom: 8px;
        /*padding: 0px 12px;*/
        /*padding-left: 0px;*/
    }

    .qr_input button{
        font-size: 19px;
        height: 100%;
        padding-right: 12px;
        padding-left: 12px;
        border-right: 1px solid #d2d2d2;
        text-align: center;
        pointer-events: none;
        opacity: 0.7;
        /*opacity: 0.7;*/
    }

    /*.qr_input button:hover{*/
    /*    opacity: 1;*/
    /*}*/

    .readerIn{
        height: 100%;
    }

    .pk_in{
        outline: none;
        text-align: center;
        width: 100%;
        margin: 0;
        padding: 0px 12px;
    }

    /*.pk_in >>> input::placeholder{*/
    /*    color: #3336 !important;*/
    /*}*/

    /*.pk_in >>> input{*/
    /*    color: #333 !important;*/
    /*    text-align: center;*/
    /*}*/
    /*.pk_in >>> .v-input__slot::before{*/
    /*    display: none;*/
    /*    border-color: #d2d2d240 !important;*/
    /*}*/
</style>