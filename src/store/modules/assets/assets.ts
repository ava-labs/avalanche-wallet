import {Module, Store} from "vuex";
import {AssetsState} from "@/store/modules/assets/types";
import {RootState} from "@/store/types";
import {avm} from "@/AVA";
import {UTXOSet} from "slopes";

const assets_module: Module<AssetsState, RootState> = {
    namespaced: true,
    state: {
        isUpdateBalance: false
    },
    mutations: {

    },
    actions: {
        updateUTXOs(store){
            // console.log(store.state.addresses);
            // let addresses = avm.keyChain().getAddresses();
            // console.log(addresses,store.state.address)
            store.state.isUpdateBalance = true;
            avm.getUTXOs(store.state.addresses).then((res: UTXOSet) =>{
                store.state.isUpdateBalance = false;

                store.commit('setUTXOSet', res);
                let utxos = res.getAllUTXOs();
                store.commit('setUTXOs', utxos);
                store.dispatch('updateAssetsData');
            }).catch(err => {
                console.log(err);
                store.state.isUpdateBalance = false;
            });
        },
    },
    getters: {
    }
};

export default assets_module;