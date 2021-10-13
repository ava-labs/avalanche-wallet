<template>
    <div class="add_mnemonic">
        <textarea v-model="phrase" placeholder="web  jar  rack  cereal  inherit ...."></textarea>
        <p class="err">{{ err }}</p>
        <v-btn
            :disabled="!canSubmit"
            :loading="isLoading"
            @click="access"
            class="addKeyBut button_primary ava_button"
            depressed
            block
        >
            {{ $t('keys.import_key_button') }}
        </v-btn>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import * as bip39 from 'bip39'

@Component
export default class AddMnemonic extends Vue {
    phrase: string = ''
    err: string = ''
    isLoading: boolean = false

    errCheck() {
        let phrase = this.phrase.trim()
        let words = phrase.split(' ')

        // not a valid key phrase
        if (words.length !== 24) {
            this.err =
                'Invalid key phrase. Your phrase must be 24 words separated by a single space.'
            return false
        }

        if (!bip39.validateMnemonic(phrase)) {
            this.err = 'Not a valid mnemonic phrase.'
            return false
        }

        return true
    }

    clear() {
        this.phrase = ''
        this.err = ''
        this.isLoading = false
    }

    async access() {
        let phrase = this.phrase.trim()
        this.err = ''
        this.isLoading = true

        if (!this.errCheck()) {
            this.isLoading = false
            return
        }

        setTimeout(async () => {
            try {
                await this.$store.dispatch('addWalletMnemonic', phrase)
                this.isLoading = false
                this.handleImportSuccess()
            } catch (e) {
                this.isLoading = false
                if (e.message.includes('already')) {
                    this.err = this.$t('keys.import_mnemonic_duplicate_err') as string
                } else {
                    this.err = this.$t('keys.import_mnemonic_err') as string
                }
            }
        }, 500)
    }

    handleImportSuccess() {
        this.phrase = ''
        this.$emit('success')
    }

    get wordCount(): number {
        return this.phrase.trim().split(' ').length
    }

    get canSubmit() {
        if (this.wordCount < 24) {
            return false
        }
        return true
    }
}
</script>
<style scoped lang="scss">
.add_mnemonic {
    /*background-color: #e7e7ea;*/
    padding: 14px 0;
}

textarea {
    padding: 12px;
    font-size: 0.8rem;
    background-color: var(--bg-wallet);
    resize: none;
    width: 100%;
    height: 120px;
    margin-top: 14px;
}

.but_submit {
    margin-top: 12px;
}

.err {
    color: var(--error);
    font-size: 14px;
}
</style>
