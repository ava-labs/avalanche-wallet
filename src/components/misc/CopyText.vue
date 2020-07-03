<template>
    <div class="copyBut" @click="copy">
        <fa icon="copy"></fa>
        <p class="text">
            <slot></slot>
        </p>
        <input ref="copytext" :value="value">
    </div>
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

                document.execCommand("copy");
                this.$store.dispatch('Notifications/add', {
                    title: ' Copied',
                    message: 'Copied to clipoard.'
                });
            }
        }
    }
</script>
<style scoped lang="scss">
    .copyBut {
        display: flex;
        width: max-content;
        align-items: center;
        cursor: pointer;
    }
    .copyBut input{
        width: 1px;
        position: absolute;
        opacity: 0;
    }
    .text{
        user-select: none;
        pointer-events: none;
        margin-left: 12px !important;
    }
    input{
        pointer-events: none;
        user-select: none;
    }
    button{ 
        width: 100%;
        height: 100%;
        background-size: contain;
        background-position: center;
    }
</style>
