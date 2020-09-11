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
    },
    mutations: {
        setValidators(state, validators: ValidatorRaw[]){
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
                // let target = validatorDict[v.nodeID];
                let uptime = parseFloat(v.uptime);

                // if(target){
                //     if(uptime){ // If Validator
                //         target.startTime = v.startTime;
                //         target.endTime = v.endTime;
                //         target.uptime = v.uptime;
                //         target.rewardAddress = v.rewardAddress;
                //         target.delegationFeeRate = v.delegationFeeRate;
                //     }
                //
                //     let targetAmt = new BN(target.stakeAmount);
                //     let vAmt = new BN(v.stakeAmount);
                //     let tot = targetAmt.add(vAmt);
                //     target.stakeAmount = tot.toString();
                // }else{
                    validatorDict[v.nodeID] = {
                        connection: v.connection,
                        stakeAmount: v.stakeAmount,
                        startTime: v.startTime,
                        delegationFee: v.delegationFee,
                        endTime: v.endTime,
                        nodeID: v.nodeID,
                        uptime: v.uptime,
                        potentialReward: v.potentialReward,
                        rewardOwner: v.rewardOwner,
                    }
                // }
            }

            for(var n=0; i<delegators.length; n++) {
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
