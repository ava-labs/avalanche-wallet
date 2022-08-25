<template>
    <transition name="fade">
        <div class="modal_main" v-if="isActive">
            <div class="modal_bg" @click="bgclick" :icy="icy"></div>
            <div class="modal_body">
                <div class="modal_topbar">
                    <h4 class="modal_title">{{ title }}</h4>
                    <button class="modalClose" @click="close" v-if="can_close">
                        <fa icon="times"></fa>
                    </button>
                </div>
                <slot></slot>
            </div>
        </div>
    </transition>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Modal extends Vue {
    @Prop({ default: 'Modal Title' }) title!: string
    @Prop({ default: true }) can_close!: boolean
    @Prop({ default: false }) icy!: boolean

    isActive: boolean = false

    public open() {
        this.isActive = true
        document.body.style.overflow = 'hidden'
    }

    bgclick() {
        if (this.can_close) {
            this.close()
        }
    }

    public close() {
        this.$emit('beforeClose')
        this.isActive = false
        document.body.style.overflow = 'auto'
    }
}
</script>
<style scoped lang="scss">
@use '../../styles/main';

.modal_topbar {
    background-color: var(--bg);
    border-bottom: var(--bg);
    color: var(--primary-color);
    border-bottom: 2px solid var(--bg-light);
    position: relative;
    padding: 10px 22px;
    display: flex;
}

.modal_title {
    font-size: 22px;
    text-align: left;
    flex-grow: 1;
    margin: 0;
    font-weight: lighter;
}

.modalClose {
    font-size: 22px;
    font-weight: lighter;
    opacity: 0.5;
    &:hover {
        opacity: 1;
    }
}

.modal_main {
    z-index: 3;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: auto;
    display: flex;
    overflow-y: hidden;
}

.modal_bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    vertical-align: center;
    align-items: center;

    &[icy] {
        backdrop-filter: blur(4px);
    }
}

.modal_body {
    width: max-content;
    max-width: 90%;
    min-height: 30px;
    background-color: var(--bg);
    box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.5);
    margin: auto;
    z-index: 2;
    position: absolute;
    inset: 50% auto auto 50%;
    transform: translate(-50%, -50%);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    max-height: 90%;
}

@include main.mobile-device {
    .modal_body {
        position: absolute;
        width: max-content;
        margin: 0;
        padding-bottom: 20px;
        max-width: 100%;
        border-radius: var(--border-radius-lg);
    }
}
</style>
