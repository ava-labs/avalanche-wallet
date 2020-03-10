<template>
    <button class="copyBut">
        <button @click="copy"><fa icon="copy"></fa></button>
        <input ref="copytext" :value="value">
    </button>
</template>
<script>
    export default {
        props: {
            value: String,
        },
        methods: {
            copy(){
                let copytext = this.$refs.copytext;
                copytext.select();
                copytext.setSelectionRange(0, 99999);

                // console.log(copytext);

                document.execCommand("copy");
                this.$store.dispatch('Notifications/add', {
                    title: ' Copied',
                    message: 'Copied to clipoard.'
                });
            }
        }
    }
</script>
<style scoped>
    .copyBut input{
        width: 1px;
        position: absolute;
        opacity: 0;
    }
</style>