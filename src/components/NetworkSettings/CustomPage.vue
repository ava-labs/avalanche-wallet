<template>
    <div class="custom_network">
        <form @submit.prevent="submit">
            <div>
                <label>Network Name</label>
                <input type="text" placeholder="Network Name" v-model="name">
            </div>

            <div class="rowGroup">
                <div>
                    <label>Protocol</label>
                    <select v-model="protocol">
                        <option value="http">http</option>
                        <option value="https">https</option>
                    </select>
                </div>
                <div>
                    <label>URL</label>
                    <input type="text" placeholder="ex: 127.0.0.1" v-model="ip">
                </div>
                <div>
                    <label>Port</label>
                    <input type="number" placeholder="8000" v-model="port">
                </div>
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

            <button>Add Network</button>
        </form>
    </div>
</template>
<script>
    export default {
        data(){
            return {
                name: "My Network",
                ip: '',
                port: null,
                protocol: 'http',
                networkId: 12345,
                chainId: 'X',
            }
        },
        methods:{
            errCheck(){

            },
            submit(){
                let networkItem = {
                    name: this.name,
                    url: this.ip,
                    port: this.port,
                    protocol: this.protocol,
                }

            }
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
</style>
