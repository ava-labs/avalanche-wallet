<template>
    <div id="nav">
        <router-link v-if="!isAuth" to="/">Home</router-link>
        <router-link v-if="isAuth" to="/wallet/ava">Wallet</router-link>
    </div>
</template>
<script>
    export default {
        computed: {
            isAuth(){
                return this.$store.state.isAuth;
            }
        }
    }
</script>
<style scoped>
    a{
        text-decoration: none;
    }
</style>