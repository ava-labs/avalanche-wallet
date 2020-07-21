<template>
    <div>
        <v-checkbox :label="explain" v-model="isSecured" @change="change" class="checkbox"></v-checkbox>
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

    .checkbox{

        .v-label{
            color: var(--primary-color);
        }

        .v-input--selection-controls__input{

            > * {
                color: var(--primary-color) !important;
            }

        }


        .v-input--selection-controls__ripple{
            color: var(--secondary-color) !important;
        }
    }

</style>
