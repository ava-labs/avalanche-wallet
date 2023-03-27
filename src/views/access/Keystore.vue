<template>
    <div class="access_card">
        <div class="content">
            <h1>{{ $t('keystore.title') }}</h1>
            <file-input class="file_in" @change="onfile"></file-input>
            <form @submit.prevent="access">
                <v-text-field
                    class="pass"
                    :label="$t('password')"
                    dense
                    solo
                    flat
                    type="password"
                    v-model="pass"
                    v-if="file"
                    hide-details
                ></v-text-field>
                <p class="err">{{ error }}</p>
                <v-btn
                    class="ava_button button_primary"
                    @click="access"
                    :loading="isLoading"
                    v-if="file"
                    :disabled="!canSubmit"
                    depressed
                >
                    {{ $t('access.submit') }}
                </v-btn>
            </form>
            <div @click="navigate('/login')" class="link">{{ $t('access.cancel') }}</div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

import FileInput from '../../components/misc/FileInput.vue'
import { ImportKeyfileInput } from '@/store/types'
import { AllKeyFileTypes } from '@/js/IKeystore'

@Component({
    components: {
        // RememberKey,
        FileInput,
    },
})
export default class Keystore extends Vue {
    @Prop() navigate: any
    pass: string = ''
    file: File | null = null
    fileText: string | null = null
    isLoading: boolean = false
    error: string = ''

    onfile(val: File) {
        this.file = val
        let parent = this

        let reader = new FileReader()
        reader.addEventListener('load', async () => {
            let res = reader.result as string
            parent.fileText = res
        })
        reader.readAsText(val)
    }

    access() {
        if (!this.canSubmit || this.isLoading) return

        let parent = this
        this.error = ''

        let fileData: AllKeyFileTypes
        try {
            fileData = JSON.parse(this.fileText as string)
        } catch (e) {
            this.error = `${this.$t('access.json_error')}`
            return
        }

        let data: ImportKeyfileInput = {
            password: this.pass,
            data: fileData,
        }

        this.isLoading = true

        setTimeout(() => {
            this.$store
                .dispatch('importKeyfile', data)
                .then((res) => {
                    parent.isLoading = false
                    let { updateSuiteStore } = this.globalHelper()
                    updateSuiteStore(this.$store.state)
                })
                .catch((err) => {
                    console.log(err)
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

    get canSubmit(): boolean {
        if (!this.file || !this.pass || !this.fileText) {
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
    padding: main.$container-padding;
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
    font-size: main.$m-size;
    font-weight: 400;
}
.file_in {
    width: 100%;
    margin: 30px auto 10px;
    font-size: 13px;
    border: none !important;
    background-color: var(--bg) !important;
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

@media only screen and (max-width: variables.$mobile_width) {
    h1 {
        font-size: main.$m-size-mobile;
    }

    .but_primary {
        width: 100%;
    }
}
@media only screen and (max-width: variables.$mobile_width) {
    .access_card {
        padding: main.$container-padding-mobile;
    }
}
</style>
