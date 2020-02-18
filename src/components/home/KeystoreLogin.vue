<template>
    <div>
        <v-file-input ref="fileIn" @change="readfile"
                      filled flat full-width
                      label="Upload Keystore File"></v-file-input>
<!--        <v-btn type="file"></v-btn>-->
<!--        <v-text-field type="password" v-model="pass"></v-text-field>-->
        <v-btn @click="access">Access Wallet</v-btn>
    </div>
</template>
<script>
    export default {
        data(){
            return{
                pass: '',
                privateKey: null,
            }
        },
        methods: {
            readfile(file){
                let parent = this;
                // let input = this.$refs.fileIn;

                console.log(file);

                var reader = new FileReader();
                    reader.onload = function(){
                        var text = reader.result;
                        // var output = document.getElementById('output');
                        // output.src = dataURL;

                        let data = JSON.parse(text);
                        console.log(data);

                        parent.privateKey = data.private;

                    };
                    reader.readAsText(file);
            },
            access(){
                console.log(this.privateKey);
                this.$store.dispatch('accessWallet', this.privateKey);
            }
        }
    }
</script>