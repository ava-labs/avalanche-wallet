import { Module } from 'vuex'
import { RootState } from '@/store/types'

import { BN } from '@c4tplatform/camino'
import { ava } from '@/AVA'

import {
    GetPendingValidatorsResponse,
    GetValidatorsResponse,
    PlatformState,
    ValidatorDelegatorDict,
    ValidatorDelegatorPendingDict,
    ValidatorListItem,
} from '@/store/modules/platform/types'
import {
    DelegatorPendingRaw,
    DelegatorRaw,
    ValidatorRaw,
} from '@/components/misc/ValidatorList/types'
import { ONEAVAX } from '@c4tplatform/camino/dist/utils'

const MINUTE_MS = 60000
const HOUR_MS = MINUTE_MS * 60
const DAY_MS = HOUR_MS * 24

const platform_module: Module<PlatformState, RootState> = {
    namespaced: true,
    state: {
        validators: [],
        validatorsPending: [],
        // delegators: [],
        delegatorsPending: [],
        minStake: new BN(0),
        minStakeDelegation: new BN(0),
        currentSupply: new BN(1),
    },
    mutations: {
        setValidators(state, validators: ValidatorRaw[]) {
            state.validators = validators
        },
    },
    actions: {
        async updateCurrentSupply({ state }) {
            state.currentSupply = await ava.PChain().getCurrentSupply()
        },

        async updateMinStakeAmount({ state }) {
            let res = await ava.PChain().getMinStake(true)
            state.minStake = res.minValidatorStake
            state.minStakeDelegation = res.minDelegatorStake

            // console.log(state.minStake.toString())
            // console.log(state.minStakeDelegation.toString())
        },

        async update({ dispatch }) {
            dispatch('updateValidators')
            dispatch('updateValidatorsPending')
            dispatch('updateCurrentSupply')
        },

        async updateValidators({ state, commit }) {
            let res = (await ava.PChain().getCurrentValidators()) as GetValidatorsResponse
            let validators = res.validators

            commit('setValidators', validators)
        },

        async updateValidatorsPending({ state, commit }) {
            let res = (await ava.PChain().getPendingValidators()) as GetPendingValidatorsResponse
            let validators = res.validators
            let delegators = res.delegators

            //@ts-ignore
            state.validatorsPending = validators
            state.delegatorsPending = delegators
        },
    },
    getters: {
        validatorListEarn(state, getters): ValidatorListItem[] {
            // Filter validators we do not need
            let now = Date.now()

            let validators = state.validators
            validators = validators.filter((v) => {
                let endTime = parseInt(v.endTime) * 1000
                let dif = endTime - now

                // If End time is less than 2 weeks + 1 hour, remove from list they are no use
                let threshold = DAY_MS * 14 + 10 * MINUTE_MS
                if (dif <= threshold) {
                    return false
                }

                return true
            })

            let delegatorMap: ValidatorDelegatorDict = getters.nodeDelegatorMap
            let delegatorPendingMap: ValidatorDelegatorPendingDict = getters.nodeDelegatorPendingMap

            let res: ValidatorListItem[] = []

            for (var i = 0; i < validators.length; i++) {
                let v = validators[i]

                let nodeID = v.nodeID

                let delegators: DelegatorRaw[] = delegatorMap[nodeID] || []
                let delegatorsPending: DelegatorPendingRaw[] = delegatorPendingMap[nodeID] || []

                let delegatedAmt = new BN(0)
                let delegatedPendingAmt = new BN(0)

                if (delegators) {
                    delegatedAmt = delegators.reduce((acc: BN, val: DelegatorRaw) => {
                        return acc.add(new BN(val.stakeAmount))
                    }, new BN(0))
                }

                if (delegatorsPending) {
                    delegatedPendingAmt = delegatorsPending.reduce(
                        (acc: BN, val: DelegatorPendingRaw) => {
                            return acc.add(new BN(val.stakeAmount))
                        },
                        new BN(0)
                    )
                }

                let startTime = new Date(parseInt(v.startTime) * 1000)
                let endTime = new Date(parseInt(v.endTime) * 1000)

                let delegatedStake = delegatedAmt.add(delegatedPendingAmt)
                let validatorStake = new BN(v.stakeAmount)
                // Calculate remaining stake
                let absMaxStake = ONEAVAX.mul(new BN(3000000))
                let relativeMaxStake = validatorStake.mul(new BN(5))
                let stakeLimit = BN.min(absMaxStake, relativeMaxStake)

                let remainingStake = stakeLimit.sub(validatorStake).sub(delegatedStake)

                let listItem: ValidatorListItem = {
                    nodeID: v.nodeID,
                    validatorStake: validatorStake,
                    delegatedStake: delegatedStake,
                    remainingStake: remainingStake,
                    numDelegators: delegators.length + delegatorsPending.length,
                    startTime: startTime,
                    endTime,
                    uptime: parseFloat(v.uptime),
                    fee: parseFloat(v.delegationFee),
                }
                res.push(listItem)
            }

            res = res.filter((v) => {
                // Remove if remaining space is less than minimum
                let min = state.minStakeDelegation
                if (v.remainingStake.lt(min)) return false
                return true
            })

            return res
        },

        // Maps delegators to a node id

        nodeDelegatorMap(state): ValidatorDelegatorDict {
            let res: ValidatorDelegatorDict = {}
            let validators = state.validators
            for (var i = 0; i < validators.length; i++) {
                let validator = validators[i]
                let nodeID = validator.nodeID
                res[nodeID] = validator.delegators || []
            }
            return res
        },

        nodeDelegatorPendingMap(state): ValidatorDelegatorPendingDict {
            let res: ValidatorDelegatorPendingDict = {}
            let delegators = state.delegatorsPending
            for (var i = 0; i < delegators.length; i++) {
                let delegator = delegators[i]
                let nodeID = delegator.nodeID
                let target = res[nodeID]

                if (target) {
                    res[nodeID].push(delegator)
                } else {
                    res[nodeID] = [delegator]
                }
            }
            return res
        },

        // Given a validator list item, calculate the max stake of this item
        validatorMaxStake: (state, getters) => (validator: ValidatorListItem) => {
            let stakeAmt = validator.validatorStake

            // 5 times the validator's stake
            let relativeMaxStake = stakeAmt.mul(new BN(5))

            // absolute max stake
            let mult = new BN(10).pow(new BN(6 + 9))
            let absMaxStake = new BN(3).mul(mult)

            if (relativeMaxStake.lt(absMaxStake)) {
                return relativeMaxStake
            } else {
                return absMaxStake
            }
        },

        // Returns total active and pending delegation amount for the given node id
        // validatorTotalDelegated: (state, getters) => (nodeId: string) => {
        //     // let validator: ValidatorRaw = getters.validatorsDict[nodeId];
        //
        //     let delegators: DelegatorRaw[]|undefined = getters.nodeDelegatorMap[nodeId];
        //     let delegatorsPending: DelegatorPendingRaw[]|undefined = getters.nodeDelegatorPendingMap[nodeId];
        //
        //     // let stakeTotal = new BN(validator.stakeAmount);
        //
        //     let activeTotal = new BN(0);
        //     let pendingTotal = new BN(0);
        //
        //     if(delegators){
        //         activeTotal = delegators.reduce((acc: BN, val: DelegatorRaw) => {
        //             let valBn = new BN(val.stakeAmount);
        //             return acc.add(valBn);
        //         }, new BN(0));
        //     }
        //
        //     if(delegatorsPending){
        //         pendingTotal = delegatorsPending.reduce((acc: BN, val: DelegatorPendingRaw) => {
        //             let valBn = new BN(val.stakeAmount);
        //             return acc.add(valBn);
        //         }, new BN(0));
        //     }
        //
        //     let totDel = activeTotal.add(pendingTotal);
        //     return totDel;
        // },
    },
}

export default platform_module
