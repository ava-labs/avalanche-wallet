<template>
    <div class="access_card">
        <div class="content">
            <Identicon :value="account.baseAddresses.join('')"></Identicon>
            <h1>{{ account.name }}</h1>
            <form @submit.prevent="access">
                <input
                    class="single_line_input hover_border pass"
                    type="password"
                    placeholder="Password"
                    v-model="password"
                />
                <p class="err">{{ error }}</p>
                <v-btn
                    class="ava_button button_primary"
                    @click="access"
                    :loading="isLoading"
                    :disabled="!canSubmit"
                    depressed
                >
                    {{ $t('access.submit') }}
                </v-btn>
                <small>{{ $t('keys.account_slow_warning') }}</small>
                <br />
                <br />
            </form>
            <router-link to="/access" class="link">{{ $t('access.cancel') }}</router-link>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { ImportKeyfileInput, iUserAccountEncrypted } from '@/store/types'
import Identicon from '@/components/misc/Identicon.vue'

@Component({
    components: { Identicon },
})
export default class Account extends Vue {
    password: string = ''
    isLoading: boolean = false
    error: string = ''

    get index() {
        return this.$route.params.index
    }
    get accounts() {
        return this.$store.state.Accounts.accounts
    }

    get account() {
        return this.accounts[this.index]
    }

    created() {
        if (!this.account) {
            this.$router.replace('/access')
            return
        }
    }

    async access() {
        const { account } = this
        if (!this.canSubmit || this.isLoading) return
        if (account == null) return
        let parent = this
        this.error = ''
        this.isLoading = true
        let data: ImportKeyfileInput = {
            password: this.password,
            data: account.wallet,
        }

        setTimeout(() => {
            this.$store
                .dispatch('Accounts/accessAccount', {
                    index: this.index,
                    pass: this.password,
                })
                .then((res) => {
                    parent.isLoading = false
                })
                .catch((err) => {
                    if (err === 'INVALID_PASS') {
                        parent.error = this.$t('access.password_error').toString()
                    } else if (err === 'INVALID_VERSION') {
                        parent.error = this.$t('access.keystore_error').toString()
                    } else {
                        parent.error = err.message
                    }
                    parent.isLoading = false
                })
        }, 200)
    }
    onsuccess() {
        this.isLoading = false
        this.password = ''
    }
    onerror(e: any) {
        this.error = e
        this.password = ''
        this.isLoading = false
    }
    get canSubmit(): boolean {
        if (!this.password) {
            return false
        }
        return true
    }
}
</script>
<style scoped lang="scss">
@use '../../styles/main';
.pass {
    text-align: center;
    background-color: var(--bg-light) !important;
}
.ava_button {
    width: 100%;
    margin-bottom: 22px;
    height: 40px !important;
}
.access_card {
    /*max-width: 80vw;*/
    //background-color: var(--bg-light);
    //padding: main.$container-padding;
    width: 100%;
    /*max-width: 240px;*/
    /*max-width: 1000px;*/
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 6px;
}
.content {
    width: 340px;
    max-width: 100%;
    margin: 0px auto;
}
h1 {
    font-size: main.$m-size;
    font-weight: 400;
}

form {
    margin: 14px 0;
}
.file_in {
    margin: 30px auto 10px;
    font-size: 13px;
    border: none !important;
    background-color: var(--bg-light) !important;
    /*min-width: 200px*/
}
a {
    color: main.$primary-color-light !important;
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
@media only screen and (max-width: main.$mobile_width) {
    h1 {
        font-size: main.$m-size-mobile;
    }
    .but_primary {
        width: 100%;
    }
}
</style>
