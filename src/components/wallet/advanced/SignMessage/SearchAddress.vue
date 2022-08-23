<template>
    <div class="search_address">
        <template v-if="selectedAddress">
            <p class="selected no_overflow_addr" @click="clearSelection">
                {{ selectedAddress }}
            </p>
        </template>
        <template v-else>
            <input
                type="text"
                v-model="address"
                @input="onInput"
                class="hover_border"
                placeholder="Search address.."
            />
            <div class="search_results" v-if="matchingAddrs.length > 0">
                <p
                    v-for="addr in matchingAddrs"
                    :key="addr"
                    @click="selectAddress(addr)"
                    class="no_overflow_addr"
                >
                    {{ addr }}
                </p>
            </div>
        </template>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Model } from 'vue-property-decorator'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import { LedgerWallet } from '@/js/wallets/LedgerWallet'

@Component
export default class SearchAddress extends Vue {
    @Model('change', { type: String }) readonly selectedAddress!: string | null
    @Prop() wallet!: MnemonicWallet | LedgerWallet

    address: string = ''
    matchingAddrs: string[] = []

    get addrsX(): string[] {
        return this.wallet.getAllDerivedExternalAddresses()
    }

    get addrsP(): string[] {
        return this.wallet.getAllAddressesP()
    }

    emitChange(val: string | null) {
        this.$emit('change', val)
    }

    clearSelection() {
        this.address = ''
        this.matchingAddrs = []

        this.emitChange(null)
    }

    selectAddress(addr: string) {
        this.emitChange(addr)
    }

    onInput() {
        if (this.address === '') {
            this.matchingAddrs = []
            return
        }

        let pAddrs = this.addrsP.filter((addr) => {
            return addr.includes(this.address)
        })
        let xAddrs = this.addrsX.filter((addr) => {
            return addr.includes(this.address)
        })

        this.matchingAddrs = [...pAddrs.slice(0, 2), ...xAddrs.slice(0, 2)]
    }
}
</script>
<style scoped lang="scss">
$addrSize: 14px;

.search_address {
    position: relative;
}

.no_overflow_addr {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    padding: 2px 6px;
    cursor: pointer;
    font-size: $addrSize;
    font-family: monospace;
}

input {
    width: 100%;
    background-color: rgba(0, 0, 0, 0.1);
    padding: 2px 6px;
    font-size: $addrSize;
    color: var(--primary-color);
}
.search_results {
    position: absolute;
    top: calc(100% - 1px);
    width: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-light);
    border: 1px solid var(--bg);
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
    border-top: 0;

    p {
        cursor: pointer;
        &:hover {
            color: var(--secondary-color);
        }
    }
}

.selected {
    background-color: var(--secondary-color);
    color: #fff;
    border-radius: var(--border-radius-sm);
}
</style>
