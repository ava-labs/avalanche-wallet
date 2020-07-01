<template>
    <div class="card">
        <div class="img_container">
            <img src="@/assets/diamond-primary.png" alt />
        </div>
        <h1>How do you want to access your wallet?</h1>
        <router-link to="/create" class="link">Don't have a wallet?</router-link>
        <hr />
        <div class="options">
            <div class="option">
                <h2>Private Key</h2>
                <router-link to="/access/private_key"></router-link>
            </div>
            <div class="option">
                <h2>Mnemonic Key Phrase</h2>
                <router-link to="/access/mnemonic"></router-link>
            </div>
            <div class="option">
                <h2>Keystore File</h2>
                <router-link to="/access/keystore"></router-link>
            </div>
        </div>
        <router-link to="/" class="link">Cancel</router-link>
    </div>
</template>
<style scoped lang="scss">
@use "../../main";

$col_w: 240px;

.card {
    background-color: main.$background-color !important;
    padding: main.$container-padding;
}

img {
    width: main.$img-size;
    height: main.$img-size;
    margin-bottom: main.$vertical-padding;
}

h1 {
    font-size: main.$l-size;
    font-weight: 400;
}

hr {
    max-width: 67% !important;
    margin: main.$vertical-padding auto 0;
    color: main.$primary-color-light;
    opacity: 0.2;
}

.options {
    margin: 30px auto;
    display: grid;
    grid-template-columns: repeat(3, $col_w);
    grid-gap: 30px;

    .option {
        position: relative;
        transition-duration: 0.1s;
        transition-timing-function: ease-in;
        border-radius: 4px;
        padding: 30px;
        color: main.$white;
        background-color: main.$primary-color;
        border-radius: 6px;
        font-family: "DM Sans", sans-serif;
        font-weight: 700;
        text-transform: uppercase;
        padding: 8px 18px;

        &:hover {
            transform: translateY(-5px);
            box-shadow: 4px 8px 10px rgba(0, 0, 0, 0.2);
        }

        h2 {
            font-size: main.$s-size;
        }

        a {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
    }
}

@include main.mobile-device {
    img {
        width: main.$img-size-mobile;
        height: main.$img-size-mobile;
        margin-bottom: main.$vertical-padding-mobile;
    }

    h1 {
        font-size: main.$l-size-mobile;
    }

    .card {
        padding: main.$container-padding-mobile;
    }

    .options {
        display: block;
        grid-template-columns: none;

        .option {
            margin-bottom: 15px;

            h2 {
                font-size: main.$s-size-mobile;
            }
        }
    }
}
</style>
