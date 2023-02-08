<template>
    <div>
        <div class="mnemonic_input">
            <div v-for="i in wordNum" :key="i" class="word">
                <p class="index">{{ i }}.</p>
                <input
                    :type="isHidden ? 'password' : 'text'"
                    class="phrase_word"
                    :class="isWordValid(phrase[i - 1]) ? '' : 'invalid_input'"
                    v-model.trim="phrase[i - 1]"
                    @keydown.space.prevent="onSpace()"
                    @keyup="$emit('update', { value: phrase[i - 1], index: i - 1 })"
                    :data-cy="getDataCY(i)"
                />
            </div>
        </div>
        <div class="show-hide-wrapper">
            <button @click="isHidden = !isHidden" class="hidden-toggle">
                <fa v-if="isHidden" icon="eye-slash"></fa>
                <fa v-else icon="eye"></fa>
            </button>
            <label>
                {{
                    isHidden
                        ? $t('access.mnemonic.showKeyPhrase')
                        : $t('access.mnemonic.hideKeyPhrase')
                }}
            </label>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { wordlists } from 'bip39'
@Component
export default class MnemonicDisplay extends Vue {
    @Prop() phrase!: string[]
    isHidden: boolean = true
    wordNum: number = 24
    onSpace() {
        let inputs = document.getElementsByTagName('input')
        let currInput = document.activeElement!
        for (let i = 0; i < inputs.length; i++) {
            if (inputs[i] == currInput) {
                let next = inputs[i + 1]
                if (next && next.focus) {
                    next.focus()
                    next.select()
                }
                break
            }
        }
    }
    isWordValid(word: string) {
        return wordlists.EN.includes(word) || !word
    }

    getDataCY(pos: number) {
        return `mnemonic-field-${pos}`
    }
}
</script>
<style scoped lang="scss">
@use '../../styles/main';
.mnemonic_input {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
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
    border-right: 2px solid var(--bg-light);
}
.phrase_word {
    text-align: center;
    overflow: scroll;
    white-space: nowrap;
    flex-grow: 1;
    color: var(--primary-color);
}
.invalid_input {
    border: #ff2115 1px solid;
}
p {
    text-align: left;
}
span {
    text-align: center;
}
label {
    text-align: left;
    color: main.$primary-color-light;
    font-size: 12px;
    margin-bottom: 20px;
}
.hidden-toggle {
    display: flex;
    align-items: flex-start;
    max-height: 1.25em;
    min-width: 1.25em;
}
.show-hide-wrapper {
    display: flex;
    gap: 4px;
    margin: 16px 0;
}
@include main.mobile-device {
    .word {
        * {
            padding: 4px 2px;
        }
    }
    .mnemonic_input {
        grid-template-columns: repeat(1, 1fr);
    }
}
@include main.medium-device {
    .mnemonic_input {
        grid-template-columns: repeat(3, 1fr);
    }
}
</style>
