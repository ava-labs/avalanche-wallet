<template>
    <div class="input_cont">
        <span v-for="i in 24" :key="i">
            {{ i }}.
            <input
                type="password"
                autocomplete="off"
                autocapitalize="off"
                @focus="onFocus"
                @blur="onBlur"
                @input="onInput($event, i - 1)"
                :ref="`in_${i - 1}`"
                @paste="onPaste"
            />
        </span>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

const SIZE = 24
@Component
export default class MnemonicPasswordInput extends Vue {
    // words = Array.from(''.repeat(24))
    onFocus(ev: any) {
        ev.target.setAttribute('type', 'text')
    }

    onBlur(ev: any) {
        ev.target.setAttribute('type', 'password')
    }

    onPaste(e: any) {
        e.preventDefault()
    }

    onInput(ev: any, index: number) {
        const val: string = ev.target.value.trim()
        const words: string[] = val.split(' ').filter((w) => w !== '')

        if (words.length > 1) {
            words.forEach((word, i) => {
                const wordIndex = index + i
                if (wordIndex >= SIZE) return

                //@ts-ignore
                const dom = this.$refs[`in_${wordIndex}`][0]
                dom.value = word
                dom.focus()
            })
        }

        this.emitValue()
    }

    emitValue() {
        let val = ''
        for (var i = 0; i < SIZE; i++) {
            //@ts-ignore
            const input = this.$refs[`in_${i}`][0]
            val += `${input.value} `
        }

        this.$emit('change', val.trim())
    }
}
</script>
<style scoped lang="scss">
.input_cont {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    //grid-gap: 1em;
    width: 100%;

    span {
        text-align: left;
        white-space: nowrap;
        margin: 0.7em;
        display: grid;
        grid-template-columns: 2em 1fr;
    }

    input {
        border-bottom: 1px solid var(--primary-color-light);
        width: 8ch;
        border-radius: 2px;
        color: var(--primary-color);
    }
}
</style>
