<template>
    <div>
        <v-checkbox :label="explain" v-model="isSecured" @change="change"></v-checkbox>
    </div>
</template>
<script>
export default {
    data() {
        return {
            isSecured: false,
        }
    },
    props: {
        value: Boolean,
        explain: {
            type: String,
            default: "Back up your mnemonic keyphrase!"
        }
    },
    model: {
        prop: "value",
        event: "change"
    },
    methods: {
        change() {
            this.$emit("change", this.isSecured);
        }
    }
}
</script>

<style lang="scss">
@use "../../main";

.remember .v-label {
    font-size: main.$s-size !important;
}
</style>
