import {Module, Store} from "vuex";
import {AddressUtxoDict, AssetAPI, AssetDescription, AssetsDict, AssetsState} from "@/store/modules/assets/types";
import {RootState} from "@/store/types";
import {ava, avm, bintools} from "@/AVA";
import {UTXOSet} from "slopes";
import Vue from "vue";
import AvaAsset from "@/js/AvaAsset";
import {explorer_api} from "@/explorer_api";



import {HistoryState} from "@/store/modules/history/types";


const history_module: Module<HistoryState, RootState> = {
    namespaced: true,
    state: {
        isUpdating: false,
        transactions: [],
    },
    mutations: {

    },
    actions: {
        async updateTransactionHistory({state, rootState}){
            if(!rootState.activeWallet) return;

            // @ts-ignore
            let network = rootState.Network.selectedNetwork;

            // can't update if there is no explorer or no wallet
            if(!network.explorerUrl || rootState.address===null){
                return false;
            }

            state.isUpdating = true;

            let offset = 0;
            let limit = 20;

            let addresses = rootState.activeWallet.getKeyChain().getAddressStrings();

            let query = addresses.map(val => {
                let raw = val.split('-')[1];
                return `address=${raw}`;
            });


            // Get history for all addresses of the active HD wallet
            let url = `/x/transactions?${query.join('&')}&limit=${limit}&offset=${offset}&sort=timestamp-desc`;
            let res = await explorer_api.get(url);

            let transactions = res.data.transactions;

            state.transactions = transactions;
            state.isUpdating = false;
        }
    }
};

export default history_module;
