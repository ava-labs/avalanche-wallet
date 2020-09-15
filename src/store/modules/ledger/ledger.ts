import {Module} from "vuex";
import {RootState} from "@/store/types";
import {LedgerState} from "@/store/modules/ledger/types";





const ledger_module: Module<LedgerState, RootState> = {
    namespaced: true,
    state: {
        isBlock: false, // if true a modal blocks the window
        title: '',
        info: ''
    },
    mutations: {
        openModal(state){
            state.isBlock = true;
        },
        closeModal(state){
            state.isBlock = false;
        }
    },
    actions: {
    }
};

export default ledger_module;
