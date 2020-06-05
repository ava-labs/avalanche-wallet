<template>
    <div>
        <v-checkbox
                :label="explain"
                v-model="isRemember"
                @change="change"
        ></v-checkbox>
<!--        <p class="explain">Wallet will remember your private keys until you logout or close the browser window.</p>-->
    </div>
</template>
<script>
    export default {
        data(){
            return{
                // explain : "Remember key phrase. Your keys will persist until you close the browser tab.",
                isRemember: false,
            }
        },
        props: {
            value: Boolean,
            explain: {
                type: String,
                default: "Remember keys."
            }
        },
        model: {
            prop: 'value',
            event: 'change'
        },
        methods: {
            change(){
                this.$emit('change', this.isRemember);
            }
        }
    }
</script>
<style scoped lang="scss">
    p{
        padding-left: 34px;
        text-align: left;
    }
</style>
