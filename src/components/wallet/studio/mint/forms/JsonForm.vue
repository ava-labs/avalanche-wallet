<template>
    <div>
        <label>Payload (MAX 1024 characters)</label>
        <div class="input_cont">
            JSON
            <textarea maxlength="1024" type="text" v-model="data" @input="onInput" />
            <p class="counter">{{ data.length }} / 1024</p>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { JsonFormType } from '@/components/wallet/studio/mint/types'

@Component
export default class JsonForm extends Vue {
    data = ''

    get isValid(): boolean {
        return true
    }

    onInput() {
        let msg: null | JsonFormType = null

        if (this.isValid) {
            msg = {
                data: this.data,
            }
        } else {
            msg = null
        }

        this.$emit('onInput', msg)
    }
}
</script>
<style scoped lang="scss">
textarea {
    width: 100%;
    height: 180px;
    max-width: 100%;
}

.input_cont {
    width: 360px;
}
.v-btn {
    margin-top: 14px;
}
.counter {
    text-align: right;
    font-size: 13px;
    color: var(--primary-color-light);
    padding: 2px;
}
</style>
