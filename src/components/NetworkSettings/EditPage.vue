<template>
    <div class="custom_network">
        <form @submit.prevent="">
            <div>
                <label>Network Name</label>
                <input type="text" placeholder="Network Name" v-model="name" />
            </div>
            <div>
                <label>URL</label>
                <input
                    type="text"
                    placeholder="http://localhost:9650"
                    v-model="url"
                    @input="checkUrl"
                />
                <p class="form_error" v-if="err_url">{{ err_url }}</p>
            </div>
            <div>
                <label>Explorer API (optional)</label>
                <input
                    type="text"
                    placeholder="www"
                    v-model="explorer_api"
                    @input="cleanExplorerUrl"
                />
            </div>
            <div>
                <label>Explorer Site (optional)</label>
                <input
                    type="text"
                    placeholder="www"
                    v-model="explorer_site"
                    @input="cleanExplorerSite"
                />
            </div>
            <div class="rowGroup">
                <div>
                    <label>Network ID</label>
                    <input type="number" placeholder="Network ID" v-model.number="networkId" />
                </div>
            </div>
            <p v-if="err" class="form_error">{{ err }}</p>
            <button @click="saveNetwork" class="button_primary">Save Changes</button>
            <!--            <button @click="deleteNetwork" class="del_button">Delete Network</button>-->
        </form>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import { AvaNetwork } from '@/js/AvaNetwork'
import punycode from 'punycode'

@Component
export default class EditPage extends Vue {
    name = 'My Custom Network'
    url = ''
    networkId = 12345
    explorer_api: string | undefined = ''
    explorer_site: string | undefined = ''
    chainId = 'X'
    err = null
    err_url = ''

    @Prop() net!: AvaNetwork

    mounted() {
        let net = this.net

        this.name = net.name
        this.url = net.getFullURL()
        this.networkId = net.networkId
        this.explorer_api = net.explorerUrl
        this.explorer_site = net.explorerSiteUrl
    }

    cleanExplorerUrl() {
        // console.log(val);
        let url = this.explorer_api as string
        this.explorer_api = punycode.toASCII(url)
        // console.log(this.explorer_api);
    }

    cleanExplorerSite() {
        let url = this.explorer_site as string
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
        else if (!this.chainId) err = 'You must set the chain id.'
        else if (!this.networkId) err = 'You must set the network id.'

        return err
    }
    deleteNetwork() {
        this.$emit('delete')
    }
    async saveNetwork() {
        let net = this.net
        net.name = this.name
        net.updateURL(this.url)
        net.explorerUrl = this.explorer_api
        net.explorerSiteUrl = this.explorer_site
        net.networkId = this.networkId

        await this.$store.dispatch('Network/save')

        this.$store.dispatch('Notifications/add', {
            title: 'Changes Saved',
            message: 'Network settings updated.',
        })

        this.$emit('success')
    }
}
// export default {
//     data(){
//         return {
//             name: "My Custom Network",
//             url: '',
//             networkId: 12345,
//             explorer_api: '',
//             chainId: 'X',
//             err: null,
//             err_url: '',
//         }
//     },
//     props: {
//         net: {
//             type: AvaNetwork,
//             required: true
//         }
//     },
//     mounted() {
//         let net = this.net;
//
//         this.name = net.name;
//         this.url = net.getFullURL();
//         this.networkId = net.networkId;
//     },
//     methods:{
//         cleanExplorerUrl(){
//             // console.log(val);
//             let url = this.explorer_api;
//             this.explorer_api = punycode.toASCII(url);
//             // console.log(this.explorer_api);
//         },
//         checkUrl(){
//             let err = '';
//             let url = this.url;
//             // protect against homograph attack: https://hethical.io/homograph-attack-using-internationalized-domain-name/
//             url = punycode.toASCII(url);
//             this.url = url;
//
//             // must contain http / https prefix
//             if(url.substr(0,7) !== 'http://' && url.substr(0,8) !== 'https://'){
//                 this.err_url = "URLs require the appropriate HTTP/HTTPS prefix."
//                 return false;
//             }
//
//             let split = url.split('://');
//             let rest = split[1];
//
//             // must have base ip
//             if(rest.length===0){
//                 this.err_url = "Invalid URL.";
//                 return false;
//             }
//
//             // Must have port
//             if(!rest.includes(':')){
//                 this.err_url = "You must specify the port of the url.";
//                 return false;
//             }
//
//             let port = rest.split(':')[1];
//
//             // Port must be number
//             if(isNaN(port) || port.length===0){
//                 this.err_url = "Invalid port.";
//                 return false;
//             }
//
//             this.err_url = '';
//             return true;
//
//         },
//         errCheck(){
//             let err = null;
//
//             // check for HTTP HTTPS on url
//             let url = this.url;
//
//
//             if(url.substr(0,7) !== 'http://' && url.substr(0,8) !== 'https://'){
//                 err = "URLs require the appropriate HTTP/HTTPS prefix."
//             }
//
//             if(!this.name) err = "You must give the network a name.";
//             else if(!this.url) err = 'You must set the URL.';
//             else if(!this.chainId) err = 'You must set the chain id.';
//             else if(!this.networkId) err = 'You must set the network id.';
//
//
//             return err;
//         },
//         deleteNetwork(){
//             this.$emit('delete');
//         },
//         saveNetwork(){
//             let net = this.net;
//             net.name = this.name;
//             net.updateURL(this.url);
//             net.networkId =  this.networkId;
//             net.chainId =  this.chainId;
//
//             this.$parent.page = 'list';
//         },
//     }
// }
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
    background-color: var(--bg-light);
    color: var(--primary-color);
    border-radius: var(--border-radius-sm);
    padding: 6px 6px;
    font-size: 13px;
    outline: none;
    width: 100%;
}
button {
    margin-top: 10px;
    width: 100%;
    background-color: main.$primary-color;
    color: #fff;
    font-size: 12px;
    padding: 3px 14px;
    border-radius: var(--border-radius-sm);
}

.del_button {
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

    > div {
        width: 100%;
    }
}

.form_error {
    font-size: 12px;
    color: #e03737;
}
</style>
