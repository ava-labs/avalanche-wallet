<template>
    <modal ref="modal" :title="title" class="modal_parent" icy>
        <div class="mnemonic_body">
            <div class="">
                <div v-for="(q, i) in questions" :key="q.words[0]" class="question_row">
                    <p>Select word {{ q.questionIndex + 1 }}</p>
                    <div style="display: flex; justify-content: center">
                        <RadioButtons
                            style="margin: 0px auto"
                            :labels="q.words"
                            :keys="q.words"
                            v-model="answers[i]"
                        ></RadioButtons>
                    </div>
                </div>
            </div>
            <p class="err">{{ err }}</p>
            <button class="but_primary ava_button button_primary" @click="verify">Verify</button>
        </div>
    </modal>
</template>

<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

import Modal from '@/components/modals/Modal.vue'
import MnemonicPhrase from '@/js/wallets/MnemonicPhrase'
import RadioButtons from '@/components/misc/RadioButtons.vue'
import { getRandomMnemonicWord } from '@/helpers/getRandomMnemonicWord'

interface Question {
    words: [string, string, string]
    questionIndex: number // Which index are we asking the user to verify
    answerIndex: number // Which word is the correct option out of the 3
}
@Component({
    components: {
        RadioButtons,
        Modal,
    },
})
export default class VerifyMnemoni2 extends Vue {
    isActive: boolean = false
    keysIn: string[] = []
    hiddenIndices: number[] = []
    err: string = ''
    title: string = ''
    answers: (string | undefined)[] = [undefined, undefined, undefined]
    questions: Question[] = []

    @Prop() mnemonic!: MnemonicPhrase

    @Watch('mnemonic')
    onmnemonicchange(val: MnemonicPhrase) {
        this.init()
    }
    created() {
        this.init()
        this.title = `${this.$t('create.verifytitle')}`
    }

    init() {
        const wordsLen = 24
        this.keysIn = Array(wordsLen).join('.').split('.')

        // Hide 4 words
        let qNum = 3
        let usedIndex: number[] = []
        let questions: Question[] = []
        const mnemonic = this.mnemonic.getValue().split(' ')

        while (questions.length < qNum) {
            let randIndex = Math.floor(Math.random() * (wordsLen - 1))

            if (!usedIndex.includes(randIndex)) {
                usedIndex.push(randIndex)
                const w0 = mnemonic[randIndex]
                // Select 2 more words
                const w1 = getRandomMnemonicWord()
                const w2 = getRandomMnemonicWord()

                let words: [string, string, string] = [w0, w1, w2]
                // Rotate until w0 is at answer index
                const answerIndex = Math.round(Math.random() * 2)
                // Shift right answerIndex times
                for (var i = 0; i < answerIndex; i++) {
                    const temp = words.pop() as string
                    words.splice(0, 0, temp)
                }

                questions.push({
                    words: words,
                    questionIndex: randIndex,
                    answerIndex: answerIndex,
                })
            }
        }

        this.questions = questions
    }

    open() {
        // @ts-ignore
        this.$refs.modal.open()
        this.err = ''
        this.answers = [undefined, undefined, undefined]
    }

    close() {
        this.isActive = false
        this.err = ''
    }

    formCheck() {
        this.err = ''

        for (let i = 0; i < this.questions.length; i++) {
            const question = this.questions[i]
            const answer = this.answers[i]

            if (question.words[question.answerIndex] != answer) {
                this.err = 'You selected the wrong words.'
                return false
            }
        }

        return true
    }

    verify() {
        if (!this.formCheck()) return
        // @ts-ignore
        this.$refs.modal.close()
        this.$emit('complete')
    }
}
</script>
<style scoped lang="scss">
@use "../../main";

.mnemonic_body {
    padding: 30px;
    text-align: center;
    max-width: 100%;
    width: 450px;
}

.but_primary {
    width: 80%;
    margin: 0px auto;
    padding: 8px 30px;
}

.err {
    height: 60px;
    margin: 0px auto;
    text-align: center;
    color: var(--error);
}

.question_row {
    margin-bottom: 14px;
}
</style>
