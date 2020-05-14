<template>
    <div class="export_wallet">
        <p class="explain">{{$t('advanced.export.desc')}} </p>
        <label>Password</label>
        <v-text-field type="password" class="formIn"
                      v-model="pass" hint="Minimum 9 characters."  placeholder="Password" persistent-hint outlined dense color="#000" height="40"
        ></v-text-field>
        <label>Confirm Password</label>
        <v-text-field type="password" class="formIn"
                      v-model="passConfirm" hide-details outlined dense color="#000" height="40" placeholder="Confirm Password"
        ></v-text-field>
        <v-btn depressed :disabled="!isValid" color="#000"
               @click="download" :loading="is_loading" class="but_primary">{{$t('advanced.export.submit')}}</v-btn>
    </div>
</template>
<script>
    export default {
        data(){
            return {
                is_loading: false,
                pass: '',
                passConfirm: ''
            }
        },

        computed: {
            isValid(){
                if(this.pass.length >= 9 && this.pass===this.passConfirm) return true;
                return false;
            },
        },
        methods: {
            async download(){
                let parent = this;
                this.is_loading = true;

                setTimeout(function(){
                    parent.$store.dispatch('exportKeyfile', parent.pass).then( (res) => {
                        parent.is_loading = false;
                        parent.pass = "";
                        parent.$store.dispatch("Notifications/add", {
                            title: "Key File Export" ,
                            message: "Your keys are downloaded."
                        });
                    });
                }, 200);
            }
        },
    }
</script>
<style lang="scss">
    .export_wallet{
        .formIn{
            .v-input__slot {
                background-color: #f8f8f8;
            }

            .v-text-field__details{
                padding: 0;
            }
        }
    }
</style>
<style scoped lang="scss">
    .export_wallet{
        font-size: 12px;
    }
    .explain{
        /*font-size: 12px;*/
        margin-bottom: 20px !important;
    }

    .v-text-field{
        /*margin-bottom: 8px;*/
        .v-input__slot {
            .v-input__slot {
                /*background-color: #f8f8f8;*/
            }
        }
    }

    .formIn{
        /*background-color: #f8f8f8;*/
        font-size: 12px;
        /*margin-bottom: 6px;*/
    }

    .but_primary{
        margin-top: 10px;
    }
</style>
