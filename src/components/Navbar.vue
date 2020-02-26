<template>
    <div id="nav">
<!--        <router-link v-if="!isAuth" to="/">Home</router-link>-->
<!--        <router-link v-if="isAuth" to="/wallet/ava">Wallet</router-link>-->
        <v-spacer></v-spacer>
        <language-select></language-select>
    </div>
</template>
<script>
    import LanguageSelect from './LanguageSelect';
    export default {
        components: {
            LanguageSelect
        },
        computed: {
            isAuth(){
                return this.$store.state.isAuth;
            }
        }
    }
</script>
<style scoped>
    #nav{
        z-index: 2;
    }
    a{
        text-decoration: none;
    }
</style>