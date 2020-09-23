import {Module} from "vuex";
import {RootState} from "@/store/types";

import {ava, avm, infoApi, pChain} from "@/AVA";
import {AvaNetwork} from "@/js/AvaNetwork";
import {explorer_api} from "@/explorer_api";
import BN from "bn.js";
import {
    PlatformState,
    ValidatorDelegatorDict,
    ValidatorDelegatorPendingDict,
    ValidatorDict,
    ValidatorGroup
} from "@/store/modules/platform/types";
import {
    DelegatorPendingRaw,
    DelegatorRaw,
    GetValdiatorsResponse,
    ValidatorRaw
} from "@/components/misc/ValidatorList/types";

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
            state.minStake = res.minValidatorStake;
            state.minStakeDelegation = res.minDelegatorStake;

            // console.log(state.minStake.toString())
            // console.log(state.minStakeDelegation.toString())
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
                    ...v,
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
        },

        // Maps delegators to a node id
        nodeDelegatorMap(state): ValidatorDelegatorDict{
            let res: ValidatorDelegatorDict = {};
            let delegators = state.delegators;
            for(var i=0; i<delegators.length; i++){
                let delegator = delegators[i];
                let nodeID = delegator.nodeID;
                let target = res[nodeID];

                if(target){
                    res[nodeID].push(delegator);
                }else{
                    res[nodeID] = [delegator];
                }
            }
            return res;
        },

        nodeDelegatorPendingMap(state): ValidatorDelegatorPendingDict{
            let res: ValidatorDelegatorPendingDict = {};
            let delegators = state.delegatorsPending;
            for(var i=0; i<delegators.length; i++){
                let delegator = delegators[i];
                let nodeID = delegator.nodeID;
                let target = res[nodeID];

                if(target){
                    res[nodeID].push(delegator);
                }else{
                    res[nodeID] = [delegator];
                }
            }
            return res;
        },


        validatorMaxStake: (state, getters) => (validator: ValidatorRaw) => {
            let stakeAmt = new BN(validator.stakeAmount);

            // 5 times the validator's stake
            let relativeMaxStake = stakeAmt.mul(new BN(5));

            // absolute max stake
            let mult = new BN(10).pow(new BN(6+9))
            let absMaxStake = new BN(3).mul(mult);

            if(relativeMaxStake.lt(absMaxStake)){
                return relativeMaxStake;
            }else{
                return absMaxStake;
            }
        },

        // Returns total active and pending delegation amount for the given node id
        validatorTotalDelegated: (state, getters) => (nodeId: string) => {
            // let validator: ValidatorRaw = getters.validatorsDict[nodeId];

            let delegators: DelegatorRaw[]|undefined = getters.nodeDelegatorMap[nodeId];
            let delegatorsPending: DelegatorPendingRaw[]|undefined = getters.nodeDelegatorPendingMap[nodeId];

            // let stakeTotal = new BN(validator.stakeAmount);

            let activeTotal = new BN(0);
            let pendingTotal = new BN(0);

            if(delegators){
                activeTotal = delegators.reduce((acc: BN, val: DelegatorRaw) => {
                    let valBn = new BN(val.stakeAmount);
                    return acc.add(valBn);
                }, new BN(0));
            }

            if(delegatorsPending){
                pendingTotal = delegatorsPending.reduce((acc: BN, val: DelegatorPendingRaw) => {
                    let valBn = new BN(val.stakeAmount);
                    return acc.add(valBn);
                }, new BN(0));
            }

            let totDel = activeTotal.add(pendingTotal);
            return totDel;
        },

        validatorRemainingStake: (state, getters) => (nodeId: string) => {
            let validator: ValidatorRaw = getters.validatorsDict[nodeId];

            let delegators: DelegatorRaw[] = getters.nodeDelegatorMap[nodeId];
            let delegatorsPending: DelegatorPendingRaw[] = getters.nodeDelegatorPendingMap[nodeId];

            let stakeTotal = new BN(validator.stakeAmount);

            let activeTotal = delegators.reduce((acc: BN, val: DelegatorRaw) => {
                let valBn = new BN(val.stakeAmount);
                return acc.add(valBn);
            }, new BN(0));

            let pendingTotal = delegatorsPending.reduce((acc: BN, val: DelegatorPendingRaw) => {
                let valBn = new BN(val.stakeAmount);
                return acc.add(valBn);
            }, new BN(0));

            let totDel = activeTotal.add(pendingTotal);
        }

    }
};

export default platform_module;
