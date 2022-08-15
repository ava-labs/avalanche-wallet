<template>
    <div class="add_key_file">
        <label>{{ $t('keystore.title') }}</label>
        <form @submit.prevent="importKeyfile">
            <file-input @change="onfile" class="formIn" ref="fileIn"></file-input>
            <label>{{ $t('keys.export_placeholder1') }}</label>
            <v-text-field
                class="formIn"
                :placeholder="$t('keys.export_placeholder1')"
                dense
                outlined
                hide-details
                type="password"
                v-model="pass"
            ></v-text-field>
            <p v-if="err" class="err">{{ err }}</p>
            <v-btn
                type="submit"
                :loading="isLoading"
                :disabled="!canSubmit"
                class="addKeyBut button_primary ava_button"
                depressed
                block
            >
                {{ $t('keys.import_key_button') }}
            </v-btn>
        </form>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Ref } from 'vue-property-decorator'
import FileInput from '@/components/misc/FileInput.vue'
import { ImportKeyfileInput } from '@/store/types'
import { AllKeyFileTypes } from '@/js/IKeystore'
import { KEYSTORE_VERSION } from '@/js/Keystore'

@Component({
    components: {
        FileInput,
    },
})
export default class AddKeyFile extends Vue {
    canAdd: boolean = false
    pass: string = ''
    keyfile: File | null = null
    isLoading: boolean = false
    err: string | null = null
    fileText: string | null = null

    @Ref('fileIn') readonly fileIn!: FileInput

    get canSubmit() {
        return this.keyfile && this.pass && this.fileText ? true : false
    }

    onfile(val: File) {
        this.keyfile = val
        let parent = this

        let reader = new FileReader()
        reader.addEventListener('load', async () => {
            let res = reader.result as string
            parent.fileText = res
        })
        reader.readAsText(val)
    }

    importKeyfile() {
        let fileData: AllKeyFileTypes
        this.err = null

        try {
            fileData = JSON.parse(this.fileText as string)
        } catch (e) {
            this.err = 'Unable to parse JSON file.'
            return
        }

        if (fileData.version != KEYSTORE_VERSION) {
            // TODO: update here?
            this.err =
                'Tried to import an old keystore version. Please update your keystore file before importing.'
            return
        }

        this.isLoading = true

        setTimeout(async () => {
            let input: ImportKeyfileInput = {
                password: this.pass,
                data: fileData,
            }

            try {
                await this.$store.dispatch('importKeyfile', input)
                // @ts-ignore
                this.$emit('success')
                this.clear()
            } catch (err) {
                this.isLoading = false
                if (err === 'INVALID_PASS') {
                    this.err = 'Invalid password.'
                } else {
                    this.err = 'Failed to read keystore file.'
                }

                // this.$store.dispatch("Notifications/add", {
                //     type: "error",
                //     title: "Import Failed",
                //     message: err.message
                // });
            }
        }, 200)
    }

    clear() {
        this.isLoading = false
        this.pass = ''
        this.keyfile = null
        this.canAdd = false
        this.err = null
        this.fileIn.clear()
    }
}
</script>
<style lang="scss">
.add_key_file {
    fieldset {
        border: none !important;
    }
}
</style>
<style scoped lang="scss">
@use '../../../styles/main';
.add_key_file {
    padding: 14px 0;
}

.addKeyBut {
    text-transform: none;
    border-radius: 2px;
    margin-top: 14px;
}

label {
    font-size: 12px;
    color: main.$primary-color-light;
}

.err {
    color: var(--error);
    margin: 4px 0px;
    font-size: 12px;
}

.formIn {
    height: 40px;
    font-size: 12px;
    background-color: var(--bg-light) !important;
    border-radius: 2px;
}
</style>
<style lang="scss">
.add_key_file {
    .formIn .v-input__slot {
        background-color: var(--bg-light) !important;
    }
}
</style>
