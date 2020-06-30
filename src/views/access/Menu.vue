<template>
    <div class="card">
        <div class="img_container">
            <img src="@/assets/diamond-primary.png" alt />
        </div>
        <h1>How do you want to access your wallet?</h1>
        <router-link to="/create" class="no_wallet">Don't have a wallet?</router-link>
        <hr>
        <div class="options">
            <div class="option">
                <h4>Private Key</h4>
                <!-- <p>ZvtFTgZjuVvrNrdBcfqFozx...</p> -->
                <router-link to="/access/private_key"></router-link>
            </div>
            <div class="option">
                <h4>Mnemonic Key Phrase</h4>
                <!-- <p>addict whip secret voice...</p> -->
                <router-link to="/access/mnemonic"></router-link>
            </div>
            <div class="option">
                <h4>Keystore File</h4>
                <!-- <p>AVA_ZvtFT.json</p> -->
                <router-link to="/access/keystore"></router-link>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
@use '../../main';

$col_w: 240px;
.card {
    background-color: main.$background-color !important;
    padding: main.$container-padding;
}

h1 {
    font-weight: 400;
}

img {
    width: 100px;
    height: 100px;
    max-height: none;
    margin-bottom: main.$vertical-padding;
}

hr {
    color: main.$primary-color-light;
    margin-top: main.$vertical-padding;
}

.options {
    margin: 30px auto;
    display: grid;
    grid-template-columns: repeat(3, $col_w);
    grid-gap: 30px;

    h4 {
        font-size: 18px;
    }

    p {
        font-size: 13px;
        margin-top: 12px !important;
        color: #1d82bb;
    }
}

a {
    color: main.$primary-color-light !important;
}

.no_wallet {
    text-decoration: underline !important;
}

.option {
    position: relative;
    transition-duration: 0.1s;
    transition-timing-function: ease-in;
    /* border: 1px solid #000; */
    border-radius: 4px;
    padding: 30px;
    color: main.$white;
    background-color: main.$primary-color;
    border-radius: 6px;
    font-family: "DM Sans", sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    padding: 8px 18px;

    a {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    &:hover {
        transform: translateY(-5px);
        box-shadow: 4px 8px 10px rgba(0, 0, 0, 0.2);
    }
}

@include main.mobile-device {
    .options {
        display: block;
        grid-template-columns: none;
    }

    .option {
        margin-bottom: 30px;
    }
}
</style>
