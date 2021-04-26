<template>
    <modal ref="modal" title="Add Collectible" @beforeClose="beforeClose">
        <div class="add_token_body">
            <div>
                <label>ERC721 Contract Address</label>
                <input v-model="tokenAddress" placeholder="0x" />
                <p class="err">{{ err }}</p>
            </div>

            <div class="meta" :found="canAdd">
                <div>
                    <label>Collectible Name</label>
                    <input v-model="name" disabled />
                </div>
                <div>
                    <label>Collectible Symbol</label>
                    <input v-model="symbol" disabled />
                </div>
            </div>

            <v-btn class="button_secondary" block depressed :disabled="!canAdd" @click="submit">
                Add Collectible
            </v-btn>
            <div class="already_added" v-if="networkTokens.length">
                <h4>Already added</h4>
                <div v-for="token in networkTokens" :key="token.contractAddress" class="flex-row">
                    <div class="flex-column" style="flex-grow: 1">
                        <p>{{ token.name }} {{ token.symbol }}</p>
                        <p class="subtext">{{ token.contractAddress }}</p>
                    </div>
                    <button @click="removeToken(token)"><fa icon="times"></fa></button>
                </div>
            </div>
        </div>
    </modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

import Modal from './Modal.vue'
import { web3 } from '@/evm'
import ERC20Abi from '@openzeppelin/contracts/build/contracts/ERC20.json'
import ERC721Abi from '@openzeppelin/contracts/build/contracts/ERC721.json'
import Erc20Token from '@/js/Erc20Token'
import { TokenListToken } from '@/store/modules/assets/types'
import { ERC721TokenInput } from '@/store/modules/assets/modules/types'
import { WalletType } from '@/js/wallets/types'
import axios from 'axios'
import ERC721Token from '@/js/ERC721Token'

@Component({
    components: {
        Modal,
    },
})
export default class AddERC721TokenModal extends Vue {
    tokenAddress = ''
    name = ''
    symbol = ''
    canAdd = false
    err = ''

    @Watch('tokenAddress')
    async onAddressChange(val: string) {
        this.err = ''
        if (val === '') {
            this.clear()
            return
        }
        await this.validateAddress(val)
    }

    async validateAddress(val: string) {
        if (val === '') {
            this.err = ''
            return false
        }
        try {
            //@ts-ignore
            var tokenInst = new web3.eth.Contract(ERC721Abi.abi, val)
            let name = await tokenInst.methods.name().call()
            let symbol = await tokenInst.methods.symbol().call()

            this.symbol = symbol
            this.name = name

            this.canAdd = true
            return true
        } catch (e) {
            this.canAdd = false
            this.symbol = '-'
            this.name = '-'
            this.err = 'Invalid contract address.'
            return false
        }
    }

    clear() {
        this.tokenAddress = ''
        this.canAdd = false
        this.symbol = '-'
        this.name = '-'
        this.err = ''
    }

    async submit() {
        try {
            let data: ERC721TokenInput = {
                address: this.tokenAddress,
                name: this.name,
                symbol: this.symbol,
                chainId: this.$store.state.Assets.evmChainId,
            }

            let token: ERC721Token = await this.$store.dispatch('Assets/ERC721/addCustom', data)

            this.$store.dispatch('Notifications/add', {
                title: 'ERC721 Token Added',
                message: token.name,
            })
            this.close()
        } catch (e) {
            this.err = e.message
            console.error(e)
        }
    }

    beforeClose() {
        this.clear()
    }

    open() {
        // @ts-ignore
        this.$refs.modal.open()
    }

    close() {
        // @ts-ignore
        this.$refs.modal.close()
    }

    async removeToken(token: ERC721Token) {
        await this.$store.dispatch('Assets/ERC721/removeCustom', token)
    }

    get networkTokens(): ERC721Token[] {
        return this.$store.getters['Assets/ERC721/networkContractsCustom']
    }
}
</script>
<style scoped lang="scss">
@use '../../main';
.add_token_body {
    padding: 30px 22px;
    text-align: center;
    width: 380px;
    max-width: 100%;

    > div {
        &:first-of-type {
            margin-bottom: 14px;
            padding-bottom: 14px;
            border-bottom: 1px solid var(--bg-light);
        }
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
    }

    label {
        font-size: 13px;
    }
    input {
        width: 100%;
        background-color: var(--bg-light);
        padding: 14px 24px;
        border-radius: 3px;
        font-size: 14px;
        color: var(--primary-color);
    }

    > * {
        margin: 6px 0;
    }
}

.meta {
    text-align: left;
    background-color: var(--bg-light);
    opacity: 0.6;
    transition-duration: 0.3s;

    > div {
        border-bottom: 1px solid var(--bg);
        padding: 14px 24px;
    }

    label {
        color: var(--primary-color-light);
    }
    input {
        padding: 0;
        color: var(--primary-color);
    }
}

.meta[found] {
    opacity: 1;
}

.err {
    width: 100%;
    text-align: center;
}

.already_added {
    text-align: left;
    margin-top: 1em;

    h4 {
        text-align: center;
        margin: 0px auto;
    }
    > div {
        width: 100%;
        align-items: center;
        margin: 3px 0;

        button {
            align-self: baseline;
            font-size: 0.8em;
            opacity: 0.5;

            &:hover {
                opacity: 1;
            }
        }
    }
}

@include main.mobile-device {
    .add_token_body {
        width: 100%;
    }
}
</style>
