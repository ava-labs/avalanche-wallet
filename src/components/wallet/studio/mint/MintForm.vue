<template>
    <div class="mint_form">
        <div class="cols">
            <div class="form_col">
                <div class="header">
                    <div class="type_sel">
                        <label>Type</label>
                        <p>Select a collectible type.</p>
                        <v-chip-group mandatory v-model="nftFormType">
                            <v-chip value="generic">Generic</v-chip>
                            <v-chip value="custom">Custom</v-chip>
                        </v-chip-group>

                        <template v-if="nftFormType === 'custom'">
                            <label>Payload Type</label>
                            <v-chip-group mandatory v-model="nftType">
                                <v-chip value="utf8">UTF-8</v-chip>
                                <v-chip value="url">URL</v-chip>
                                <v-chip value="json">JSON</v-chip>
                            </v-chip-group>
                        </template>
                    </div>
                </div>
                <div>
                    <label>Quantity</label>
                    <input type="number" min="1" v-model="quantity" style="width: 90px" />
                </div>
                <Component
                    v-if="nftFormType === 'custom'"
                    :is="formComponent"
                    @onInput="onInput"
                ></Component>
                <GenericForm v-else @onInput="onInput"></GenericForm>
            </div>
            <div class="preview_col">
                <div class="utxo">
                    <div>
                        <label>Name</label>
                        <p>{{ family.name }}</p>
                    </div>
                    <div>
                        <label>Symbol</label>
                        <p>{{ family.symbol }}</p>
                    </div>
                    <div>
                        <label>Group</label>
                        <p style="word-break: break-all">{{ groupId }}</p>
                    </div>
                    <button @click="clearUtxo"><fa icon="sync"></fa></button>
                </div>
                <label>Preview</label>
                <NftPayloadView
                    v-if="payloadPreview"
                    class="nft_preview"
                    :payload="payloadPreview"
                ></NftPayloadView>
                <div class="nft_preview preview_holder" v-else>
                    <p>Complete the form to see the preview.</p>
                </div>
                <div class="fee">
                    <p>
                        Fee
                        <span>{{ txFee.toLocaleString() }} AVAX</span>
                    </p>
                </div>
                <v-btn
                    :disabled="!canSubmit"
                    @click="submit"
                    small
                    block
                    class="button_secondary"
                    style="margin: 14px 0"
                >
                    Mint
                </v-btn>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

import SelectMintUTXO from '@/components/wallet/studio/mint/SelectMintUTXO.vue'
import UrlForm from '@/components/wallet/studio/mint/forms/UrlForm.vue'
import Utf8Form from '@/components/wallet/studio/mint/forms/Utf8Form.vue'
import JsonForm from '@/components/wallet/studio/mint/forms/JsonForm.vue'
import GenericForm from '@/components/wallet/studio/mint/forms/GenericForm.vue'
import NftPayloadView from '@/components/misc/NftPayloadView/NftPayloadView.vue'

import { NFTMintOutput, UTXO } from 'avalanche/dist/apis/avm'
import { NftFamilyDict } from '@/store/modules/assets/types'
import { avm, bintools, pChain } from '@/AVA'
import {
    GenericFormType,
    JsonFormType,
    NftMintFormType,
    UrlFormType,
    UtfFormType,
} from '@/components/wallet/studio/mint/types'
import { PayloadBase, URLPayload, UTF8Payload, JSONPayload } from 'avalanche/dist/utils'
import Big from 'big.js'
import { bnToBig } from '@/helpers/helper'

type NftType = 'utf8' | 'url' | 'json'

@Component({
    components: {
        GenericForm,
        SelectMintUTXO,
        UrlForm,
        NftPayloadView,
        Utf8Form,
        JsonForm,
    },
})
export default class MintNft extends Vue {
    @Prop() mintUtxo!: UTXO

    quantity = 1
    nftType: NftType = 'url'
    nftFormType = 'generic'
    payloadPreview: null | PayloadBase = null
    canSubmit = false

    get nftFamsDict(): NftFamilyDict {
        return this.$store.state.Assets.nftFamsDict
    }

    get family() {
        let idBuff = this.mintUtxo.getAssetID()
        let id = bintools.cb58Encode(idBuff)
        return this.nftFamsDict[id]
    }

    get groupId() {
        return (this.mintUtxo.getOutput() as NFTMintOutput).getGroupID()
    }

    get formComponent() {
        switch (this.nftType) {
            case 'utf8':
                return Utf8Form
            case 'url':
                return UrlForm
            case 'json':
                return JsonForm
            default:
                return Utf8Form
        }
    }

    clearUtxo() {
        this.$emit('clearUtxo')
    }

    get txFee(): Big {
        return bnToBig(avm.getTxFee(), 9)
    }

    onInput(form: NftMintFormType | null) {
        if (form === null) {
            this.payloadPreview = null
            this.canSubmit = false
            return
        }

        try {
            let payload
            if (this.nftFormType === 'generic') {
                console.log('hi')
                // let dataStr = JSON.stringify((form as GenericFormType).data)
                // payload = new JSONPayload(dataStr)
                payload = new JSONPayload((form as GenericFormType).data)
            } else {
                switch (this.nftType) {
                    case 'url':
                        payload = new URLPayload((form as UrlFormType).url)
                        break
                    case 'json':
                        payload = new JSONPayload((form as JsonFormType).data)
                        break
                    case 'utf8':
                        payload = new UTF8Payload((form as UtfFormType).text)
                        break
                    default:
                        payload = new UTF8Payload('hi there')
                        break
                }
            }

            this.payloadPreview = payload
            this.canSubmit = true
        } catch (e) {
            console.error(e)
        }
    }

    submit() {
        let wallet = this.$store.state.activeWallet
        if (!wallet) return

        try {
            wallet.mintNft(this.mintUtxo, this.payloadPreview, this.quantity)
        } catch (e) {
            console.error(e)
        }
    }
}
</script>
<style lang="scss">
.mint_form {
    label {
        margin-top: 6px;
        color: var(--primary-color-light);
        font-size: 14px;
        margin-bottom: 3px;
    }

    input,
    textarea {
        background-color: var(--bg-light);
        padding: 8px 12px;
        display: block;
        font-size: 14px;
        color: var(--primary-color);
    }

    textarea {
        resize: none;
    }

    .header {
        //display: flex;
        //justify-content: space-between;
        padding-bottom: 14px;
        margin-bottom: 14px;
        border-bottom: 1px solid var(--bg-light);
    }
}
</style>
<style lang="scss" scoped>
.mint_form {
    padding: 10px 0;
}

.options {
    display: flex;

    > div {
        width: 130px;
        display: flex;
        flex-direction: column;
        border: 1px solid;
        margin-right: 12px;
        border: 2px solid var(--bg-light);
        border-radius: 14px;
        padding: 24px 12px;
        text-align: center;
        color: var(--primary-color-light);
        align-items: center;

        &[selected] {
            background-color: var(--bg-light);
        }
        .option_title {
            font-size: 13px;
            font-weight: bold;
        }
        .option_desc {
            font-size: 12px;
        }
    }
}
.utxo {
    background-color: var(--bg-light);
    padding: 4px 8px;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    position: relative;
    font-size: 13px;
    //width: max-content;

    //display: grid;
    //grid-template-columns: repeat(3, max-content) 40px;
    //column-gap: 14px;
    height: max-content;
    margin-bottom: 22px;

    button {
        position: absolute;
        font-size: 13px;
        right: 12px;
        top: 6px;
        color: var(--secondary-color);
        opacity: 0.8;

        &:hover {
            opacity: 1;
        }
    }
}

.cols {
    display: grid;
    grid-template-columns: 1fr max-content;
}

.preview_col {
    border-left: 1px solid var(--bg-light);
    padding-left: 2vw;
}

.nft_preview {
    width: 180px;
    max-height: 320px;
    border-radius: 14px;
    overflow: scroll;

    box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.1);
}
.preview_holder {
    border-color: var(--primary-color-light);
    min-height: 240px;
    text-align: center;
    display: flex;
    padding: 14px;
    border: 1px dashed var(--primary-color);

    p {
        align-self: center;
        font-size: 13px;
        color: var(--primary-color-light);
    }
}
.fee {
    margin-top: 14px;
    font-size: 13px;
    p > span {
        margin-left: 35px;
    }
}

.form_col {
    padding-right: 2vw;
}
</style>
