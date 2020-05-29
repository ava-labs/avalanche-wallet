<template>
    <div class="card">
        <h1>Keystore File</h1>
        <file-input class="file_in" @change="onfile"></file-input>
        <form @submit.prevent="access">
            <v-text-field label="Password" outlined dense color="#000" type="password" v-model="pass" v-if="file" hide-details></v-text-field>
            <p class="err">{{error}}</p>
            <remember-key v-model="rememberKey" v-if="file"></remember-key>
            <v-btn class="but_primary" @click="access" color="#000" :loading="isLoading" v-if="file" :disabled="!canSubmit" depressed>Access Wallet</v-btn>
        </form>
        <router-link to="/access">Cancel</router-link>
    </div>
</template>
<script>
    import FileInput from "../../components/misc/FileInput";
    import RememberKey from "../../components/misc/RememberKey";

    export default {
        components:{
            RememberKey,
            FileInput
        },
        data(){
            return{
                pass: "",
                file: null,
                rememberKey: false,
                isLoading: false,
                error: "",
            }
        },
        methods: {
            onfile(val){
                console.log(val);
                this.file = val;
            },
            access(){
                if(!this.canSubmit || this.isLoading) return;

                let parent = this;
                this.error = '';
                this.isLoading = true;
                let data = {
                    password: this.pass,
                    file: this.file
                };

                // Set the key remembering state
                this.$store.state.rememberKey = this.rememberKey;


                setTimeout(function(){
                    parent.$store.dispatch('importKeyfile', data).then( (res) => {
                        parent.isLoading = false;
                    }).catch((err)=>{
                        parent.isLoading = false;
                        parent.error = err.message;
                    });
                }, 200);            }
        },
        computed:{
            canSubmit(){
                if(this.file && this.pass){
                    return true;
                }
                return false;
            }
        }
    }
</script>
<style scoped lang="scss">
    @use '../../main';

    .card{
        width: 420px;
        max-width: 80vw;
    }
    .file_in{
        margin-top: 30px;
        margin-bottom: 10px;
        /*width: 380px;*/
        width: 100%;
        font-size: 13px;
        background-color: transparent;
    }

    a{
        color: #1D82BB !important;
    }

    .but_primary{
        margin: 0px auto;
        display: block;
        margin-bottom: 15px;
        /*color: #fff;*/
        /*text-transform: none;*/
    }

    .err{
        font-size: 13px;
        color: #f00;
        margin: 14px 0px !important;
    }

    @media only screen and (max-width: main.$mobile_width) {
        .but_primary{
            width: 100%;
        }
    }
</style>
