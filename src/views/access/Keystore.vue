<template>
    <div class="access_card">
        <div class="content">
            <h1>Keystore File</h1>
            <file-input class="file_in" @change="onfile"></file-input>
            <form @submit.prevent="access">
                <v-text-field
                        class="pass"
                        label="Password"
                        outlined
                        dense
                        color="#4C2E56"
                        type="password"
                        v-model="pass"
                        v-if="file"
                        hide-details
                ></v-text-field>
                <p class="err">{{error}}</p>
                <remember-key v-model="rememberKey" v-if="file"></remember-key>
                <v-btn
                        class="ava_button"
                        @click="access"
                        color="#4C2E56"
                        :loading="isLoading"
                        v-if="file"
                        :disabled="!canSubmit"
                        depressed
                >Access Wallet</v-btn>
            </form>
            <router-link to="/access" class="link">Cancel</router-link>
        </div>
    </div>
</template>
<script>
import FileInput from "../../components/misc/FileInput";
import RememberKey from "../../components/misc/RememberKey";

export default {
    components: {
        RememberKey,
        FileInput
    },
    data() {
        return {
            pass: "",
            file: null,
            rememberKey: false,
            isLoading: false,
            error: "",
        }
    },
    methods: {
        onfile(val) {
            console.log(val);
            this.file = val;
        },

        access() {
            if (!this.canSubmit || this.isLoading) return;

            let parent = this;
            this.error = '';
            this.isLoading = true;
            let data = {
                password: this.pass,
                file: this.file
            };

            // Set the key remembering state
            this.$store.state.rememberKey = this.rememberKey;


            setTimeout(function () {
                parent.$store.dispatch('importKeyfile', data).then((res) => {
                    parent.isLoading = false;
                }).catch((err) => {
                    parent.isLoading = false;
                    parent.error = err.message;
                });
            }, 200);}
    },
    computed: {
        canSubmit() {
            if (this.file && this.pass) {
                return true;
            }
            return false;
        }
    }
}
</script>
<style scoped lang="scss">
@use '../../main';


.ava_button{
    width: 100%;
    margin-bottom: 22px;
}
.access_card {
    /*max-width: 80vw;*/
    background-color: main.$background-color;
    padding: main.$container-padding;
    width: 100%;
    /*max-width: 240px;*/
    /*max-width: 1000px;*/
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 6px;
}

.content{
    width: 100%;
    max-width: 240px;
    margin: 0px auto;
}

h1 {
    font-size: main.$m-size;
    font-weight: 400;
}

.file_in {
    margin: 30px auto 10px;
    font-size: 13px;
    background-color: transparent;
    /*min-width: 200px*/
}

a {
    color: main.$primary-color-light !important;
    text-decoration: underline !important;
    margin: 10px 0 20px;
}


.err {
    font-size: 13px;
    color: #f00;
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
