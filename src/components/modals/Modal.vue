<template>
    <div class="modal_main" v-show="isActive">
        <div class="modal_bg" @click="close"></div>
        <div class="modal_body">
            <div class="modal_topbar">
                <h4 class="modal_title">{{title}}</h4>
                <button class="modalClose" @click="close"><fa icon="times"></fa></button>
            </div>
            <slot></slot>
        </div>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import { Vue, Component, Prop } from 'vue-property-decorator';

    @Component
    export default class Modal extends Vue{
        @Prop({default: "Modal Title"}) title!:string;

        isActive: boolean = false;

        public open(){
            this.isActive = true;
        }
        close(){
            this.isActive = false;
        }
    }
</script>
<style scoped>

    .modal_topbar{
        background-color: #000;
        color: #fff;
        position: relative;
        padding: 10px 22px;
        display: flex;
    }

    .modal_title{
        font-size: 22px;
        text-align: left;
        flex-grow: 1;
        margin: 0;
    }

    .modalClose{
        font-size: 22px;
    }

    .modal_main{
        z-index: 3;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        overflow: scroll;
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
        width: max-content;
        max-width: 100%;
        min-height: 30px;
        background-color: #f2f2f2;
        margin: auto;
        z-index: 2;
        border-radius: 2px;
        overflow: hidden;
    }
</style>
