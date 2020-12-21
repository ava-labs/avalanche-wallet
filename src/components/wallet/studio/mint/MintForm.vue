<template>
    <div class="mint_form">
        <div class="cols">
            <div class="utxo_col">
                <div class="utxo">
                    <div>
                        <v-btn text @click="clearUtxo" block>Change Family</v-btn>
                        <div style="height: 110px; margin-top: 22px" v-if="groupUtxos.length > 0">
                            <NftFamilyCardsPreview
                                :utxos="groupUtxos"
                                :spread="isSuccess"
                                :max="maxPreviewUtxoLen"
                            ></NftFamilyCardsPreview>
                        </div>
                        <div v-else class="empty_card">
                            <p><fa icon="plus"></fa></p>
                        </div>
                    </div>
                    <div>
                        <div>
                            <label>Family Name</label>
                            <p>{{ family.name }}</p>
                        </div>
                        <div>
                            <label>Family Symbol</label>
                            <p>{{ family.symbol }}</p>
                        </div>
                        <div>
                            <label>Group</label>
                            <p style="word-break: break-all">{{ groupId }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="type_col">
                <div class="type_sel">
                    <label>Type</label>
                    <p>Select a collectible type.</p>
                    <v-chip-group mandatory v-model="nftFormType">
                        <v-chip value="generic" :disabled="isSuccess">Generic</v-chip>
                        <v-chip value="custom" :disabled="isSuccess">Custom</v-chip>
                    </v-chip-group>

                    <template v-if="nftFormType === 'custom'">
                        <label>Payload Type</label>
                        <v-chip-group mandatory v-model="nftType">
                            <v-chip value="utf8" :disabled="isSuccess">UTF-8</v-chip>
                            <v-chip value="url" :disabled="isSuccess">URL</v-chip>
                            <v-chip value="json" :disabled="isSuccess">JSON</v-chip>
                        </v-chip-group>
                    </template>
                </div>
                <p>
                    {{ typeDescription }}
                </p>
            </div>
            <div class="form_col">
                <template>
                    <div>
                        <Component
                            v-if="nftFormType === 'custom'"
                            :is="formComponent"
                            @onInput="onInput"
                        ></Component>
                        <GenericForm v-else @onInput="onInput"></GenericForm>
                    </div>
                    <div>
                        <label>Quantity</label>
                        <input type="number" min="1" v-model="quantity" style="width: 100%" />
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
                        block
                        :loading="isLoading"
                        class="button_primary"
                        style="margin: 14px 0"
                        v-if="!isSuccess"
                    >
                        Mint
                    </v-btn>
                </template>
            </div>

            <div class="right_col">
                <div class="preview">
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
                <template v-if="isSuccess">
                    <div class="success_cont">
                        <p style="color: var(--success)">
                            <fa icon="check-circle"></fa>
                            Success.
                            <br />
                            The new collectibles are added to your wallet.
                        </p>
                        <div>
                            <label>Tx ID</label>
                            <p style="word-break: break-all">{{ txId }}</p>
                        </div>
                        <v-btn @click="clearUtxo" class="button_secondary" small depressed>
                            Back to Studio
                        </v-btn>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

import SelectMintUTXO from '@/components/wallet/studio/mint/SelectMintUtxo/SelectMintUTXO.vue'
import UrlForm from '@/components/wallet/studio/mint/forms/UrlForm.vue'
import Utf8Form from '@/components/wallet/studio/mint/forms/Utf8Form.vue'
import JsonForm from '@/components/wallet/studio/mint/forms/JsonForm.vue'
import GenericForm from '@/components/wallet/studio/mint/forms/GenericForm.vue'
import NftPayloadView from '@/components/misc/NftPayloadView/NftPayloadView.vue'

import { NFTMintOutput, NFTTransferOutput, UTXO } from 'avalanche/dist/apis/avm'
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
import NftFamilyCardsPreview from '@/components/misc/NftFamilyCardsPreview.vue'

type NftType = 'utf8' | 'url' | 'json'

@Component({
    components: {
        NftFamilyCardsPreview,
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
    isSuccess = false
    isLoading = false
    txId = ''

    maxPreviewUtxoLen = 18
    get typeDescription() {
        if (this.nftFormType === 'generic') {
            return `Generic collectibles consist of an image, title and a description. The wallet
                    can display them nicely.`
        }

        if (this.nftType === 'url') {
            return 'If the given URL is an image the wallet will try its best to display it nicely. Otherwise it will show up as a link.'
        } else if (this.nftType === 'json') {
            return 'JSON payloads are ideal for custom data structures and can be used to develop decentralized applications.'
        } else {
            return `UTF8 payloads are simply text encoded into a collectible.`
        }
    }

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

    get familyUtxos(): UTXO[] {
        return this.$store.getters.walletNftDict[this.family.id] || []
    }

    get groupUtxos() {
        let utxos = this.familyUtxos
        let ids: number[] = []

        let filtered = utxos.filter((utxo) => {
            let groupId = (utxo.getOutput() as NFTTransferOutput).getGroupID()

            if (ids.includes(groupId)) {
                return false
            } else {
                ids.push(groupId)
                return true
            }
        })

        // order by group id
        filtered.sort((a, b) => {
            let gA = (a.getOutput() as NFTTransferOutput).getGroupID()
            let gB = (b.getOutput() as NFTTransferOutput).getGroupID()
            return gA - gB
        })

        return filtered.slice(0, this.maxPreviewUtxoLen)
    }

    async submit() {
        let wallet = this.$store.state.activeWallet
        if (!wallet) return

        this.isLoading = true

        try {
            let txId = await wallet.mintNft(this.mintUtxo, this.payloadPreview, this.quantity)
            this.onSuccess(txId)
        } catch (e) {
            console.error(e)
        }
    }

    cancel() {
        this.$emit('cancel')
    }

    onSuccess(txId: string) {
        this.isLoading = false
        this.isSuccess = true
        this.txId = txId

        this.$store.dispatch('Notifications/add', {
            type: 'success',
            title: 'Success',
            message: 'Collectible minted and added to your wallet.',
        })

        setTimeout(() => {
            this.$store.dispatch('Assets/updateUTXOs')
        }, 2000)
    }

    onError(err: any) {
        this.isLoading = false
    }
}
</script>
<style lang="scss">
.mint_form {
    label {
        margin-top: 6px;
        color: var(--primary-color);
        font-size: 14px;
        margin-bottom: 3px;
    }

    p {
        color: var(--primary-color-light);
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

    .type_col {
        display: flex;
        flex-direction: column;

        > p {
            margin-top: 30px !important;
            font-size: 14px;
        }
    }
}
</style>
<style lang="scss" scoped>
@use "../../../../main";
.mint_form {
    padding: 10px 0;
}

.options {
    display: flex;

    > div {
        //width: 130px;
        display: flex;
        flex-direction: column;
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
    //background-color: var(--bg-light);
    display: flex;
    flex-direction: column;
    position: relative;
    //font-size: 13px;
    //width: max-content;

    //display: grid;
    //grid-template-columns: repeat(3, max-content) 40px;
    //column-gap: 14px;
    height: max-content;
    //margin-bottom: 22px;

    button {
        //position: absolute;
        font-size: 13px;
        //right: 12px;
        //top: 6px;
        color: var(--secondary-color);
        opacity: 0.8;

        &:hover {
            opacity: 1;
        }
    }
}

$col_pad: 24px;
.cols {
    display: grid;
    grid-template-columns: max-content 1fr 340px 1fr;
    column-gap: $col_pad;
    > div {
        padding-left: $col_pad;
        padding-right: $col_pad;
        border-right: 1px solid var(--bg-light);
    }
}

.right_col {
    display: flex;
    flex-direction: column;
    align-items: center;
    border: none !important;
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
    //border: none !important;
}

.success_cont {
    max-width: 100%;
    margin: 24px 0;
    text-align: center;
    > div {
        //background-color: var(--bg-light);
        padding: 3px 12px;
        margin: 12px 0;
    }
}

.empty_card {
    width: 50px;
    height: 70px;
    margin: 12px auto;
    background-color: transparent;
    display: flex;
    justify-self: center;
    align-items: center;
    justify-content: center;
    color: var(--primary-color-light);
    border: 2px dashed var(--primary-color-light);
}

@include main.medium-device {
    .cols {
        grid-template-columns: 1fr 1fr;
        row-gap: 24px;
        > div {
            border: none;
            padding: 0;
        }
    }

    .utxo {
        display: grid;
        column-gap: 22px;
        grid-template-columns: max-content 1fr;
    }
}
</style>
