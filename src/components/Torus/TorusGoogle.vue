<template>
    <button class="ava_button" @click="createKeyWithGoogle">
        <template v-if="!isLoading">
            <fa :icon="['fab', 'google']"></fa>
            {{ text }}
        </template>
        <Spinner v-else class="spinner"></Spinner>
    </button>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

// import TorusSdk from "@toruslabs/torus-direct-web-sdk";
import { torusdirectsdk } from '@/Torus'
import { Buffer } from 'buffer/'
import { avm, bintools } from '@/AVA'
import { keyToKeypair } from '@/helpers/helper'

import Spinner from '@/components/misc/Spinner.vue'

@Component({
    components: {
        Spinner,
    },
})
export default class Torus extends Vue {
    isLoading: boolean = false

    @Prop({ default: 'Access with Google' }) text?: string

    async createKeyWithGoogle() {
        this.isLoading = true

        let loginDetails
        try {
            loginDetails = await torusdirectsdk.triggerLogin({
                typeOfLogin: 'google',
                verifier: 'avax-google',
                clientId:
                    '1070325514010-bd1u2umjanoe6hn6fsqqhquatj5mhc6i.apps.googleusercontent.com',
            })
        } catch (e) {
            console.error(e)
            this.isLoading = false
            return
        }

        let key = loginDetails.privateKey

        let pk = bintools.cb58Encode(Buffer.from(key, 'hex'))
        let chainId = avm.getBlockchainAlias() || avm.getBlockchainID()
        let keyPair = keyToKeypair(pk, chainId)

        try {
            this.$store.state.rememberKey = false
            let res = await this.$store.dispatch('accessWallet', keyPair)
        } catch (e) {
            this.isLoading = false
            console.error('error', e)
        }
    }
}
</script>
<style scoped lang="scss">
.spinner {
    width: 100% !important;
    color: var(--bg) !important;
}
</style>
