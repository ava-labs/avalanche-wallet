import {Module} from "vuex";
import {RootState} from "@/store/types";
import {NetworkState} from "@/store/modules/network/types";

import {ava, avm, infoApi} from "@/AVA";
import {AvaNetwork} from "@/js/AvaNetwork";
import {explorer_api} from "@/explorer_api";
import BN from "bn.js";
import {getPreferredHRP} from "avalanche/dist/utils";
import router from "@/router";

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

            let chainIdX = await infoApi.getBlockchainID('X');
            let chainIdP = await  infoApi.getBlockchainID('P');
            // TODO: Remove these constant ids

            console.log(chainIdX, chainIdP);
            ava.XChain().refreshBlockchainID(chainIdX);
            ava.PChain().refreshBlockchainID(chainIdP);


            // TODO: Turn on before manhattan push
            // enter lockdown mode if network id is 0 (Manhattan)
            if(net.networkId===0){
                rootState.isMainnetLock = true;
                router.push('/wallet/mainnet');
            }else{
                rootState.isMainnetLock = false;
                if(state.selectedNetwork?.networkId===0){
                    router.push('/wallet/');
                }
            }

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
                dispatch('Platform/update', null, {root: true});
                dispatch('Platform/updateMinStakeAmount', null, {root: true});
                dispatch('updateTxFee');
            }, 2000);

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
            let netTest = new AvaNetwork("Everest TestNet", 'https://api.avax-test.network:443', 4, 'X', 'https://explorerapi.avax.network');
            let manhattan = new AvaNetwork("Manhattan",'https://api.avax.network:443', 0, 'X');
            let netLocal = new AvaNetwork("Localhost",'http://localhost:9650', 12345, 'X');


            commit('addNetwork', netTest);
            commit('addNetwork', manhattan);
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
