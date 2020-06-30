<template>
    <div class="card">
        <h1>Private Key</h1>
        <form @submit.prevent="access">
            <qr-input class="key_in" v-model="privateKey"></qr-input>
            <p class="err" v-if="error">{{error}}</p>
            <remember-key
                class="remember"
                v-model="rememberKey"
                explain="Remember keys for easy access"
            ></remember-key>
            <router-link to="/access">Cancel</router-link>
            <hr>
            <v-btn class="ava_button but_primary" @click="access" color="#000" depressed>Access Wallet</v-btn>
        </form>
    </div>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop, Ref } from "vue-property-decorator";

// @ts-ignore
import { QrInput } from "@avalabs/vue_components";
import RememberKey from "../../components/misc/RememberKey.vue";
import { AddWalletInput } from "@/store/types";

@Component({
    components: {
        QrInput,
        RememberKey
    }
})
export default class AccessString extends Vue {
    isLoading: boolean = false;
    privateKey: string = "";
    rememberKey: boolean = false;
    error: string = "";

    async access() {
        let parent = this;
        this.isLoading = true;
        this.$store.state.rememberKey = this.rememberKey;

        let inData: AddWalletInput = {
            pk: this.privateKey,
            type: "hd"
        };

        try {
            let res = await this.$store.dispatch("accessWallet", inData);
            parent.isLoading = false;
        } catch (e) {
            this.error = "Invalid Private Key";
            this.isLoading = false;
        }
    }
}
</script>
<style scoped lang="scss">
@use '../../main';

.card {
    background-color: main.$background-color;
    padding: main.$container-padding;
    width: 100%;
    max-width: 1000px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

h1 {
    margin-top: main.$vertical-padding;
    font-weight: 400;
}

hr {
    border-color: main.$primary-color-light;
    opacity: 0.3;
}

form {
    width: 320px;
    display: flex;
    flex-direction: column;
}

.remember {
    margin-top: -20px;
    font-size: .75em;
}

.key_in {
    margin: 30px auto;
    margin-bottom: 6px;
    width: 100%;
    font-size: 13px;
    background-color: main.$white;
    border-radius: 4px;
}

a {
    color: main.$primary-color-light !important;
    text-decoration: underline !important;
    margin: 10px 0 20px;
}

.but_primary {
    margin: 0px auto;
    display: block;
    margin-top: 20px;
    margin-bottom: 15px;
}

.err {
    font-size: 13px;
    color: #f00;
    text-align: left;
    margin: 14px 0px !important;
}

@media only screen and (max-width: main.$mobile_width) {
    .card {
        overflow: auto;
        width: 100%;
    }

    .key_in {
        width: 100%;
        margin-bottom: 6px;
    }
}
</style>
