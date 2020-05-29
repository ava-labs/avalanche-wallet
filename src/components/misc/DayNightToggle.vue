<template>
    <button v-if="val" @click="toggle">
        Night
    </button>
    <button v-else @click="toggle">
        Day
    </button>
</template>
<script>
    export default {
        data(){
            return {
                val: false,
            }
        },
        methods:{
            toggle(){
                this.val = !this.val;

                if(this.val){
                    this.$root.$el.setAttribute('night_mode', '');
                    this.$root.$el.removeAttribute('day_mode')
                }else{
                    this.$root.$el.setAttribute('day_mode', '');
                    this.$root.$el.removeAttribute('night_mode')
                }
            }
        },
        created(){
            this.$root.$el.setAttribute('day_mode', '');
            this.$root.$el.removeAttribute('night_mode')
        }
    }
</script>
