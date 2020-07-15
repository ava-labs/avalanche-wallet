<template>
    <div class="custom_network">
        <form @submit.prevent="submit">
            <div>
                <label>Network Name</label>
                <input type="text" placeholder="Network Name" v-model="name">
            </div>
            <div>
                <label>URL</label>
                <input type="text" placeholder="http://localhost:9650" v-model="url" @input="checkUrl">
                <p class="form_error" v-if="err_url">{{err_url}}</p>
            </div>
            <div>
                <label>Explorer API (optional)</label>
                <input type="text" placeholder="www" v-model="explorer_api" @input="cleanExplorerUrl">
            </div>
            <div>
                <label>Chain ID</label>
                <input type="text" placeholder="Chain ID" v-model="chainId">
            </div>
            <p v-if="err" class="form_error">{{err}}</p>
<!--            <button>Add Network</button>-->
            <v-btn :loading="isAjax" height="26" depressed color="#4C2E56" type="submit">Add Network</v-btn>
        </form>
    </div>
</template>
<script>
    import {AvaNetwork} from "@/js/AvaNetwork";
    import axios from "axios";
    import punycode from 'punycode';


    export default {
        data(){
            return {
                name: "My Custom Network",
                url: '',
                explorer_api: '',
                chainId: 'X',
                err: null,
                err_url: '',
                isAjax: false,
            }
        },
        methods:{
            cleanExplorerUrl(){
                let url = this.explorer_api;
                url = punycode.toASCII(url);
                this.explorer_api = url;
            },
            checkUrl(){
                let err = '';
                let url = this.url;
                // protect against homograph attack: https://hethical.io/homograph-attack-using-internationalized-domain-name/

                url = punycode.toASCII(url);
                this.url = url;

                // must contain http / https prefix
                if(url.substr(0,7) !== 'http://' && url.substr(0,8) !== 'https://'){
                    this.err_url = "URLs require the appropriate HTTP/HTTPS prefix."
                    return false;
                }

                let split = url.split('://');
                let rest = split[1];

                // must have base ip
                if(rest.length===0){
                    this.err_url = "Invalid URL.";
                    return false;
                }

                // Must have port
                if(!rest.includes(':')){
                    this.err_url = "You must specify the port of the url.";
                    return false;
                }

                let port = rest.split(':')[1];

                // Port must be number
                if(isNaN(port) || port.length===0){
                    this.err_url = "Invalid port.";
                    return false;
                }

                this.err_url = '';
                return true;

            },
            errCheck(){
                let err = null;

                // check for HTTP HTTPS on url
                let url = this.url;

                if(url.substr(0,7) !== 'http://' && url.substr(0,8) !== 'https://'){
                    err = "URLs require the appropriate HTTP/HTTPS prefix."
                }

                if(!this.name) err = "You must give the network a name.";
                else if(!this.url) err = 'You must set the URL.';
                else if(!this.chainId) err = 'You must set the chain id.';


                return err;
            },
            async submit(){
                this.err = null;
                let err = this.errCheck();

                if(err){
                    this.err = err;
                    return;
                }

                this.isAjax = true;
                let netID = null;

                try{
                    let resp = await axios.post(this.url+'/ext/info', {
                        "jsonrpc": "2.0",
                        "id"     : 1,
                        "method" : "info.getNetworkID"
                    });
                    netID = resp.data.result.networkID;
                    this.isAjax = false;
                }catch(e){
                    this.isAjax = false;
                    this.err = "AVA Network Not Found";
                    return;
                }

                let net = new AvaNetwork(this.name, this.url,  netID, this.chainId, this.explorer_api);

                this.$emit('add', net);

                // Clear values
                this.name = 'My Custom Network';
                this.url = '';
                this.chainId = 'X';
            }
        }
    }
</script>
<style scoped lang="scss">
@use '../../main';

    .custom_network{
        padding: 0px 15px;
        padding-bottom: 15px;
    }

    .header{
        border-bottom: 1px solid main.$background-color;
        padding: 10px 15px;
        display: flex;
        h4{
            flex-grow: 1;
        }

        button{
            font-size: 12px;
            padding: 3px 14px;
            border-radius: 4px;
        }
    }

    form{
        label{
            font-size: 12px;
        }
        > div{
            display: flex;
            flex-direction: column;
            margin-bottom: 5px;
        }
    }

    input, select{
        color: main.$primary-color;
        background-color: main.$background-color;
        border-radius: 4px;
        padding: 6px 6px;
        font-size: 13px;
        outline: none;
    }
    button{
        margin-top: 10px;
        width: 100%;
        background-color: main.$primary-color;
        color: #fff;
        font-size: 12px;
        border-radius: 4px;
    }

    .v-btn{
        text-transform: none;
        color: #fff !important;
        font-size: 12px !important;
    }

    .rowGroup{
        display: flex;
        flex-direction: row;
        justify-content: space-between;

        > *{
            margin-right: 5px;

            &:last-of-type{
                margin-right: 0;
            }
        }
    }


    .form_error{
        font-size: 12px;
        color: #e03737;
    }
</style>