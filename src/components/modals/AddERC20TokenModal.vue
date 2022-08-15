<template>
    <modal ref="modal" title="Add Token" @beforeClose="beforeClose">
        <div class="add_token_body">
            <div>
                <label>Token Contract Address</label>
                <input v-model="tokenAddress" placeholder="0x" />
                <p class="err">{{ err }}</p>
            </div>

            <div class="meta" :found="canAdd">
                <div>
                    <label>Token Name</label>
                    <input v-model="name" disabled />
                </div>
                <div>
                    <label>Token Symbol</label>
                    <input v-model="symbol" disabled />
                </div>
                <div>
                    <label>Decimals of Precision</label>
                    <input type="number" v-model="denomination" disabled />
                </div>
            </div>

            <v-btn class="button_secondary" block depressed :disabled="!canAdd" @click="submit">
                Add Token
            </v-btn>
        </div>
    </modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Watch } from 'vue-property-decorator'

import Modal from './Modal.vue'
import { web3 } from '@/evm'
import ERC20Abi from '@/abi/IERC20.json'
import Erc20Token from '@/js/Erc20Token'
import { TokenListToken } from '@/store/modules/assets/types'

@Component({
    components: {
        Modal,
    },
})
export default class AddERC20TokenModal extends Vue {
    tokenAddress = ''
    name = ''
    symbol = ''
    denomination = 1
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
            var tokenInst = new web3.eth.Contract(ERC20Abi.abi, val)
            let name = await tokenInst.methods.name().call()
            let symbol = await tokenInst.methods.symbol().call()
            let decimals = await tokenInst.methods.decimals().call()

            this.symbol = symbol
            this.denomination = decimals
            this.name = name

            this.canAdd = true
            return true
        } catch (e) {
            this.canAdd = false
            this.symbol = '-'
            this.denomination = 0
            this.name = '-'
            this.err = 'Invalid contract address.'
            return false
        }
    }

    clear() {
        this.tokenAddress = ''
        this.canAdd = false
        this.symbol = '-'
        this.denomination = 0
        this.name = '-'
        this.err = ''
    }

    async submit() {
        try {
            let data: TokenListToken = {
                address: this.tokenAddress,
                name: this.name,
                symbol: this.symbol,
                decimals: this.denomination,
                chainId: this.$store.state.Assets.evmChainId,
                logoURI: '',
            }

            let token: Erc20Token = await this.$store.dispatch('Assets/addCustomErc20Token', data)

            this.$store.dispatch('Notifications/add', {
                title: 'ERC20 Token Added',
                message: token.data.name,
            })
            this.close()
        } catch (e) {
            this.err = (e as Error).message
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
}
</script>
<style scoped lang="scss">
@use '../../styles/main';
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

@include main.mobile-device {
    .add_token_body {
        width: 100%;
    }
}
</style>
