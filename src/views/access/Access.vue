<template>
    <div class="access_view">
        <transition name="fade" mode="out-in">
            <router-view class="card"></router-view>
        </transition>
<!--        <div class="card">-->
<!--            <h1>Access Wallet</h1>-->
<!--            <p>How do you want to access your wallet?</p>-->
<!--            <div class="options">-->
<!--                <div class="option">-->
<!--                    <h4>Private Key</h4>-->
<!--                    <p>ZvtFTgZjuVvrNrdBcfqFozx...</p>-->
<!--                    <router-link to="/access/private_key"></router-link>-->
<!--                </div>-->
<!--                <div class="option">-->
<!--                    <h4>Keystore File</h4>-->
<!--                    <p>AVA_ZvtFT.json</p>-->
<!--                    <router-link to="/access/keystore"></router-link>-->
<!--                </div>-->
<!--            </div>-->
<!--            <router-link to="/create">Don't have a wallet?</router-link>-->
<!--        </div>-->
    </div>
</template>
<style scoped lang="scss">
    .access_view{
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #fff;
    }

    .card{
        text-align: center;
    }
</style>
