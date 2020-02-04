<template>
    <div class="wallet_sidebar">
        <router-link to="/wallet/ava">
            <span>
                <fa class="icon" icon="globe"></fa>
            </span>
            AVA
        </router-link>


<!--        <router-link to="/wallet/transfer">-->
<!--            <span>-->
<!--                <fa class="icon" icon="exchange-alt"></fa>-->
<!--            </span>-->
<!--            Transfer-->
<!--        </router-link>-->

<!--        <router-link to="/wallet/history">-->
<!--            <span>-->
<!--                <fa class="icon" icon="history"></fa>-->
<!--            </span>-->
<!--            Transaction History-->
<!--        </router-link>-->

        <router-link to="/wallet/advanced">
            <span>
                <fa class="icon" icon="dna"></fa>
            </span>
            Advanced
        </router-link>
    </div>
</template>
<style lang="scss" scoped>
    .wallet_sidebar{
        /*padding: 20px 0px;*/
    }
    .wallet_sidebar a{
        display: block;
        width: 100%;
        border: none;
        background-color: transparent;
        padding: 10px;
        text-decoration: none;
        text-align: left;
        font-weight: bold;
        color: #ccc;
        font-size: 15px;
        border-bottom: 1px solid #39403d;
        &.router-link-active {
            color: #42b983;
            background-color: #42b98330;
            border-right: 4px solid #42b983;
         }
    }

    .wallet_sidebar a span{
        padding: 0px 10px;
    }


    @media only screen and (max-width: 600px) {
        .wallet_sidebar a{
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            text-align: center;
            justify-content: flex-start;
            font-size: 12px;

            &.router-link-active {
                border-right: none;
                border-bottom: 4px solid #42b983;
            }
        }
    }
</style>