<template>
    <div v-if="!mini">
        <div class="card_container" @click="flipCard" @mouseleave="mouseleave">
            <div class="card" :flipped="flipped">
                <div class="card_back">
                    <button class="button_secondary" @click="transfer">Send</button>
                </div>
                <div class="card_front">
                    <slot name="card"></slot>
                </div>
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
import 'reflect-metadata'
import { Vue, Prop, Component } from 'vue-property-decorator'

@Component
export default class BaseNftCard extends Vue {
    @Prop({ default: false }) mini!: boolean
    @Prop({ default: false }) rawCard!: boolean
    @Prop() utxoId!: string
    flipped: boolean = false

    flipCard() {
        this.flipped = !this.flipped
    }
    mousenter() {
        if (this.rawCard) return
        this.flipped = true
    }

    mouseleave() {
        this.flipped = false
    }

    transfer(ev: MouseEvent) {
        ev.stopPropagation()
        this.$router.push({
            path: '/wallet/transfer',
            query: { nft: this.utxoId },
        })
    }
}
</script>
<style scoped lang="scss">
.card_container {
    position: relative;
    width: 100%;
    height: 100%;
    //width: 180px;
    //height: 220px;
}
.card {
    /*box-shadow: 1px 0px 4px 1px rgba(0,0,0,0.2);*/
    /*overflow: hidden;*/
    position: absolute;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: all 0.5s ease;
    transform-origin: center;
    /*background-color: var(--bg-light);*/
    /*background: yellow;*/
    &[flipped] {
        transform: rotateY(180deg);
    }

    /*> *{*/
    /*    &[flipped]{*/
    /*        transform: rotateY(180deg);*/
    /*        pointer-events: none;*/
    /*        user-select: none;*/
    /*    }*/
    /*    transition-duration: 0.5s;*/
    /*    transition-timing-function: ease-in-out;*/
    /*}*/

    .card_front {
        border-radius: 20px;
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--bg-light);
        color: var(--primary-color);
        cursor: pointer;
    }

    .card_back {
        border-radius: 20px;
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        transform: rotateY(180deg);
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px;
        background-color: var(--bg-light);

        button {
            padding: 4px 12px;
            border-radius: var(--border-radius-sm);
        }
    }
}

.mini {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.deck {
}
</style>
