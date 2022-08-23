<template>
    <modal
        ref="modal"
        :title="$t('modal.tokenlist.title')"
        class="modal_main"
        @beforeClose="beforeClose"
    >
        <div class="tokenlist_modal">
            <label>Add a list</label>
            <div class="add_list">
                <input type="text" placeholder="https://" v-model="urlIn" />
                <v-btn
                    small
                    class="button_secondary"
                    depressed
                    @click="addTokenList"
                    :disabled="!canAdd"
                >
                    Add
                </v-btn>
            </div>
            <p v-if="err" class="err">{{ err }}</p>
            <div class="list">
                <div v-for="(list, i) in lists" :key="i" class="list_row">
                    <img :src="list.logoURI" />
                    <div class="info_col">
                        <p>
                            {{ list.name }}
                            <span>{{ list.tokens.length }} Tokens</span>
                        </p>
                        <p>{{ list.url }}</p>
                    </div>
                    <div class="buts">
                        <button v-if="!list.readonly" @click="removeList(list)">Remove</button>
                    </div>
                </div>
            </div>
        </div>
    </modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component } from 'vue-property-decorator'

import Modal from '@/components/modals/Modal.vue'
import { TokenList } from '@/store/modules/assets/types'

@Component({
    components: {
        Modal,
    },
})
export default class TokenListModal extends Vue {
    $refs!: {
        modal: Modal
    }

    urlIn = ''
    err = ''

    get canAdd() {
        if (this.urlIn.length < 4) {
            return false
        }
        return true
    }

    get lists(): TokenList[] {
        return this.$store.state.Assets.tokenLists
    }

    beforeClose() {
        this.urlIn = ''
        this.err = ''
    }

    async addTokenList() {
        this.err = ''
        this.$store
            .dispatch('Assets/addTokenListUrl', {
                url: this.urlIn,
                readonly: false,
            })
            .then((res) => {
                this.onSuccess()
            })
            .catch((e) => {
                this.onError(e)
            })
    }

    onSuccess() {
        this.urlIn = ''
        this.$store.dispatch('Assets/updateERC20Balances')
    }

    async removeList(list: TokenList) {
        this.$store.dispatch('Assets/removeTokenList', list)
    }

    onError(err: any) {
        this.err = err
    }

    open(): void {
        let modal = this.$refs.modal
        modal.open()
    }
}
</script>
<style scoped lang="scss">
.tokenlist_modal {
    width: 520px;
    max-width: 100%;
    padding: 10px 20px;
}

.add_list {
    display: flex;
    flex-direction: row;
    align-items: center;
    input {
        flex-grow: 1;
        background-color: var(--bg-light);
        margin-right: 8px;
        height: 50px;
        padding: 12px 24px;
        color: var(--primary-color);
        border-radius: var(--border-radius-sm);
    }

    .v-btn {
        padding: 12px 24px;
        height: 50px;
    }
}

.list {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--bg-light);
}
.list_row {
    display: grid;
    column-gap: 12px;
    overflow: auto;
    grid-template-columns: max-content 1fr 50px;
    margin-bottom: 12px;

    &:last-of-type {
        margin: 0;
    }

    > * {
        align-self: center;
    }

    img {
        width: 30px;
        height: 30px;
        object-fit: contain;
    }
}

.info_col {
    overflow: hidden;
    font-size: 1em;
    text-overflow: ellipsis;

    span,
    p:last-of-type {
        font-size: 0.8em;
        color: var(--primary-color-light);
    }

    span {
        padding-left: 8px;
    }
}

.buts {
    font-size: 0.8em;
    color: var(--secondary-color);

    &:hover {
        color: var(--primary-color);
    }
}
</style>
