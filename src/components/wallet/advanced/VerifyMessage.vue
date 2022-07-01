<template>
    <div>
        <h2>{{ $t('advanced.verify.title') }}</h2>
        <p style="margin-bottom: 14px !important">
            {{ $t('advanced.verify.desc') }}
        </p>
        <div>
            <label>{{ $t('advanced.verify.label1') }}</label>
            <textarea v-model="message"></textarea>
        </div>
        <div>
            <label>{{ $t('advanced.verify.label2') }}</label>
            <textarea v-model="signature"></textarea>
        </div>
        <p class="err">{{ error }}</p>
        <v-btn
            class="button_secondary"
            block
            small
            depressed
            @click="verify"
            :disabled="!canSubmit"
        >
            {{ $t('advanced.verify.submit') }}
        </v-btn>
        <div v-if="addressX" class="result">
            <label>{{ $t('advanced.verify.label3') }}</label>
            <p class="address">{{ addressX }}</p>
            <p class="address">{{ addressP }}</p>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { KeyPair } from '@c4tplatform/camino/dist/apis/avm'
import { ava, bintools } from '@/AVA'
import { Buffer } from '@c4tplatform/camino'
import { digestMessage } from '@/helpers/helper'

@Component
export default class VerifyMessage extends Vue {
    message: string = ''
    addressX: string = ''
    addressP: string = ''
    signature = ''
    error = ''

    submit() {
        this.addressX = ''
        this.addressP = ''
        this.error = ''
        try {
            this.verify()
        } catch (e) {
            this.error = (e as Error).message
        }
    }
    verify() {
        let digest = digestMessage(this.message)
        let digestBuff = Buffer.from(digest.toString('hex'), 'hex')

        let hrp = ava.getHRP()
        let keypair = new KeyPair(hrp, 'X')

        let signedBuff = bintools.cb58Decode(this.signature)

        let pubKey = keypair.recover(digestBuff, signedBuff)
        let addressBuff = keypair.addressFromPublicKey(pubKey)
        this.addressX = bintools.addressToString(hrp, 'X', addressBuff)
        this.addressP = bintools.addressToString(hrp, 'P', addressBuff)
    }

    clear() {
        this.message = ''
        this.signature = ''
        this.addressX = ''
        this.addressP = ''
        this.error = ''
    }

    deactivated() {
        this.clear()
    }

    get canSubmit() {
        if (!this.message || !this.signature) return false

        return true
    }
}
</script>
<style lang="scss" scoped>
textarea,
input,
.address {
    padding: 6px 12px;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.1);
    font-size: 13px;
}

label {
    display: block;
    text-align: left;
    color: var(--primary-color-light);
    font-size: 12px;
    margin-bottom: 20px;
    margin-top: 6px;
}

textarea {
    width: 100%;
    resize: none;
    padding: 6px 12px;
    height: 80px;
}

.result {
    margin-top: 6px;
}

.address {
    margin-bottom: 1px !important;
    word-break: break-all;
}
</style>
