<template>
    <div class="card_header">
        <p>{{$t('advanced.import.desc')}}</p>
        <v-file-input v-model="file" label="Select Key File" filled
                      color="#42b983"
                      dense
                      :hide-details="true"
                      :prepend-icon="null"></v-file-input>
        <v-text-field type="password" label="Password"
                      persistent-hint color="#42b983" v-model="pass"
        ></v-text-field>
        <v-alert type="error" outlined v-if="error" dense>{{error}}</v-alert>
        <v-btn depressed :disabled="!isValid" color="#42b983"
               :loading="isLoading"
               @click="importKeyfile">{{$t('advanced.import.submit')}}</v-btn>
    </div>
</template>
<script>
    export default {
        data(){
            return {
                pass: "",
                file: null,
                error: '',
                isLoading: false,
            }
        },
        computed: {
            isValid(){
                if(this.pass.length > 0 && this.file !== null){
                    return true;
                }
                return false;
            }
        },
        methods: {
            importKeyfile(){
                let parent = this;
                this.isLoading = true;
                this.error = '';
                let data = {
                    password: this.pass,
                    file: this.file
                }

                setTimeout(function(){
                    parent.$store.dispatch('importKeyfile', data).then((res) => {
                        parent.isLoading = false;
                        parent.pass = "";
                        parent.file = null;
                        parent.$store.dispatch("Notifications/add", {
                            title: "Key File Import" ,
                            message: "Your keys are imported."
                        })
                    }).catch( (err)=>{
                        parent.isLoading = false;
                        parent.error = err.message;
                    });
                }, 200);

            }
        }
    }
</script>