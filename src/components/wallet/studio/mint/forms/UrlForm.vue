<template>
    <div>
        <label>URL</label>
        <input placeholder="https://" v-model="urlIn" @input="onInput" />
        <v-btn class="button_secondary" small @click="submit">Mint</v-btn>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { UrlFormType } from '@/components/wallet/studio/mint/types'

@Component
export default class UrlForm extends Vue {
    urlIn = ''
    submit() {}

    onInput() {
        let msg: UrlFormType = {
            url: this.urlIn,
        }

        this.$emit('onInput', msg)
    }
}
</script>
