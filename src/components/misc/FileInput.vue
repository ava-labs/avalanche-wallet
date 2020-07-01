<template>
    <div class="file_input">
        <input type="file" :multiple="multiple" @input="oninput" ref="input" />
        <p v-if="fileNum===0">Select File</p>
        <p v-else>{{files[0].name}}</p>
    </div>
</template>
<script>
export default {
    data() {
        return {
            files: [],
        }
    },
    props: {
        multiple: {
            type: Boolean,
            default: false
        },
        read_type: {
            type: String,
            default: "raw"
        }
    },
    methods: {
        oninput(val) {
            let input = this.$refs.input;
            this.files = input.files;
            // console.log(input.files);
            // console.log(val);
            if (this.read_type === 'raw') {
                if (this.multiple) {
                    this.$emit('change', this.files);
                } else {
                    this.$emit('change', this.files[0]);
                }
            } else {
                this.read();
            }
        },
        read() {
            if (this.files.length === 0) return;

            let parent = this;

            let reader = new FileReader(); // no arguments
            reader.onload = function () {
                parent.$emit('change', reader.result);
            };
            reader.onerror = function () {
                console.log(reader.error);
            };

            if (this.read_type === 'text') {
                reader.readAsText(this.files[0])
            }
        }
    },
    computed: {
        fileNum() {
            return this.files.length;
        }
    }
}
</script>
<style scoped lang="scss">
@use '../../main';

.file_input {
    position: relative;
    border-radius: 2px;
    padding: 8px 18px;
    cursor: pointer;
    color: main.$white;
    background-color: main.$primary-color !important;
    border-radius: 6px;
    font-family: "DM Sans", sans-serif;
    font-weight: 700;
    text-transform: uppercase !important;
}

input {
    z-index: 2;
    cursor: pointer;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 0;
}

p {
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
