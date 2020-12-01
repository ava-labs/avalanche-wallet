<template>
    <div class="asset">
        <div class="icon">
            <hexagon class="hex_bg" :is-ava="isAvaxToken"></hexagon>
            <div class="icon_img">
                <img v-if="iconUrl" :src="iconUrl" />
                <p v-else>?</p>
            </div>
        </div>
        <p class="name_col not_mobile">{{ name }} ({{ symbol }})</p>
        <p class="name_col mobile_only">{{ symbol }}</p>
        <router-link :to="sendLink" class="send_col" v-if="isBalance">
            <img
                v-if="$root.theme === 'day'"
                src="@/assets/sidebar/transfer_nav.png"
            />
            <img v-else src="@/assets/sidebar/transfer_nav_night.svg" />
        </router-link>
        <p v-else></p>
        <p class="balance_col" v-if="isBalance">
            {{ asset.toString() }} <span>{{ symbol }}</span>
        </p>
        <p class="balance_col" v-else>
            0 <span>{{ symbol }}</span>
        </p>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import AvaAsset from '../../../js/AvaAsset'
import Hexagon from '@/components/misc/Hexagon.vue'

@Component({
    components: {
        Hexagon,
    },
})
export default class FungibleRow extends Vue {
    @Prop() asset!: AvaAsset

    get iconUrl(): string | null {
        if (!this.asset) return null

        if (this.isAvaxToken) {
            return '/ava_letter_icon.png'
        }

        return null
    }

    get isBalance(): boolean {
        if (!this.asset) return false
        if (this.asset.getAmount().gt(0)) {
            return true
        }
        return false
    }

    get sendLink(): string {
        if (!this.asset) return `/wallet/transfer`
        return `/wallet/transfer?asset=${this.asset.id}`
    }

    get avaxToken(): AvaAsset {
        return this.$store.getters['Assets/AssetAVA']
    }

    get isAvaxToken(): boolean {
        if (!this.asset) return false

        if (this.avaxToken.id === this.asset.id) {
            return true
        } else {
            return false
        }
    }

    get name(): string {
        let name = this.asset.name
        // TODO: Remove this hack after network change
        if (name === 'AVA') return 'AVAX'
        return name
    }

    get symbol(): string {
        let sym = this.asset.symbol

        // TODO: Remove this hack after network change
        if (sym === 'AVA') return 'AVAX'
        return sym
    }
}
</script>
<style scoped lang="scss">
@use '../../../main';

.asset {
    padding: 14px 0px;
    justify-self: center;

    > * {
        align-self: center;
    }

    .balance_col {
        font-size: 24px;
        text-align: right;
    }

    .name_col {
        padding-left: 15px;
        white-space: nowrap;
        overflow-y: hidden;
        text-overflow: ellipsis;
    }

    .send_col {
        text-align: center;
        img {
            width: 18px;
            object-fit: contain;
        }
    }
}

.icon {
    position: relative;
    width: 100%;
    height: 100%;
    align-self: center;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    transition-duration: 1s;

    p {
        color: #aaa;
    }
}

.icon_img {
    position: absolute;

    img {
        width: 18px;
        object-fit: contain;
    }
}

.hex_bg {
    height: 100%;
    width: 100%;
}

.mobile_only {
    display: none;
}

@include main.mobile-device {
    .name_col {
        display: none;
    }

    .balance_col {
        font-size: 1rem !important;
    }

    .mobile_only {
        display: initial;
    }
}
</style>
