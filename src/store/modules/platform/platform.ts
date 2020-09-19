import {Module} from "vuex";
import {RootState} from "@/store/types";

import {ava, avm, infoApi, pChain} from "@/AVA";
import {AvaNetwork} from "@/js/AvaNetwork";
import {explorer_api} from "@/explorer_api";
import BN from "bn.js";
import {PlatformState, ValidatorDict} from "@/store/modules/platform/types";
import {GetValdiatorsResponse, ValidatorRaw} from "@/components/misc/ValidatorList/types";

const platform_module: Module<PlatformState, RootState> = {
    namespaced: true,
    state: {
        validators: [],
        validatorsPending: [],
        delegators: [],
        delegatorsPending: [],
        minStake: new BN(0),
        minStakeDelegation: new BN(0),
        currentSupply: new BN(1)
    },
    mutations: {
        setValidators(state, validators: ValidatorRaw[]){
            state.validators = validators;
        }
    },
    actions: {

        async updateCurrentSupply({state}){
            state.currentSupply = await pChain.getCurrentSupply()
        },

        async updateMinStakeAmount({state}){
            let res = await pChain.getMinStake(true);
            // state.minStake = res.minValidatorStake;
            // state.minStakeDelegation = res.minDelegatorStake;
            // TODO: Undo for mainnet
            state.minStake = res;
            state.minStakeDelegation = res;
        },

        async update({dispatch}){
            dispatch('updateValidators');
            dispatch('updateValidatorsPending');
            dispatch('updateCurrentSupply');
        },

        async updateValidators({state, commit}){
            let res = await pChain.getCurrentValidators() as GetValdiatorsResponse;
            let validators = res.validators;
            let delegators = res.delegators;

            commit('setValidators', validators)
            state.delegators = delegators;
        },

        async updateValidatorsPending({state, commit}){
            let res = await pChain.getPendingValidators() as GetValdiatorsResponse;
            let validators = res.validators;
            let delegators = res.delegators;

            //@ts-ignore
            state.validatorsPending = validators;
            state.delegatorsPending = delegators;
        }
    },
    getters: {

        validatorsDict(state): ValidatorDict{
            let validators = state.validators;
            let delegators = state.delegators;

            let validatorDict: ValidatorDict = {};

            // let allValidators = validators.concat(delegators);

            for(var i=0; i<validators.length; i++){
                let v = validators[i];
                validatorDict[v.nodeID] = {
                    ...v
                }
            }

            for(var n=0; n<delegators.length; n++) {
                let delegator = delegators[n];
                let nodeID = delegator.nodeID;

                let target = validatorDict[nodeID];
                if(target){
                    let targetAmt = new BN(target.stakeAmount);
                    let vAmt = new BN(delegator.stakeAmount);
                    let tot = targetAmt.add(vAmt);
                    target.stakeAmount = tot.toString();
                }
            }

            return validatorDict;
        },
        validatorsCleanArray(state, getters): ValidatorRaw[]{
            let validatorDict = getters.validatorsDict;
            let res = [];
            for(var nodeId in validatorDict){
                let val = validatorDict[nodeId];
                res.push(val);
            }

            return res;
        }
    }
};

export default platform_module;
