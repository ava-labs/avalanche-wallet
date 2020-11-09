import {Module} from "vuex";
import {RootState} from "@/store/types";
import {NetworkState} from "@/store/modules/network/types";

import {ava, avm, bintools, infoApi, pChain} from "@/AVA";
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
        networksCustom: [],
        selectedNetwork: null,
        txFee: new BN(0)
    },
    mutations: {
        addNetwork(state, net: AvaNetwork){
            state.networks.push(net);
        },
        addCustomNetwork(state, net: AvaNetwork){
            state.networksCustom.push(net);
        },
        // Save custom networks to local storage
        save(){

        },
        // Load custom networks from local storage
        load(){

        }
    },
    getters:{
        allNetworks(state){
            return state.networks.concat(state.networksCustom);
        }
    },
    actions: {
        async setNetwork({state, dispatch, commit, rootState}, net:AvaNetwork){
            // Query the network to get network id

            state.status = 'connecting';
            ava.setAddress(net.ip,net.port,net.protocol);
            ava.setNetworkID(net.networkId);

            let chainIdX = await infoApi.getBlockchainID('X');
            let chainIdP = await  infoApi.getBlockchainID('P');

            avm.refreshBlockchainID(chainIdX);
            avm.setBlockchainAlias('X');
            pChain.refreshBlockchainID(chainIdP);
            pChain.setBlockchainAlias('P');
            avm.getAVAXAssetID(true);
            pChain.getAVAXAssetID(true);

            state.selectedNetwork = net;
            explorer_api.defaults.baseURL = net.explorerUrl;

            commit('Assets/removeAllAssets', null, {root: true});
            await dispatch('Assets/updateAvaAsset', null, {root: true});

            // If authenticated
            if(rootState.isAuth){
                // Go back to wallet page
                router.replace('/wallet');
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
            state.txFee = txFee.txFee;
            avm.setTxFee(txFee.txFee);
        },

        async init({state, commit, dispatch}){
            // let netTest = new AvaNetwork("Everest TestNet", 'https://api.avax-test.network:443', 4, 'https://explorerapi.avax.network');
            let manhattan = new AvaNetwork("Mainnet",'https://api.avax.network:443', 1,  "https://explorerapi.avax.network", true);
            let fuji = new AvaNetwork("Fuji",'https://api.avax-test.network:443', 5,  "https://explorerapi.avax-test.network", true);
            let netLocal = new AvaNetwork("Localhost",'http://localhost:9650', 12345,  undefined, true);


            // commit('addNetwork', netTest);
            commit('addNetwork', manhattan);
            commit('addNetwork', fuji);
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
};

export default network_module;
