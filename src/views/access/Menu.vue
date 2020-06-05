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
                <h4>Mnemonic Key Phrase</h4>
                <p>addict whip secret voice...</p>
                <router-link to="/access/mnemonic"></router-link>
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
    @use '../../main';

    $col_w: 240px;
    .options{
        margin: 30px auto;
        display: grid;
        grid-template-columns: repeat(3,$col_w);
        grid-gap: 30px;

        >div{

        }

        h4{
            font-size: 18px;
        }

        p{
            font-size: 13px;
            margin-top: 12px !important;
            color: #1D82BB;
        }
    }

    a{
        color: #1D82BB !important;
    }

    .option{
        position: relative;
        transition-duration: 0.1s;
        transition-timing-function: ease-in;
        border: 1px solid #000;
        border-radius: 4px;
        padding: 30px;

        a{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }


        &:hover{
            transform: translateY(-5px);
            box-shadow: 4px 8px 10px rgba(0,0,0,0.2);
        }
    }

    @include main.mobile-device{
        .options{
            display: block;
            grid-template-columns: none;
        }

        .option{
            margin-bottom: 30px;
        }
    }
</style>
