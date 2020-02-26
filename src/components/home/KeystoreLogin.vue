<template>
    <div>
        <v-file-input ref="fileIn"
                      filled flat full-width
                      :prepend-icon="null"
                      color="#42b983"
                      dense
                      v-model="file"
                      :label="$t('home.access_sel_file')"></v-file-input>

        <v-text-field type="password" :label="$t('password')"
                      persistent-hint color="#42b983" v-model="pass"
        ></v-text-field>
<!--        <v-btn type="file"></v-btn>-->
<!--        <v-text-field type="password" v-model="pass"></v-text-field>-->
        <v-alert type="error" outlined v-if="error" dense>{{error}}</v-alert>
        <v-btn @click="access"
               class="submitBut"
               block depressed
               color="#42b983"
               :loading="isLoading"
               :disabled="!formReady"
        >{{$t('home.submit')}}</v-btn>
    </div>
</template>
<script>
    export default {
        data(){
            return{
                pass: '',
                file: null,
                privateKey: null,
                isLoading: false,
                error: '',
            }
        },
        computed: {
            formReady(){
                if(this.pass.length > 0 && this.file != null) return true;
                return false;
            }
        },
        methods: {
            // readfile(file){
            //     let parent = this;
            //     // let input = this.$refs.fileIn;
            //
            //     console.log(file);
            //
            //     var reader = new FileReader();
            //         reader.onload = function(){
            //             var text = reader.result;
            //             // var output = document.getElementById('output');
            //             // output.src = dataURL;
            //
            //             let data = JSON.parse(text);
            //             console.log(data);
            //
            //             parent.privateKey = data.private;
            //
            //         };
            //         reader.readAsText(file);
            // },
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
                }, 200);
            }
        }
    }
</script>
<style scoped>
    .submitBut{
        color: #fff;
    }
</style>