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
    },
    mutations: {
        setValdiators(state, validators: ValidatorRaw[]){
            state.validators = validators;
        }
    },
    actions: {

        async update({dispatch}){
            dispatch('updateValidators');
            dispatch('updateValidatorsPending');
        },

        async updateValidators({state, commit}){
            let res = await pChain.getCurrentValidators() as GetValdiatorsResponse;
            let validators = res.validators;
            commit('setValdiators', validators)
        },

        async updateValidatorsPending({state, commit}){
            let res = await pChain.getPendingValidators() as GetValdiatorsResponse;
            let validators = res.validators;
            state.validatorsPending = validators;
        }
    },
    getters: {
        validatorsDict(state): ValidatorDict{
            let validators = state.validators;
            let validatorDict: ValidatorDict = {};

            for(var i=0; i<validators.length; i++){
                let v = validators[i];
                let target = validatorDict[v.nodeID];
                let uptime = parseFloat(v.uptime);

                if(target){
                    if(uptime){ // If Validator
                        target.startTime = v.startTime;
                        target.endTime = v.endTime;
                        target.uptime = v.uptime;
                        target.rewardAddress = v.rewardAddress;
                        target.delegationFeeRate = v.delegationFeeRate;
                    }

                    let targetAmt = new BN(target.stakeAmount);
                    let vAmt = new BN(v.stakeAmount);
                    let tot = targetAmt.add(vAmt);
                    target.stakeAmount = tot.toString();
                }else{
                    validatorDict[v.nodeID] = {
                        stakeAmount: v.stakeAmount,
                        startTime: v.startTime,
                        endTime: v.endTime,
                        nodeID: v.nodeID,
                        uptime: v.uptime,
                        rewardAddress: v.rewardAddress,
                        delegationFeeRate: v.delegationFeeRate
                    }
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
