<template>
    <div>
        <div class="floaters">
            <send :assets="assets" class="floater"></send>
            <receive :assets="assets" class="floater"></receive>
        </div>
    </div>
</template>
<script>
    import Send from './Send';
    import Receive from './Receive';
    export default {
        components: {
            Send,
            Receive
        },
        computed: {
            assets(){
                return this.$store.state.assets;
            }
        }
    }
</script>
<style scoped>
    .dropdown-toggle{
        width: 100%;
    }
</style>