<template>
    <div class="custom_network">
        <form @submit.prevent="">
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
                <input type="text" placeholder="www" v-model="explorer_api">
            </div>
            <div class="rowGroup">
                <div>
                    <label>Network ID</label>
                    <input type="number" placeholder="Network ID" v-model="networkId">
                </div>
                <div>
                    <label>Chain ID</label>
                    <input type="text" placeholder="Chain ID" v-model="chainId">
                </div>
            </div>
            <p v-if="err" class="form_error">{{err}}</p>
            <button @click="saveNetwork">Save Changes</button>
<!--            <button @click="deleteNetwork" class="del_button">Delete Network</button>-->
        </form>
    </div>
</template>
<script>
    import {AvaNetwork} from "@/js/AvaNetwork";

    export default {
        data(){
            return {
                name: "My Custom Network",
                url: '',
                networkId: 12345,
                explorer_api: '',
                chainId: 'X',
                err: null,
                err_url: '',
            }
        },
        props: {
            net: {
                type: AvaNetwork,
                required: true
            }
        },
        mounted() {
            let net = this.net;

            this.name = net.name;
            this.url = net.getFullURL();
            this.networkId = net.networkId;
            this.chainId = net.chainId;
        },
        methods:{
            checkUrl(){
                let err = '';
                let url = this.url;


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


                // No trailing slash
                // if(port.){
                //     this.err_url = "You should remove any trailing / slashes.";
                //     return false;
                // }

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
                else if(!this.networkId) err = 'You must set the network id.';


                return err;
            },
            deleteNetwork(){
                this.$emit('delete');
            },
            saveNetwork(){
                let net = this.net;
                net.name = this.name;
                net.updateURL(this.url);
                net.networkId =  this.networkId;
                net.chainId =  this.chainId;

                this.$parent.page = 'list';
            },
        }
    }
</script>
<style scoped lang="scss">
    .custom_network{
        padding: 0px 15px;
        padding-bottom: 15px;
    }

    .header{
        border-bottom: 1px solid #EAEDF4;
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
        background-color: #f2f2f2;
        border-radius: 4px;
        padding: 6px 6px;
        font-size: 13px;
        outline: none;
    }
    button{
        margin-top: 10px;
        width: 100%;
        background-color: #2960CD;
        color: #fff;
        font-size: 12px;
        padding: 3px 14px;
        border-radius: 4px;
    }

    .del_button{

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
