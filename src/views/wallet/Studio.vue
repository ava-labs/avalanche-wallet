<template>
    <div>
        <div class="header">
            <h1>Studio</h1>
            <h1 class="subtitle" v-if="pageNow">
                / {{ subtitle }}
                <span @click="cancel"><fa icon="times"></fa></span>
            </h1>
        </div>
        <template v-if="!pageNow">
            <p>Create and manage assets.</p>
            <div class="menu">
                <h3>Tokens</h3>
                <div class="options">
                    <div>New Fixed Cap Asset</div>
                </div>
                <h3>Collectibles</h3>
                <div class="options">
                    <div @click="goNewNftFamily">New Family</div>
                    <div @click="goMint">Mint</div>
                </div>
            </div>
        </template>
        <Component v-else :is="pageNow"></Component>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import NewCollectibleFamily from '@/components/wallet/studio/NewCollectibleFamily.vue'
import MintNft from '@/components/wallet/studio/mint/MintNft.vue'
@Component({
    components: {
        NewCollectibleFamily,
    },
})
export default class Studio extends Vue {
    pageNow: any = null
    subtitle: string = ''

    goNewNftFamily() {
        this.pageNow = NewCollectibleFamily
        this.subtitle = 'New Collectible Family'
    }

    goMint() {
        this.pageNow = MintNft
        this.subtitle = 'Mint Collectible'
    }

    cancel() {
        this.pageNow = null
        this.subtitle = ''
    }
}
</script>
<style scoped lang="scss">
.header {
    display: flex;
    /*justify-content: space-between;*/
    /*align-items: center;*/
    align-items: center;

    h1 {
        font-weight: lighter;
    }

    .subtitle {
        margin-left: 0.5em;
        /*font-size: 20px;*/
        color: var(--primary-color-light);
        font-weight: lighter;
    }

    span {
        margin-left: 1em;

        &:hover {
            color: var(--primary-color);
            cursor: pointer;
        }
    }
}

.menu {
    h3 {
        margin: 20px 0;
        color: var(--primary-color-light);
        font-weight: normal;
    }
}

.options {
    display: flex;
    > div {
        border-radius: 14px;
        border: 1px solid var(--bg-light);
        padding: 14px 18px;
        cursor: pointer;

        &:hover {
            background-color: var(--bg-light);
        }
    }
}
</style>
