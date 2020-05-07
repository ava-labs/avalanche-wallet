<template>
    <div class="card">
        <h1>Access Wallet</h1>
        <p>How do you want to access your wallet?</p>
        <div class="options">
            <div class="option">
                <h4>Private Key</h4>
                <p>ZvtFTgZjuVvrNrdBcfqFozx...</p>
                <router-link to="/access/private_key"></router-link>
            </div>
            <div class="option">
                <h4>Keystore File</h4>
                <p>AVA_ZvtFT.json</p>
                <router-link to="/access/keystore"></router-link>
            </div>
        </div>
        <router-link to="/create">Don't have a wallet?</router-link>
    </div>
</template>
<style scoped lang="scss">
    $col_w: 240px;
    .options{
        margin: 30px auto;
        display: grid;
        grid-template-columns: $col_w $col_w;
        grid-gap: 30px;

        >div{
            box-shadow: 2px 2px 10px rgba(0,0,0,0.2);
            border-radius: 4px;
            padding: 30px;
        }

        h4{
            font-size: 18px;
        }

        p{
            font-size: 13px;
            margin-top: 12px !important;
            color: #ac65d8;
        }
    }

    a{
        color: #1D82BB !important;
    }

    .option{
        position: relative;

        a{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
    }
</style>
