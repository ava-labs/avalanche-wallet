<template>
    <div class="custom_network">
        <form @submit.prevent="submit">
            <div>
                <label>{{ $t('network.custom_page.label1') }}</label>
                <input
                    type="text"
                    placeholder="Network Name"
                    v-model="name"
                    data-cy="custom-network-name"
                />
            </div>
            <div>
                <label>URL</label>
                <input
                    data-cy="custom-network-url"
                    type="text"
                    placeholder="http://localhost:9650"
                    v-model="url"
                    @input="checkUrl"
                />
                <p class="form_error" v-if="err_url">{{ err_url }}</p>
            </div>
            <div>
                <label>{{ $t('network.custom_page.label2') }}</label>
                <input
                    type="text"
                    placeholder="www"
                    v-model="explorer_api"
                    @input="cleanExplorerUrl"
                />
            </div>
            <div>
                <label>{{ $t('network.custom_page.label3') }}</label>
                <input
                    type="text"
                    placeholder="www"
                    v-model="explorer_site"
                    @input="cleanExplorerSite"
                />
            </div>
            <p v-if="err" class="form_error">{{ err }}</p>
            <v-btn
                data-cy="custom-network-add"
                :loading="isAjax"
                height="26"
                depressed
                type="submit"
                class="button_primary"
            >
                {{ $t('network.add') }}
            </v-btn>
        </form>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component } from 'vue-property-decorator'

import { AvaNetwork } from '@/js/AvaNetwork'
import axios from 'axios'
import punycode from 'punycode'

@Component
export default class CustomPage extends Vue {
    name = 'My Custom Network'
    url = ''
    explorer_api = ''
    explorer_site = ''
    err: null | string = null
    err_url = ''
    isAjax = false

    cleanExplorerUrl() {
        let url = this.explorer_api
        url = punycode.toASCII(url)
        this.explorer_api = url
    }

    cleanExplorerSite() {
        let url = this.explorer_site
        url = punycode.toASCII(url)
        this.explorer_site = url
    }

    checkUrl() {
        let err = ''
        let url = this.url
        // protect against homograph attack: https://hethical.io/homograph-attack-using-internationalized-domain-name/

        url = punycode.toASCII(url)
        this.url = url

        // must contain http / https prefix
        if (url.substr(0, 7) !== 'http://' && url.substr(0, 8) !== 'https://') {
            this.err_url = 'URLs require the appropriate HTTP/HTTPS prefix.'
            return false
        }

        let split = url.split('://')
        let rest = split[1]

        // must have base ip
        if (rest.length === 0) {
            this.err_url = 'Invalid URL.'
            return false
        }

        // Must have port
        if (!rest.includes(':')) {
            this.err_url = 'You must specify the port of the url.'
            return false
        }

        // Port must be number
        let urlSplit = rest.split(':')
        if (urlSplit.length === 0) {
            this.err_url = 'Invalid port.'
            return false
        }

        let port = parseInt(urlSplit[1])

        if (isNaN(port)) {
            this.err_url = 'Invalid port.'
            return false
        }

        this.err_url = ''
        return true
    }
    errCheck() {
        let err = null

        // check for HTTP HTTPS on url
        let url = this.url

        if (url.substr(0, 7) !== 'http://' && url.substr(0, 8) !== 'https://') {
            err = 'URLs require the appropriate HTTP/HTTPS prefix.'
        }

        if (!this.name) err = 'You must give the network a name.'
        else if (!this.url) err = 'You must set the URL.'

        return err
    }

    async tryConnection(credential = false): Promise<number | null> {
        try {
            let resp = await axios.post(
                this.url + '/ext/info',
                {
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'info.getNetworkID',
                },
                {
                    withCredentials: credential,
                }
            )
            return parseInt(resp.data.result.networkID)
        } catch (err) {
            return null
        }
    }
    async submit() {
        this.err = null
        let err = this.errCheck()

        if (err) {
            this.err = err
            return
        }

        // let netID = null

        this.isAjax = true
        let credNum = await this.tryConnection(true)
        let noCredNum = await this.tryConnection()
        this.isAjax = false

        let validNetId = credNum || noCredNum

        if (!validNetId) {
            this.err = 'Camino Network Not Found'
            return
        }

        let net = new AvaNetwork(
            this.name,
            this.url,
            validNetId,
            this.explorer_api,
            this.explorer_site
        )

        this.$emit('add', net)

        // Clear values
        this.name = 'My Custom Network'
        this.url = ''
    }
}
</script>
<style scoped lang="scss">
@use '../../styles/main';

.custom_network {
    padding: 0px 15px;
    padding-bottom: 15px;
}

.header {
    border-bottom: 1px solid main.$background-color;
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

form {
    margin-top: 12px;
    label {
        font-size: 12px;
    }
    > div {
        display: flex;
        flex-direction: column;
        margin-bottom: 5px;
    }
}

input,
select {
    color: var(--primary-color);
    background-color: var(--bg-light);
    border-radius: var(--border-radius-sm);
    padding: 6px 6px;
    font-size: 13px;
    outline: none;
}
button {
    margin-top: 10px;
    width: 100%;
    font-size: 12px;
    border-radius: var(--border-radius-sm);
}

.v-btn {
    text-transform: none;
    font-size: 12px !important;
    color: var(--bg) !important;
}

.rowGroup {
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    > * {
        margin-right: 5px;

        &:last-of-type {
            margin-right: 0;
        }
    }
}

.form_error {
    font-size: 12px;
    color: #e03737;
}
</style>
