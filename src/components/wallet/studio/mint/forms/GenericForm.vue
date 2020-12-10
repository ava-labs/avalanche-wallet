<template>
    <div>
        <div class="input_cont">
            <label>Title</label>
            <input class="text" max="128" v-model="title" @input="onInput" />
        </div>
        <div class="input_cont">
            <label>Image URL</label>
            <input class="text" placeholder="https://" v-model="imgUrl" @input="onInput" />
        </div>
        <div class="input_cont">
            <label>Description (Optional)</label>
            <textarea class="text" maxlength="256" v-model="description" @input="onInput" />
        </div>
        <p class="err">{{ error }}</p>

        <!--        <div class="input_cont">-->
        <!--            <textarea maxlength="1024" type="text" v-model="val" @input="onInput" />-->
        <!--            <p class="counter">{{ val.length }} / 1024</p>-->
        <!--        </div>-->
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import {
    GenericFormType,
    IGenericNft,
    UrlFormType,
    UtfFormType,
} from '@/components/wallet/studio/mint/types'

@Component
export default class GenericForm extends Vue {
    title = ''
    description = ''
    imgUrl = ''
    error = ''

    validate() {
        if (!this.title) {
            this.error = 'You must set a title.'
            return false
        }

        try {
            new URL(this.imgUrl)
        } catch (e) {
            this.error = 'Not a valid Image URL.'
            return false
        }
        if (!this.imgUrl) {
            this.error = 'You must set the image.'
            return false
        }

        if (this.imgUrl.length > 516) {
            this.error = 'Image URL too long.'
            return false
        }

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
                desc: this.description,
            }

            msg = {
                data: data,
            }
        }

        console.log(msg)

        // this.$emit('onInput', JSON.stringify(msg))
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
    width: 360px;

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
