<template>
    <div class="mint_form">
        <div class="cols">
            <div class="form_col">
                <div class="header">
                    <div class="type_sel">
                        <label>Type</label>
                        <p>Select collectible type.</p>
                        <v-chip-group mandatory v-model="nftType">
                            <v-chip value="utf8">UTF-8</v-chip>
                            <v-chip value="url">URL</v-chip>
                            <v-chip value="json">JSON</v-chip>
                        </v-chip-group>
                    </div>
                </div>
                <div>
                    <label>Quantity</label>
                    <input type="number" min="1" v-model="quantity" />
                </div>
                <Component :is="formComponent" @onInput="onInput"></Component>
                <div class="fee">
                    <p>
                        Fee
                        <span>{{ txFee.toLocaleString() }} AVAX</span>
                    </p>
                </div>
                <v-btn :disabled="!canSubmit" @click="submit">Mint</v-btn>
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
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

import SelectMintUTXO from '@/components/wallet/studio/mint/SelectMintUTXO.vue'
import UrlForm from '@/components/wallet/studio/mint/forms/UrlForm.vue'
import NftPayloadView from '@/components/misc/NftPayloadView/NftPayloadView.vue'

import { NFTMintOutput, UTXO } from 'avalanche/dist/apis/avm'
import { NftFamilyDict } from '@/store/modules/assets/types'
import { avm, bintools, pChain } from '@/AVA'
import { NftMintFormType, UrlFormType } from '@/components/wallet/studio/mint/types'
import { PayloadBase, URLPayload, UTF8Payload } from 'avalanche/dist/utils'
import Big from 'big.js'
import { bnToBig } from '@/helpers/helper'

type NftType = 'utf8' | 'url' | 'json'

@Component({
    components: {
        SelectMintUTXO,
        UrlForm,
        NftPayloadView,
    },
})
export default class MintNft extends Vue {
    @Prop() mintUtxo!: UTXO

    quantity = 1
    nftType: NftType = 'url'
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
            case 'url':
                return UrlForm
            default:
                return UrlForm
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
            switch (this.nftType) {
                case 'url':
                    payload = new URLPayload((form as UrlFormType).url)
                    break
                case 'json':
                    payload = new URLPayload((form as UrlFormType).url)
                    break
                default:
                    payload = new UTF8Payload('hi there')
                    break
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

    input {
        background-color: var(--bg-light);
        padding: 8px 12px;
        display: block;
        font-size: 14px;
        color: var(--primary-color);
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
    padding: 30px 0;
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
    overflow: auto;

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
    p > span {
        margin-left: 35px;
    }
}

.form_col {
    padding-right: 2vw;
}
</style>
