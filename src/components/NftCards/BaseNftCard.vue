<template>
    <div v-if="!mini">
        <div class="card" @mouseenter="mousenter" @mouseleave="mouseleave">
            <div class="card_back" :flipped="!flipped">
                <button class="button_secondary">Transfer</button>
            </div>
            <div class="card_front" :flipped="flipped">
                <slot name="card"></slot>
            </div>
        </div>
        <div class="deck" v-if="!rawCard">
            <slot name="deck"></slot>
        </div>
    </div>
    <div v-else class="mini">
        <slot name="mini"></slot>
    </div>
</template>
<script lang="ts">
    import 'reflect-metadata';
    import {Vue, Prop, Component} from "vue-property-decorator";

    @Component
    export default class BaseNftCard extends Vue{
        @Prop({default: false}) mini!: boolean;
        @Prop({default: false}) rawCard!: boolean;
        flipped: boolean = false;

        mousenter(){
            if(this.rawCard) return;
            this.flipped = true;
        }

        mouseleave(){
            if(this.rawCard) return;
            this.flipped = false;
        }
    }
</script>
<style scoped lang="scss">
    .card{
        box-shadow: 1px 0px 4px 1px rgba(0,0,0,0.2);
        border-radius: 8px;
        overflow: hidden;
        position: relative;
        background-color: var(--bg-light);

        > *{
            &[flipped]{
                opacity: 0;
                transform: rotateY(180deg);
                pointer-events: none;
                user-select: none;
            }
            transition-duration: 0.5s;
            transition-timing-function: ease-in-out;
        }

        .card_front{
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: var(--bg-light);
        }

        .card_back{
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
            background-color: var(--bg-light);
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 12px;

            button{
                padding: 4px 12px;
                border-radius: 4px;
            }
        }
    }

    .mini{
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .deck{
    }
</style>