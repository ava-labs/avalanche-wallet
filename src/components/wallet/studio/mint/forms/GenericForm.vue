<template>
    <div>
        <div class="input_cont">
            <label>{{ $t('studio.mint.forms.generic.label1') }}</label>
            <input class="text" max="128" v-model="title" @input="onInput" />
        </div>
        <div class="input_cont">
            <label>{{ $t('studio.mint.forms.generic.label2') }}</label>
            <input class="text" placeholder="https://" v-model="imgUrl" @input="onInput" />
        </div>
        <div class="input_cont">
            <label>{{ $t('studio.mint.forms.generic.label3') }}</label>
            <textarea class="text" maxlength="256" v-model="description" @input="onInput" />
        </div>
        <!--        <div class="input_cont">-->
        <!--            <label>Corner Radius</label>-->
        <!--            <input type="number" min="0" max="100" v-model="radius"  @input="onInput"/>-->
        <!--        </div>-->
        <p class="err">{{ error }}</p>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { GenericFormType, IGenericNft } from '@/components/wallet/studio/mint/types'

@Component
export default class GenericForm extends Vue {
    title = ''
    description = ''
    imgUrl = ''
    error = ''
    // radius = 15

    validate() {
        // if (!this.title) {
        //     this.error = 'You must set a title.'
        //     return false
        // }

        try {
            new URL(this.imgUrl)
        } catch (e) {
            this.error = this.$t('studio.mint.forms.generic.err1') as string
            // this.error = 'Not a valid Image URL.'
            return false
        }
        if (!this.imgUrl) {
            this.error = this.$t('studio.mint.forms.generic.err2') as string
            // this.error = 'You must set the image.'
            return false
        }

        if (this.imgUrl.length > 516) {
            this.error = this.$t('studio.mint.forms.generic.err3') as string
            // this.error = 'Image URL too long.'
            return false
        }

        // if (this.radius < 0 || this.radius > 100) {
        //     this.error = 'Invalid corner radius.'
        //     return false
        // }

        return true
    }

    onInput() {
        let msg: null | GenericFormType = null
        this.error = ''

        if (this.validate()) {
            let data: IGenericNft = {
                version: 1,
                type: 'generic',
                title: this.title,
                img: this.imgUrl,
                // radius: this.radius,
                desc: this.description,
            }

            msg = {
                data: {
                    avalanche: data,
                },
            }
        }
        this.$emit('onInput', msg)
    }
}
</script>
<style scoped lang="scss">
textarea {
    width: 100%;
    height: 80px;
    max-width: 100%;
}

.input_cont {
    margin-top: 2px;
    width: 100%;

    input {
        width: 100%;
    }
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
