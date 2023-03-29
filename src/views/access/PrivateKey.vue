<template>
    <div class="access_card">
        <div class="content">
            <h1>Private Key</h1>
            <form @submit.prevent="access">
                <v-text-field
                    class="pass"
                    label="Private Key"
                    dense
                    solo
                    flat
                    :type="inputType"
                    v-model="privatekey"
                    hide-details
                    data-cy="field-private-key"
                ></v-text-field>
                <p class="err">{{ error }}</p>
                <v-btn
                    class="ava_button button_primary"
                    @click="access"
                    :loading="isLoading"
                    :disabled="!canSubmit"
                    depressed
                    data-cy="btn-submit-private-key"
                >
                    {{ $t('access.submit') }}
                </v-btn>
            </form>
            <div @click="navigate('/login')" class="link">Cancel</div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class PrivateKey extends Vue {
    @Prop() navigate: any
    privatekey: string = ''
    isLoading: boolean = false
    inputType = 'input'
    error: string = ''
    async mounted() {
        if (!(window.getComputedStyle(this.$el) as any).webkitTextSecurity) {
            this.inputType = 'password'
        }
    }
    async access() {
        if (!this.canSubmit || this.isLoading) return
        this.error = ''
        this.isLoading = true
        let key = this.privatekey

        try {
            await this.$store.dispatch('accessWalletSingleton', key)
            let { updateSuiteStore } = this.globalHelper()
            updateSuiteStore(this.$store.state)
            this.onsuccess()
        } catch (e) {
            this.onerror('Invalid Private Key.')
        }
    }
    onsuccess() {
        this.isLoading = false
        this.privatekey = ''
    }
    onerror(e: any) {
        this.error = e
        this.privatekey = ''
        this.isLoading = false
    }
    get canSubmit(): boolean {
        if (!this.privatekey) {
            return false
        }
        return true
    }
}
</script>
<style scoped lang="scss">
@use '../../styles/main';
@use '../../styles/abstracts/variables';
.pass {
    background-color: var(--bg) !important;
}
.ava_button {
    width: 100%;
    margin-bottom: 22px;
}
.access_card {
    max-width: 420px;
    background-color: var(--bg-light);
    padding: variables.$container-padding;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 6px;
}
.content {
    display: flex;
    flex-direction: column;
    width: 340px;
    max-width: 100%;
    margin: 0px auto;
    align-items: center;
}
h1 {
    font-size: variables.$m-size;
    font-weight: 400;
    margin-bottom: 30px;
}
form {
    width: 100%;
}
.file_in {
    margin: 30px auto 10px;
    font-size: 13px;
    border: none !important;
    background-color: var(--bg) !important;
}
a {
    color: variables.$primary-color-light !important;
    text-decoration: underline !important;
    margin: 10px 0 20px;
}
.link {
    color: var(--secondary-color);
}
.remember {
    margin: 12px 0;
}
.err {
    font-size: 13px;
    color: var(--error);
    margin: 14px 0px !important;
}
@media only screen and (max-width: variables.$mobile_width) {
    h1 {
        font-size: variables.$m-size-mobile;
    }
    .but_primary {
        width: 100%;
    }
    .access_card {
        padding: main.$container-padding-mobile;
    }
}
</style>
