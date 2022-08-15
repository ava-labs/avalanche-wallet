<template>
    <div class="network_row" :active="isSelected">
        <div class="name_col">
            <p class="name">{{ network.name }}</p>
            <p class="url">{{ endpoint }}</p>
            <div v-if="!isSelected && !network.readonly" class="buts">
                <button class="editBut" @click="edit">
                    <fa icon="cog"></fa>
                    {{ $t('network.row.edit') }}
                </button>
                <button class="editBut" @click="deleteNet">
                    <fa icon="trash"></fa>
                    {{ $t('network.row.delete') }}
                </button>
            </div>
        </div>
        <div class="stat_col">
            <button @click="select" v-if="!isSelected">
                {{ $t('network.row.select') }}
            </button>
            <button v-else-if="!isConnected" class="connecting">
                {{ $t('network.status1') }}
            </button>
            <p v-else>{{ $t('network.status3') }}</p>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { AvaNetwork } from '@/js/AvaNetwork'

@Component
export default class NetworkRow extends Vue {
    @Prop() network!: AvaNetwork

    get endpoint() {
        let net = this.network
        let portText = ''
        if (net.port) {
            portText = ':' + net.port
        }

        return `${net.protocol}://${net.ip}${portText}`
    }
    get networkStatus() {
        return this.$store.state.Network.status
    }
    get isConnected() {
        let state = this.$store.state.Network
        if (this.network === state.selectedNetwork && this.networkStatus === 'connected') {
            return true
        }
        return false
    }
    get isSelected() {
        let state = this.$store.state.Network
        if (this.network === state.selectedNetwork) {
            return true
        }
        return false
    }

    edit() {
        this.$emit('edit')
    }

    deleteNet() {
        this.$store.dispatch('Network/removeCustomNetwork', this.network)
        this.$store.dispatch(
            'Notifications/add',
            {
                title: 'Network Removed',
                message: 'Removed custom network.',
            },
            { root: true }
        )
    }
    async select() {
        let net = this.network
        try {
            let isSel = await this.$store.dispatch('Network/setNetwork', net)

            this.$store.dispatch(
                'Notifications/add',
                {
                    title: 'Network Connected',
                    message: 'Connected to ' + net.name,
                    type: 'success',
                },
                { root: true }
            )
            // @ts-ignore
            this.$parent.$parent.isActive = false
        } catch (e) {
            this.$store.state.Network.selectedNetwork = null
            this.$store.state.Network.status = 'disconnected'
            this.$store.dispatch(
                'Notifications/add',
                {
                    title: 'Connection Failed',
                    message: `Failed to connect ${net.name}`,
                    type: 'error',
                },
                { root: true }
            )
        }
    }
}
</script>
<style scoped lang="scss">
@use '../../styles/main';
.stat_col {
    font-size: 14px;
    color: var(--primary-color);
    text-align: right;
    word-break: keep-all !important;
}

.network_row {
    position: relative;
    padding: 12px 0px;
    display: grid;
    grid-template-columns: 1fr 80px;
    column-gap: 15px;
    border-bottom: 1px solid var(--bg-light);

    > * {
        align-self: center;
    }
}
img {
    width: 100%;
    object-fit: contain;
}
.network_row[active] {
    .stat_col {
        color: var(--secondary-color) !important;
    }
}
.name_col {
    line-height: 1em;
    word-break: break-word;
    /*overflow: auto;*/
    /*text-overflow: ellipsis;*/
}

.buts {
    button {
        margin-right: 12px;
    }
}

.editBut {
    color: var(--primary-color);
    opacity: 0.4;
    font-size: 11px;
    /*position: absolute;*/
    /*top: 12px;*/
    /*right: 0px;*/
    margin-top: 6px;

    &:hover {
        opacity: 0.8;
    }
}

.connecting {
    animation-name: connecting;
    animation-duration: 0.5s;
    animation-iteration-count: infinite;
    animation-direction: alternate;
}

.url,
.credentials {
    color: main.$primary-color-light;
    font-size: 12px;
    word-break: break-all;
}

@keyframes connecting {
    from {
        color: main.$primary-color;
    }
    to {
        color: main.$green;
    }
}

@media only screen and (max-width: main.$mobile_width) {
    img {
        display: none;
    }
    .network_row {
        grid-template-columns: 1fr max-content;
        /*grid-template-columns: none;*/
    }
}
</style>
