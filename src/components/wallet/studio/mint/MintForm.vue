<template>
    <div class="mint_form">
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
        </div>

        <div class="cols">
            <Component :is="formComponent" @onInput="onInput"></Component>
            <div class="preview_col">
                <label>Preview</label>
                <NftPayloadView
                    v-if="payloadPreview"
                    class="nft_preview"
                    :payload="payloadPreview"
                ></NftPayloadView>
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
import { bintools } from '@/AVA'
import { NftMintFormType, UrlFormType } from '@/components/wallet/studio/mint/types'
import { PayloadBase, URLPayload, UTF8Payload } from 'avalanche/dist/utils'

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

    nftType: NftType = 'url'
    payloadPreview: null | PayloadBase = null

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

    onInput(form: NftMintFormType) {
        console.log(form)

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
            console.log(payload)
            this.payloadPreview = payload
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
        display: flex;
        justify-content: space-between;
        padding-bottom: 14px;
        margin-bottom: 14px;
        border-bottom: 1px solid var(--bg-light);
    }
}
</style>
<style lang="scss" scoped>
.utxo {
    background-color: var(--bg-light);
    padding: 4px 8px;
    border-radius: 6px;
    //display: flex;

    display: grid;
    grid-template-columns: repeat(3, max-content) 40px;
    column-gap: 14px;
    height: max-content;
}

.cols {
    display: grid;
    grid-template-columns: 1fr max-content;
}

.preview_col {
    border-left: 1px solid var(--bg-light);
    padding-left: 14px;
}

.nft_preview {
    width: 240px;
    min-height: 240px;
    border: 1px dashed var(--bg-light);
}
</style>
