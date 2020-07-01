<template>
    <div>
        <v-checkbox :label="explain" v-model="isRemember" @change="change"></v-checkbox>
    </div>
</template>
<script>
export default {
    data() {
        return {
            isRemember: false,
        }
    },
    props: {
        value: Boolean,
        explain: {
            type: String,
            default: "Remember keys."
        }
    },
    model: {
        prop: "value",
        event: "change"
    },
    methods: {
        change() {
            this.$emit("change", this.isRemember);
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
