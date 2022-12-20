<template>
    <div class="analytics" v-show="showConsentModal">
        <div class="analytics_item">
            <p class="analytics_msg">
                {{ $t('analytics.cookie_desc') }}
                <a
                    href="https://www.avalabs.org/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {{ $t('analytics.privacy_policy') }}
                </a>
                .
            </p>
            <div class="analytics_actions">
                <button class="button_form_cancel" @click="onReject" data-cy="reject_analytics">
                    {{ $t('analytics.reject') }}
                </button>
                <button class="button_primary" @click="onAccept">
                    {{ $t('analytics.accept') }}
                </button>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            // if the user never accepted or rejected, we show the prompt
            showConsentModal: localStorage.getItem('consentsToAnalytics') === null,
        }
    },
    computed: {},
    methods: {
        onAccept() {
            localStorage.setItem('consentsToAnalytics', true)
            // @ts-ignore
            this.$posthog.opt_in_capturing()
            this.showConsentModal = false

            return
        },
        onReject() {
            localStorage.setItem('consentsToAnalytics', false)
            // @ts-ignore
            this.$posthog.opt_out_capturing()
            this.showConsentModal = false

            return
        },
    },
}
</script>
<style scoped>
.analytics {
    position: fixed;
    display: flex;
    flex-direction: column;
    bottom: 0;
    right: 0;
    left: 0;
    padding: 30px 3vw;
    z-index: 9;
}

.analytics_actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 6px 14px;
}

.analytics_item {
    border-radius: 6px;
    margin: auto;
    margin-bottom: 8px;
    overflow: hidden;
    box-shadow: 2px 2px 12px rgba(0, 0, 0, 0.4);
    background-color: var(--bg);
    max-width: 295px;
    font-size: 13px !important;
}

.button_form_cancel {
    margin-right: 16px !important;
}

.button_primary {
    padding: 4px 8px;
}

.analytics_msg {
    padding: 6px 14px;
}

p {
    margin: 0 !important;
}

@media only screen and (max-width: 600px) {
    .analytics {
        height: min-content;
        width: 100%;
        left: 0;
        top: 0;
    }

    .analytics_item {
        max-width: unset;
        width: 100%;
    }
}
</style>
