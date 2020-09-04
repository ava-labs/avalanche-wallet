<template>
    <div class="avax_input">
        <BigNumInput class="amt_in" :denomination="9"></BigNumInput>
        <p>AVAX</p>
    </div>
</template>
<script>
//@ts-ignore
import { BigNumInput } from "@avalabs/vue_components";
export default {
    components: {
        BigNumInput
    }
}
</script>
<style scoped lang="scss">
.avax_input{
    display: grid;
    grid-template-columns: 1fr max-content;
    grid-gap: 10px;
    color: var(--primary-color);
    width: 100%;
}
.amt_in{
    color: var(--primary-color);
    font-family: monospace;
}

.amt_in, p{
    padding: 8px 14px;
    background-color: var(--bg-light);
    border-radius: 3px;
}
</style>
