<template>
    <div class="qr_input">
        <QRReader @change="change"><button>
                <fa icon="camera"></fa>
            </button></QRReader>
        <v-text-field
                class="pk_in"
                placeholder="00000AVA000"
                color="#333"
                hide-details
                v-model="pk"
                @input="oninput"
        ></v-text-field>
    </div>
</template>
<script>
    import QRReader from "@/components/misc/QRReader";


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
        model:{
            prop: 'value',
            event: 'change',
        },
        methods: {
            change(val){
                this.pk = val;
                this.emit();
            },
            oninput(){
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
        background-color: #a5a5a5;
        margin-bottom: 8px;
        /*padding: 0px 12px;*/
        /*padding-left: 0px;*/
    }

    .qr_input button{
        font-size: 24px;
        padding-right: 12px;
        padding-left: 12px;
        border-right: 1px solid #404040;
        text-align: center;
        pointer-events: none;
        /*opacity: 0.7;*/
    }

    /*.qr_input button:hover{*/
    /*    opacity: 1;*/
    /*}*/

    .pk_in{
        margin: 0;
        padding: 0px 12px;
    }

    .pk_in >>> input::placeholder{
        color: #3336 !important;
    }

    .pk_in >>> input{
        color: #333 !important;
        text-align: center;
    }
    .pk_in >>> .v-input__slot::before{
        display: none;
        border-color: #d2d2d240 !important;
    }
</style>