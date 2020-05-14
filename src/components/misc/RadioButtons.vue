<template>
    <div class="radio_buts">
        <button v-for="val in value" :key="val" @click="select(val)" :active="selection===val">{{val}}</button>
    </div>
</template>
<script>
    export default {
        data(){
            return {
                selection: null,
            }
        },
        props:{
            value: {
                type: Array,
                required: true,
            },
            default_val: {
                type: [String, Object]
            },
        },
        methods: {
            select(val){
                this.selection = val;
                this.$emit('change', this.selection);
            }
        },
        created(){
            if(this.default_val){
                this.select(this.default_val);
            }
        }
    }
</script>
<style scoped lang="scss">
    .radio_buts{
        display: flex;
        flex-wrap: wrap;
    }
    button{
        word-break: normal;
        white-space: nowrap;
        font-size: 12px;
        padding: 4px 14px;
        border: 1px solid #808080;
        color: #808080;
        border-radius: 4px;
        margin-right: 4px;
        margin-bottom: 4px;
        transition-duration: 0.2s;
        font-family: Inconsolata, monospace;

        &[active]{
            color: #4A2899;
            border-color: #4A2899;
            background-color: #ebe4fb;
        }
    }
</style>
