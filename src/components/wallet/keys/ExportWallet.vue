<template>
    <div>
        <p class="explain">{{$t('advanced.export.desc')}} </p>
        <v-text-field type="password" hint="Minimum 9 characters." label="Password"
                      v-model="pass" persistent-hint outlined dense color="#000"
        ></v-text-field>
        <v-text-field type="password" hint="Minimum 9 characters." label="Confirm Password"
                      v-model="passConfirm" persistent-hint outlined dense color="#000"
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
<style scoped lang="scss">
    .explain{
        font-size: 12px;
        margin-bottom: 10px !important;
    }
    .but_primary{
        margin-top: 15px;
    }
</style>
