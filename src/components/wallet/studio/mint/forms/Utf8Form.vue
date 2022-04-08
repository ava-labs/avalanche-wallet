<template>
    <div>
        <label>{{ $t('studio.mint.forms.utf8.label1') }}</label>
        <div class="input_cont">
            <textarea maxlength="1024" type="text" v-model="val" @input="onInput" />
            <p class="counter">{{ val.length }} / 1024</p>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { UtfFormType } from '@/components/wallet/studio/mint/types'

@Component
export default class Utf8Form extends Vue {
    val = ''

    get isValid(): boolean {
        if (this.val.length === 0 || this.val.length > 1024) {
            return false
        }

        return true
    }

    onInput() {
        let msg: null | UtfFormType = null

        if (this.isValid) {
            msg = {
                text: this.val,
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
    width: 100%;
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
