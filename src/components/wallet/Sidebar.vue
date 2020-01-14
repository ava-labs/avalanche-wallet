<template>
    <div class="wallet_sidebar">
        <router-link to="/wallet/ava">AVA</router-link>
<!--        <router-link to="/wallet/assets">Assets</router-link>-->
        <router-link to="/wallet/history">Transaction History</router-link>

<!--        <button>AVA</button>-->
<!--        <button>Assets</button>-->
    </div>
</template>
<style lang="scss" scoped>
    .wallet_sidebar{
        padding: 20px 0px;
    }
    .wallet_sidebar a{
        display: block;
        width: 100%;
        border: none;
        background-color: transparent;
        padding: 5px;
        color: #7d7d7d;

        &.router-link-exact-active {
             color: #42b983;
         }
    }
</style>