<template>
    <div class="card">
        <h1>Keystore File</h1>
        <file-input class="file_in" @change="onfile"></file-input>
        <v-text-field label="Password" outlined dense color="#000" type="password" v-model="pass" v-if="file" hide-details></v-text-field>
        <p class="err">{{error}}</p>
        <v-btn class="but_primary" @click="access" color="#000" :loading="isLoading" v-if="file" :disabled="!canSubmit" depressed>Access Wallet</v-btn>
        <router-link to="/access">Cancel</router-link>
    </div>
</template>
<script>
    import FileInput from "../../components/misc/FileInput";

    export default {
        components:{
            FileInput
        },
        data(){
            return{
                pass: "",
                file: null,
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
                let parent = this;
                this.error = '';
                this.isLoading = true;
                let data = {
                    password: this.pass,
                    file: this.file
                };

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
