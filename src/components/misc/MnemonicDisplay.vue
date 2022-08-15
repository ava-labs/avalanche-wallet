<template>
    <div class="mnemonic_display" :style="{ gridTemplateColumns: `repeat(${rowSize}, 1fr)` }">
        <div v-for="i in wordNum" :key="i" class="word">
            <p class="index">{{ i }}.</p>
            <p class="phrase_word">{{ phraseArray[i - 1] }}</p>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import MnemonicPhrase from '@/js/wallets/MnemonicPhrase'

@Component
export default class MnemonicDisplay extends Vue {
    @Prop({ default: '#FFFFFF' }) bgColor?: string
    @Prop({ default: 4 }) rowSize!: number
    @Prop() phrase!: string | MnemonicPhrase

    wordNum: number = 24

    get phraseArray(): string[] {
        if (typeof this.phrase === 'string') {
            return this.phrase.split(' ')
        } else {
            return this.phrase.getValue().split(' ')
        }
    }
}
</script>
<style scoped lang="scss">
@use "../../styles/main";

.mnemonic_display {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-gap: 6px;
    row-gap: 6px;
    font-size: 12px;
}

.word {
    display: flex;
    overflow: hidden;
    font-weight: 700;

    background-color: var(--bg);

    > * {
        padding: 16px 6px;
    }
}

.index {
    width: 22px;
    box-sizing: content-box;
    text-align: center;
    user-select: none;
    color: var(--primary-color);
    font-weight: 400;
}

.phrase_word {
    text-align: center;
    /*overflow: scroll;*/
    white-space: nowrap;
    flex-grow: 1;
}

p {
    text-align: left;
}

span {
    text-align: center;
}

@include main.mobile-device {
    .word {
        * {
            padding: 4px 2px;
        }
    }

    .mnemonic_display {
        grid-template-columns: 1fr 1fr 1fr !important;
    }

    .phrase_word {
    }
}
</style>
