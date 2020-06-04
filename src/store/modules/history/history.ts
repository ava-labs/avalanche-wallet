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
            // @ts-ignore
            let network = rootState.Network.selectedNetwork;

            // can't update if there is no explorer
            if(!network.explorerUrl){
                return false;
            }

            state.isUpdating = true;
            console.log("Updating history...");

            let addr = rootState.selectedAddress;
            let addrRaw = addr.split('-')[1];

            let offset = 0;
            let limit = 20;

            // TODO: update history collectively for all the addresses
            // TODO: or just the selected key?

            let url = `/x/transactions?address=${addrRaw}&limit=${limit}&offset=${offset}&sort=timestamp-desc`;
            let res = await explorer_api.get(url);

            let transactions = res.data.transactions;

            state.transactions = transactions;
            state.isUpdating = false;
        }
    },
    getters: {

    }

};

export default history_module;
