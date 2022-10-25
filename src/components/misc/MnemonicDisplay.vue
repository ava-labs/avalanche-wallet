<template>
    <div
        class="mnemonic_display notranslate"
        :style="{ gridTemplateColumns: `repeat(${rowSize}, 1fr)` }"
        translate="no"
    >
        <template v-for="(word, i) in phraseArray" class="word">
            <div v-if="i % 2 == 0" :key="i" class="word">
                <p class="index">{{ i / 2 + 1 }}.</p>
                <span class="phrase_word" translate="no">
                    {{ word }}
                </span>
            </div>
            <div v-else class="fake" :key="i">
                <p class="index">{{ i }}.</p>
                <span class="phrase_word" translate="no">
                    {{ word }}
                </span>
            </div>
        </template>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import MnemonicPhrase from '@/js/wallets/MnemonicPhrase'
import { getRandomMnemonicWord } from '@/helpers/getRandomMnemonicWord'

@Component
export default class MnemonicDisplay extends Vue {
    @Prop({ default: '#FFFFFF' }) bgColor?: string
    @Prop({ default: 4 }) rowSize!: number
    @Prop() phrase!: MnemonicPhrase

    get phraseArray(): string[] {
        const words = this.phrase.getValue().split(' ')
        const mixedMnemonic = []
        for (let i in words) {
            mixedMnemonic.push(words[i])
            mixedMnemonic.push(this.getFakeWord())
        }
        return mixedMnemonic
    }

    getFakeWord() {
        return getRandomMnemonicWord()
    }
}
</script>
<style scoped lang="scss">
@use "../../main";

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
    user-select: none;
}

.fake {
    position: absolute;
    left: 0px;
    top: 0px;
    z-index: -1;
    opacity: 0;
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
