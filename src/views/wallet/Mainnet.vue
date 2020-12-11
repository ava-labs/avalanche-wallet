<template>
    <div class="manhattan">
        <div class="center_col">
            <h1>Mainnet Preview</h1>
            <p>
                This wallet is now connected to a
                <b>preview</b>
                of the mainnet.
            </p>
            <div class="points">
                <p>The balances shown will be the balance of this wallet on mainnet launch.</p>
                <p>Locked tokens can be staked.</p>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
.center_col {
    margin: 50px auto;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    /*text-align: center;*/
}
.points {
    p {
        margin: 14px 0 !important;
        padding-left: 14px;
        border-left: 2px solid var(--secondary-color);
    }
}

li {
    margin: 14px 0;
}
</style>
