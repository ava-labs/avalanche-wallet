<template>
    <div id="nav">
<!--        <router-link v-if="!isAuth" to="/">Home</router-link>-->
<!--        <router-link v-if="isAuth" to="/wallet/ava">Wallet</router-link>-->
        <img src="/img/logo_dark.svg">
        <p class="app_name">BETA WALLET</p>
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
    img{
        max-height: 25px;
        margin: 0px 30px;
    }
    #nav{
        /*display: none;*/
        z-index: 2;
    }
    a{
        text-decoration: none;
    }

    .app_name{
        margin: 0;
        padding: 3px 6px;
        color: #ff9090;
        background-color: #fbefef;
    }
</style>