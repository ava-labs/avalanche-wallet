<template>
    <p class="spinner" :style="{
        color: color
    }"><fa icon="spinner"></fa></p>
</template>
<script>
    export default {
        props: {
            color: {
                type: String,
                default: "#fff"
            }
        }
    }
</script>
<style scoped lang="scss">
    .spinner{
        animation-name: spin;
        animation-duration: 1s;
        animation-iteration-count: infinite;
    }
    @keyframes spin {
        from {transform: rotateZ(0deg);}
        to {transform: rotateZ(360deg);}
    }
</style>
