import {Module} from "vuex";
import {RootState} from "@/store/types";
import {LedgerState} from "@/store/modules/ledger/types";





const ledger_module: Module<LedgerState, RootState> = {
    namespaced: true,
    state: {
    },
    mutations: {
        openModal(){

        },

        closeModal(){

        }
    },
    actions: {
    }
};

export default ledger_module;
