<template>
    <div class="wallet_sidebar">
        <router-link to="/wallet">
            <img src="@/assets/sidebar/Home.png">
            Home
        </router-link>
        <router-link to="/wallet/keys">
            <img src="@/assets/sidebar/Key.png">

            Manage Keys
        </router-link>
        <router-link to="/wallet/transfer">
            <img src="@/assets/sidebar/Transfer.png">
            Transfer
        </router-link>
    </div>
</template>
<style lang="scss" scoped>
    @use '../../main';

    .wallet_sidebar{
        padding: 20vh 0px !important;
        display: flex;
        flex-direction: column;

        a{
            padding: 14px 24px;
            /*margin-bottom: 30px;*/
            white-space: nowrap;
        }

        a.router-link-exact-active{
            /*color: #9974f1 !important;*/
            background-color: #F5F6FA;
        }
    }


    img{
        height: 16px;
        width: 20px;
        margin-right: 15px;
        object-fit: contain;
    }
</style>
