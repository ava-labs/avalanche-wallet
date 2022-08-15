<template>
    <div class="file_input hover_border">
        <input type="file" :multiple="multiple" @input="oninput" ref="input" />
        <p v-if="fileNum === 0">Select File</p>
        <p v-else>{{ files[0].name }}</p>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class FileInput extends Vue {
    files: FileList | null = null

    @Prop({ default: false }) multiple!: boolean
    @Prop({ default: 'raw' }) read_type!: string

    oninput(val: File) {
        // @ts-ignore
        let input = this.$refs.input as HTMLInputElement
        this.files = input.files as FileList
        if (this.read_type === 'raw') {
            if (this.multiple) {
                this.$emit('change', this.files)
            } else {
                this.$emit('change', this.files[0])
            }
        } else {
            this.read()
        }
    }

    read() {
        if (!this.files) return

        let parent = this

        let reader = new FileReader() // no arguments
        reader.onload = function () {
            parent.$emit('change', reader.result)
        }
        reader.onerror = function () {
            console.log(reader.error)
        }

        if (this.read_type === 'text') {
            reader.readAsText(this.files[0])
        }
    }

    clear() {
        let input = this.$refs.input as HTMLInputElement
        input.value = ''
        this.files = null
    }

    get fileNum() {
        if (!this.files) return 0
        return this.files.length
    }
}
</script>
<style scoped lang="scss">
@use '../../styles/main';

.file_input {
    position: relative;
    padding: 8px 18px;
    cursor: pointer;
    /* color: main.$primary-color; */
    color: rgb(118, 118, 118);
    background-color: main.$background-color !important;
    border: 1px solid;
    border-radius: 6px;
    max-width: 100%;
    border-color: main.$primary-color;
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    text-transform: uppercase !important;
}

input {
    z-index: 2;
    cursor: pointer;
    position: absolute;
    border: none !important;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 0;
}

p {
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
