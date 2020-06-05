<template>
    <div class="copyBut" @click="copy">
<!--        <button @click="copy"></button>-->
        <img src="/img/copy_icon.png">
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
    img{
        width: 20px;
        object-fit: contain;
        pointer-events: none;
    }
    .copyBut{
        display: flex;
        width: max-content;
        cursor: pointer;
        /*align-self: center;*/
        /*justify-content: center;*/
    }
    .copyBut input{
        width: 1px;
        position: absolute;
        opacity: 0;
    }

    .text{
        user-select: none;
        pointer-events: none;
        margin-left: 6px !important;
    }

    input{
        pointer-events: none;
        user-select: none;
    }

    button{
        /*width: 18px;*/
        /*height: 18px;*/
        width: 100%;
        height: 100%;
        background-size: contain;
        background-position: center;
    }
</style>
