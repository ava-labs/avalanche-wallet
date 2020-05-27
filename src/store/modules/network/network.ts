import {Module, Store} from "vuex";
import {RootState} from "@/store/types";
import {NetworkItem, NetworkState} from "@/store/modules/network/types";

import {ava, avm} from "@/AVA";
import {AvaNetwork} from "@/js/AvaNetwork";
import {explorer_api} from "@/explorer_api";


const network_module: Module<NetworkState, RootState> = {
    namespaced: true,
    state: {
        isConnected: false,
        networks: [],
        selectedNetwork: null
    },
    mutations: {
        addNetwork(state, net: AvaNetwork){
            state.networks.push(net);
        },
    },
    actions: {
        async setNetwork({state, dispatch}, net:AvaNetwork){
            state.isConnected = false;
            ava.setAddress(net.ip,net.port,net.protocol);
            ava.setNetworkID(net.networkId);
            ava.AVM().refreshBlockchainID();

            state.selectedNetwork = net;
            explorer_api.defaults.baseURL = net.explorerUrl;

            await dispatch('Assets/updateAvaAsset', null, {root: true});
            await dispatch('Assets/updateAssets', null, {root: true});
            await dispatch('Assets/clearBalances', null, {root: true});
            await dispatch('Assets/updateUTXOs', null, {root: true});

            state.isConnected = true;
            return true;
        },
        init({state, commit, dispatch}){
            let netTest = new AvaNetwork("TestNet", 'https://bootstrap.ava.network:21000', 2, 'X', 'https://explorerapi.ava.network');
            let netLocal = new AvaNetwork("Gecko Localhost",'http://localhost:9650', 2, 'X');


            commit('addNetwork', netTest);
            commit('addNetwork', netLocal);
            dispatch('setNetwork', state.networks[0])
        }

    },
    getters: {

    }
};

export default network_module;
