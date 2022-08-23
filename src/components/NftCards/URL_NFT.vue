<template>
    <BaseNftCard :mini="mini" :raw-card="rawCard" :utxo-id="utxo.getUTXOID()">
        <template v-slot:card>
            <UrlPayloadView :payload="payload"></UrlPayloadView>
            <!--            <img :src="url" v-if="img_types.includes(fileType)" />-->

            <!--            <div v-else-if="fileType === 'pdf'" class="pdf">-->
            <!--                <p>{{ url }}</p>-->
            <!--                <p class="type">PDF</p>-->
            <!--            </div>-->
            <!--            <div v-else class="unknown">-->
            <!--                <p>{{ url }}</p>-->
            <!--                <p class="type">Unknown</p>-->
            <!--            </div>-->
        </template>

        <template v-slot:deck>
            <div v-if="fileType === 'pdf'" class="pdf">
                <a :href="url" target="_blank" class="">Open Document</a>
            </div>
            <div v-else-if="fileType == null" class="unknown">
                <a :href="url" target="_blank" class="">Open URL</a>
            </div>
        </template>

        <template v-slot:mini>
            <img :src="url" v-if="img_types.includes(fileType)" class="img_mini" />
            <p v-else><fa icon="link"></fa></p>
        </template>
    </BaseNftCard>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { PayloadBase } from '@c4tplatform/camino/dist/utils'
import BaseNftCard from '@/components/NftCards/BaseNftCard.vue'
import { UTXO } from '@c4tplatform/camino/dist/apis/avm'
import UrlPayloadView from '@/components/misc/NftPayloadView/views/UrlPayloadView.vue'
@Component({
    components: {
        BaseNftCard,
        UrlPayloadView,
    },
})
export default class URL_NFT extends Vue {
    img_types = ['jpeg', 'jpg', 'gif', 'png', 'apng', 'svg', 'bmp', 'ico']
    valid_types = this.img_types.concat(['pdf'])
    @Prop() payload!: PayloadBase
    @Prop({ default: false }) mini!: boolean
    @Prop({ default: false }) rawCard!: boolean
    @Prop() utxo!: UTXO

    get url(): string {
        return this.payload.getContent().toString('utf-8')
    }
    get fileType(): string | null {
        let url = this.url

        let split = url.split('.')

        // Couldn't find extension
        if (split.length === 1) return null

        let extension: string = split[split.length - 1]
        if (!this.valid_types.includes(extension)) return null
        return extension
    }
}
</script>
<style scoped lang="scss">
.url_nft {
    height: max-content;
    display: flex;
    justify-content: center;
    align-items: center;
}
img {
    width: 100%;
    /*height: 100%;*/
    object-fit: cover;
}

.unknown {
    padding: 15px 12px;
}

.img_mini {
    width: auto;
    height: 100%;
    object-fit: cover;
    object-position: center;
}

.type {
    display: block;
    margin: 0px auto !important;
    font-size: 12px;
    background-color: var(--primary-color-light);
    color: var(--bg) !important;
    width: max-content;
    padding: 0px 4px;
    border-radius: 6px;
    margin-top: 6px !important;
}

.pdf,
.unknown {
    padding: 10px;
    p {
        font-size: 0.8rem;
        color: #999;
        margin: 0;
    }

    a {
        word-break: break-word;
        display: block;
        width: max-content;
        padding: 3px 9px;
        border-radius: var(--border-radius-sm);
        color: var(--primary-color-light);
        background-color: var(--bg-light);
        text-decoration: none;
        font-size: 0.9rem;
        margin: 0px auto;

        &:hover {
            color: var(--primary-color);
            background-color: var(--bg-light);
        }
        /*background-color: var(--primary-color);*/
    }
}
</style>
