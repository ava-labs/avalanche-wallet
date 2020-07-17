<template>
    <div class="access_card">
        <div class="content">
            <h1>Keystore File</h1>
            <file-input class="file_in" @change="onfile"></file-input>
            <form @submit.prevent="access">
                <v-text-field
                        class="pass"
                        label="Password"
                        dense
                        solo
                        flat
                        type="password"
                        v-model="pass"
                        v-if="file"
                        hide-details
                ></v-text-field>
                <p class="err">{{error}}</p>
                <remember-key class="remember" v-model="rememberPass" v-if="file" @is-valid="isRememberValid"></remember-key>
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
<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

import FileInput from "../../components/misc/FileInput.vue";
import RememberKey from "../../components/misc/RememberKey.vue";
import {ImportKeyfileInput} from "@/store/types";
import {KeyFile} from "@/js/IKeystore";


@Component({
    components: {
        RememberKey,
        FileInput
    }
})
export default class Keystore extends Vue{
    pass: string = "";
    file: File|null = null;
    fileText: string|null = null;
    rememberPass: string|null = null;
    rememberValid: boolean = true;
    isLoading: boolean = false;
    error: string = "";


    onfile(val: File) {
        this.file = val;
        let parent = this;


        let reader = new FileReader();
            reader.addEventListener('load', async () => {
                let res = reader.result as string;
                parent.fileText = res;
            });
            reader.readAsText(val);
    }

    isRememberValid(val: boolean){
        this.rememberValid = val;
    }
    access() {
        if (!this.canSubmit || this.isLoading) return;

        let parent = this;
        this.error = '';

        let fileData:KeyFile;
        try{
            fileData = JSON.parse(this.fileText as string);
        }catch(e){
            this.error = "Unable to parse JSON file."
            return;
        }

        // console.log(this.fileText);
        // return;

        let rememberPass = this.rememberPass;
        let data: ImportKeyfileInput = {
            password: this.pass,
            data: fileData
        };

        this.isLoading = true;

        setTimeout(() => {
            this.$store.dispatch('importKeyfile', data).then((res) => {
                parent.isLoading = false;

                if(rememberPass){
                    parent.$store.dispatch('rememberWallets', rememberPass)
                }
            }).catch((err) => {
                console.log(err);
                if(err === "INVALID_PASS"){
                    parent.error = "Invalid password."
                }else{
                    parent.error = err.message;
                }
                parent.isLoading = false;
            });

        }, 200);
    }


    get canSubmit():boolean {
        if (!this.file || !this.pass || !this.rememberValid || !this.fileText) {
            return false;
        }

        return true;
    }
}
// export default {
//     components: {
//         RememberKey,
//         FileInput
//     },
//     data() {
//         return {
//             pass: "",
//             file: null,
//             rememberPass: null,
//             rememberValid: true,
//             isLoading: false,
//             error: "",
//         }
//     },
//     methods: {
//         onfile(val) {
//             this.file = val;
//         },
//
//         isRememberValid(val){
//             this.rememberValid = val;
//         },
//         access() {
//             if (!this.canSubmit || this.isLoading) return;
//
//             let parent = this;
//             this.error = '';
//             this.isLoading = true;
//
//             let rememberPass = this.rememberPass;
//             let data = {
//                 password: this.pass,
//                 file: this.file
//             };
//
//             setTimeout(() => {
//                 this.$store.dispatch('importKeyfile', data).then((res) => {
//                     parent.isLoading = false;
//
//                     if(rememberPass){
//                         parent.$store.dispatch('rememberWallets', rememberPass)
//                     }
//                 }).catch((err) => {
//                     console.log(err);
//                     if(err === "INVALID_PASS"){
//                         parent.error = "Invalid password."
//                     }else{
//                         parent.error = err.message;
//                     }
//                     parent.isLoading = false;
//                 });
//
//             }, 200);
//         }
//     },
//     computed: {
//         canSubmit() {
//             if (!this.file || !this.pass || !this.rememberValid) {
//                 return false;
//             }
//
//             return true;
//         }
//     }
// }
</script>
<style scoped lang="scss">
@use '../../main';


.pass{
    background-color: #FFF !important;
}
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
    width: 340px;
    max-width: 100%;
    margin: 0px auto;
}

h1 {
    font-size: main.$m-size;
    font-weight: 400;
}

.file_in {
    margin: 30px auto 10px;
    font-size: 13px;
    border: none !important;
    background-color: #fff !important;
    /*min-width: 200px*/
}

a {
    color: main.$primary-color-light !important;
    text-decoration: underline !important;
    margin: 10px 0 20px;
}

.remember{
    margin: 12px 0;
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
