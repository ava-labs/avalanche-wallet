import {Module, Store} from "vuex";
import {RootState} from "@/store/types";
import {NetworkItem, NetworkState} from "@/store/modules/network/types";

import {ava, avm} from "@/AVA";


const network_module: Module<NetworkState, RootState> = {
    namespaced: true,
    state: {
        networks: [],
        selectedNetwork: null
    },
    mutations: {
        addNetwork(state, net: NetworkItem){
            state.networks.push(net);
        },
    },
    actions: {
        async setNetwork({state, dispatch}, net:NetworkItem){
            ava.setAddress(net.url,net.port,net.protocol);
            ava.setNetworkID(net.networkId);
            ava.AVM().refreshBlockchainID();


            console.log(ava.getNetworkID());
            console.log(ava.AVM().getBlockchainID());
            console.log(ava.AVM().getBlockchainAlias());

            try{
                await dispatch('Assets/clearBalances', null, {root: true});
                await dispatch('refreshAddresses', null, {root: true})

                dispatch('Notifications/add', {
                    title: "Network Changed",
                    message: "Connected to "+net.url,
                    type: "success"
                }, {root: true});

                state.selectedNetwork = net;
            }catch (e) {
                console.log(e);
                dispatch('Notifications/add', {
                    title: "Connection Failed",
                    message: `${net.url} did not respond.`,
                    type: "error"
                }, {root:true});

                state.selectedNetwork = null;
            }
        },
        init({state, commit, dispatch}){
            let netTest = {
                name: 'Gecko Localhost',
                protocol: 'http',
                url: 'localhost',
                port: 9650,
                networkId: 12345,
                chainId: 'X'
            };


            let netLocal = {
                name: 'TestNet',
                protocol: 'https',
                url: 'bootstrap.ava.network',
                port: 21000,
                networkId: 2,
                chainId: 'X'
            };


            commit('addNetwork', netTest);
            commit('addNetwork', netLocal);
            dispatch('setNetwork', state.networks[1])
        }

    },
    getters: {

    }
};

export default network_module;
