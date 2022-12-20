<template>
    <div>
        <v-checkbox
            :label="label"
            v-model="value"
            @change="change"
            class="analytics-checkbox"
        ></v-checkbox>
    </div>
</template>
<script>
export default {
    data() {
        return {
            value: !!JSON.parse(localStorage.getItem('consentsToAnalytics')),
        }
    },
    props: {
        label: {
            type: String,
            default: 'Participate in CoreAnalytics',
        },
    },
    model: {
        prop: 'value',
        event: 'change',
    },
    methods: {
        onAccept() {
            localStorage.setItem('consentsToAnalytics', true)
            // @ts-ignore
            this.$posthog.opt_in_capturing()
            this.consentsToAnalytics = true
            this.$emit('change', this.value)

            return
        },
        onReject() {
            localStorage.setItem('consentsToAnalytics', false)
            // @ts-ignore
            this.$posthog.opt_out_capturing()
            this.analyticsEnabled = false
            this.consentsToAnalytics = false
            this.$emit('change', this.value)

            return
        },
        change() {
            if (this.value) {
                this.onAccept()
            } else {
                this.onReject()
            }
        },
    },
}
</script>

<style lang="scss">
@use "../../../main";

.analytics-checkbox {
    margin-top: 0 !important;

    .v-label {
        color: var(--primary-color);
        left: -4px !important;
    }

    .v-input__slot {
        margin-bottom: 0;
        position: relative;
        left: -2px;
    }

    .v-input--selection-controls__ripple {
        color: var(--secondary-color) !important;
    }

    .v-messages {
        display: none;
    }

    .v-input--selection-controls__input {
        > * {
            font-size: 18px !important;
            color: var(--primary-color) !important;
        }
    }
}
</style>
