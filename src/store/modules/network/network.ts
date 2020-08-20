import {Module} from "vuex";
import {RootState} from "@/store/types";
import {NetworkState} from "@/store/modules/network/types";

import {ava, avm, infoApi} from "@/AVA";
import {AvaNetwork} from "@/js/AvaNetwork";
import {explorer_api} from "@/explorer_api";
import BN from "bn.js";

const network_module: Module<NetworkState, RootState> = {
    namespaced: true,
    state: {
        status: 'disconnected', // disconnected | connecting | connected
        networks: [],
        selectedNetwork: null,
        txFee: new BN(0)
    },
    mutations: {
        addNetwork(state, net: AvaNetwork){
            state.networks.push(net);
        },
    },
    actions: {
        async setNetwork({state, dispatch, commit, rootState}, net:AvaNetwork){
            // Query the network to get network id

            state.status = 'connecting';
            ava.setAddress(net.ip,net.port,net.protocol);
            ava.setNetworkID(net.networkId);
            ava.XChain().refreshBlockchainID();

            state.selectedNetwork = net;
            explorer_api.defaults.baseURL = net.explorerUrl;


            commit('Assets/removeAllAssets', null, {root: true});
            await dispatch('Assets/updateAvaAsset', null, {root: true});

            // If authenticated
            if(rootState.isAuth){
                for(var i=0; i<rootState.wallets.length;i++){
                    let w = rootState.wallets[i];
                        w.onnetworkchange();
                }
            }

            setTimeout(() => {
                dispatch('Assets/updateUTXOs', null, {root: true});
                dispatch('updateTxFee');
            }, 1000);

            // state.isConnected = true;
            state.status = 'connected';
            return true;
        },

        async updateTxFee({state}){
            let txFee = await infoApi.getTxFee();
            state.txFee = txFee;
            avm.setFee(txFee);
        },

        async init({state, commit, dispatch}){
            let netTest = new AvaNetwork("Everest TestNet", 'https://testapi.avax.network:443', 4, 'X', 'https://explorerapi.avax.network');
            let netLocal = new AvaNetwork("Gecko Localhost",'http://localhost:9650', 12345, 'X');


            commit('addNetwork', netTest);
            commit('addNetwork', netLocal);
            try{
                let res = await dispatch('setNetwork', state.networks[0]);
                return true;
            }catch (e) {
                console.log(e);
                state.status = 'disconnected';
            }
        }
    },
    getters: {

    }
};

export default network_module;
