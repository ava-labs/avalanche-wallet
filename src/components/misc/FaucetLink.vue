<template>
    <div class="faucet">
        <p class="drop"><fa icon="tint"></fa></p>
        <p>{{ $t('transfer.faucet') }}</p>
        <a :href="faucetLink + `?address=${selectedAddress}`" target="_blank" class="but_primary">
            Go to faucet
        </a>
    </div>
</template>
<script>
export default {
    computed: {
        faucetLink() {
            let link = process.env.VUE_APP_FAUCET_LINK
            if (link) return link
            return null
        },
        selectedAddress() {
            return this.$store.state.address
        },
    },
}
</script>
<style scoped lang="scss">
.faucet {
    background-color: #e4f1fb;
    border-radius: 8px;
    width: 140px;
    padding: 6px 14px;
    border: 1px solid #aaa;
    font-size: 13px;
    justify-self: center;
    text-align: center;

    p {
        margin: 10px 0px !important;
    }

    .drop {
        font-size: 45px;
    }

    a {
        box-sizing: border-box;
        width: 100%;
        display: block;
        white-space: nowrap;
    }
}
</style>
