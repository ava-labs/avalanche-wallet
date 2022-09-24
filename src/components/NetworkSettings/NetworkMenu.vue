<template>
    <div
        data-cy="network-switcher"
        class="network_menu"
        :connected="status === 'connected'"
        @keydown.esc="closeMenu"
    >
        <div class="toggle_but" @click="toggleMenu" :testnet="isTestnet">
            <span
                :style="{
                    backgroundColor: connectionColor,
                }"
            ></span>
            <p v-if="activeNetwork">{{ activeNetwork.name }}</p>
            <p v-else>Disconnected</p>
            <!--            <template v-if="status === 'disconnected' || status === 'connecting'">-->
            <!--                <img v-if="$root.theme === 'day'" src="@/assets/network_off.png" />-->
            <!--                <img v-else src="@/assets/network_off_night.svg" />-->
            <!--            </template>-->
            <!--            <template v-else>-->
            <!--                <img v-if="$root.theme === 'day'" src="@/assets/network_on.png" />-->
            <!--                <img v-else src="@/assets/network_off_night.svg" />-->
            <!--            </template>-->
            <!--            <button v-if="status === 'connected'">-->
            <!--                {{ activeNetwork.name }}-->
            <!--            </button>-->
            <!--            <button v-else-if="status === 'connecting'">-->
            <!--                {{ $t('network.status1') }}-->
            <!--            </button>-->
            <!--            <button v-else>{{ $t('network.status2') }}</button>-->
        </div>
        <transition name="fade">
            <div class="network_dispose_bg" v-if="isActive" key="bg" @click="closeMenu"></div>
        </transition>
        <transition name="slide_right">
            <div class="network_body" v-if="isActive" key="body">
                <div class="header" data-cy="custom-network-option">
                    <span id="menu_close" @click="closeMenu"><fa icon="times"></fa></span>
                    <template v-if="page === 'list'">
                        <h4>{{ $t('network.title') }}</h4>
                        <button
                            @click="viewCustom"
                            class="button_secondary"
                            data-cy="create-custom-option"
                        >
                            {{ $t('network.custom') }}
                        </button>
                    </template>
                    <template v-if="page === 'custom'">
                        <h4>{{ $t('network.title2') }}</h4>
                        <button @click="viewList" class="tab_cancel">
                            {{ $t('network.cancel') }}
                        </button>
                    </template>
                    <template v-if="page === 'edit'">
                        <h4>{{ $t('network.title3') }}</h4>
                        <button @click="viewList" class="tab_cancel">
                            {{ $t('network.cancel') }}
                        </button>
                    </template>
                </div>

                <transition name="fade" mode="out-in">
                    <ListPage v-if="page === 'list'" @edit="onedit"></ListPage>
                    <CustomPage v-if="page === 'custom'" @add="addCustomNetwork"></CustomPage>
                    <EditPage
                        v-if="page === 'edit'"
                        :net="editNetwork"
                        @success="networkUpdated"
                    ></EditPage>
                </transition>
            </div>
        </transition>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component } from 'vue-property-decorator'

import NetworkRow from './NetworkRow.vue'
import CustomPage from './CustomPage.vue'
import ListPage from './ListPage.vue'
import EditPage from '@/components/NetworkSettings/EditPage.vue'
import { AvaNetwork } from '@/js/AvaNetwork'
import { NetworkStatus } from '@/store/modules/network/types'

@Component({
    components: {
        ListPage,
        NetworkRow,
        CustomPage,
        EditPage,
    },
})
export default class NetworkMenu extends Vue {
    page: string = 'list'
    isActive: boolean = false
    editNetwork: AvaNetwork | null = null

    viewCustom(): void {
        this.page = 'custom'
    }
    viewList(): void {
        this.page = 'list'
    }
    closeMenu(): void {
        this.page = 'list'
        this.isActive = false
    }
    toggleMenu(): void {
        this.isActive = !this.isActive
    }
    addCustomNetwork(data: AvaNetwork): void {
        this.$store.dispatch('Network/addCustomNetwork', data)
        this.page = 'list'
    }

    get connectionColor(): string {
        switch (this.status) {
            case 'connecting':
                return '#ffaa00'
            case 'connected':
                return '#0f0'
            default:
                return '#f00'
        }
    }

    networkUpdated() {
        this.page = 'list'
        this.$store.dispatch('Network/save')
    }

    onedit(network: AvaNetwork): void {
        this.editNetwork = network
        this.page = 'edit'
    }

    get status(): NetworkStatus {
        return this.$store.state.Network.status
    }
    get activeNetwork(): null | AvaNetwork {
        return this.$store.state.Network.selectedNetwork
    }
    get networks(): AvaNetwork[] {
        return this.$store.getters('Network/allNetworks')
        // return this.$store.state.Network.networks;
    }

    get isTestnet(): boolean {
        let net = this.activeNetwork

        if (!net) return false
        if (net.networkId !== 1 && net.networkId !== 1000) return true
        return false
    }
}
</script>
<style scoped lang="scss">
@use '../../styles/main';

.network_menu {
    margin-right: 16px;
    position: relative;
}

#menu_close {
    margin-right: 8px;
}

.toggle_but {
    display: grid;
    grid-template-columns: max-content 1fr max-content;
    //border: 2px solid var(--bg-light);
    // padding: 2px 10px;
    //font-size: 13px;
    // display: flex;
    border-radius: 6px;
    position: relative;
    align-items: center;
    cursor: pointer;

    &:hover {
        background-color: var(--bg-light);
    }

    $dotW: 8px;
    span {
        width: $dotW;
        height: $dotW;
        border-radius: $dotW;
        margin-right: 4px;
    }

    p {
        user-select: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    button {
        outline: none !important;
    }

    img {
        max-height: 24px;
        object-fit: contain;
        margin-right: 5px;
    }

    &[testnet]:after {
        position: absolute;
        content: 'TEST';
        background-color: var(--secondary-color);
        color: #fff;
        font-size: 9px;
        font-weight: bold;
        padding: 2px 6px;
        border-radius: 12px;
        right: -20px;
        top: -8px;
    }
}

.tab_cancel {
    color: var(--primary-color);
}

.network_dispose_bg {
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
}

.network_body {
    position: fixed;
    z-index: 3;
    top: 0;
    right: 0;
    height: 100%;
    border: 1px solid var(--bg-light);
    border-radius: var(--border-radius-sm);
    width: 340px;
    background-color: var(--bg);
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.4);
}

.header {
    border-bottom: 1px solid var(--bg-light);
    padding: 10px 15px;
    display: flex;
    h4 {
        flex-grow: 1;
    }

    button {
        font-size: 12px;
        padding: 3px 14px;
        border-radius: var(--border-radius-sm);
    }
}

.network_menu[connected] {
    .toggle_but {
        color: var(--primary-color);
    }
}

@media only screen and (max-width: main.$mobile_width) {
    .network_body {
        position: fixed;
        width: 100vw;
        z-index: 2;
        right: 0 !important;
        left: 0 !important;
    }
}

@include main.medium-device {
    .toggle_but {
        min-width: auto;
    }
}
</style>
