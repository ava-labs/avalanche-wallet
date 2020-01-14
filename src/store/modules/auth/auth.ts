import {Module, Store} from "vuex";
import {RootState} from "@/store/types";
import {AuthState} from "@/store/modules/auth/types";

// import avajs from '../../../AVA';
//
// console.log(avajs);

interface registerInput {
    username: string,
    password: string,
    passwordConfirm: string,
}

const auth_module: Module<AuthState, RootState> = {
    namespaced: true,
    state: {

    },
    mutations: {

    },
    actions: {
        register(store, data:registerInput){

        }
    },
    getters: {

    }
};

export default auth_module;