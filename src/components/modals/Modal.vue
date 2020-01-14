<template>
    <div class="modal_main" v-show="isActive">
        <div class="modal_bg" @click="close"></div>
        <div class="modal_body">
            <slot></slot>
        </div>
    </div>
</template>
<script>
    export default {
        data(){
            return{
                isActive: false,
            }
        },
        methods: {
            open(){
                this.isActive = true;
            },
            close(){
                this.isActive = false;
            }
        }
    }
</script>
<style scoped>
    .modal_main{
        z-index: 3;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;

    }

    .modal_bg{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.6);
        display: flex;
        vertical-align: center;
        align-items: center;
    }

    .modal_body{
        width: 320px;
        min-height: 30px;
        background-color: #d2d2d2;
        margin: auto;
        z-index: 2;
    }
</style>