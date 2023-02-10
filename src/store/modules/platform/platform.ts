import { Module } from 'vuex'
import { RootState } from '@/store/types'

import { BN } from 'avalanche'
import { pChain } from '@/AVA'

import {
    GetPendingValidatorsResponse,
    GetValidatorsResponse,
    PlatformState,
    ValidatorDelegatorPendingDict,
    ValidatorListItem,
} from '@/store/modules/platform/types'
import { DelegatorPendingRaw, ValidatorRaw } from '@/components/misc/ValidatorList/types'
import { ONEAVAX } from 'avalanche/dist/utils'

const MINUTE_MS = 60000
const HOUR_MS = MINUTE_MS * 60
const DAY_MS = HOUR_MS * 24

const platform_module: Module<PlatformState, RootState> = {
    namespaced: true,
    state: {
        validators: [],
        validatorsPending: [],
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
            state.currentSupply = await pChain.getCurrentSupply()
        },

        async updateMinStakeAmount({ state }) {
            const res = await pChain.getMinStake(true)
            state.minStake = res.minValidatorStake
            state.minStakeDelegation = res.minDelegatorStake
        },

        async update({ dispatch }) {
            dispatch('updateValidators')
            dispatch('updateValidatorsPending')
            dispatch('updateCurrentSupply')
        },

        async updateValidators({ state, commit }) {
            const res = (await pChain.getCurrentValidators()) as GetValidatorsResponse
            const validators = res.validators

            commit('setValidators', validators)
        },

        async updateValidatorsPending({ state, commit }) {
            const res = (await pChain.getPendingValidators()) as GetPendingValidatorsResponse
            const validators = res.validators
            const delegators = res.delegators

            //@ts-ignore
            state.validatorsPending = validators
            state.delegatorsPending = delegators
        },
    },
    getters: {
        validatorListEarn(state, getters): ValidatorListItem[] {
            // Filter validators we do not need
            const now = Date.now()

            let validators = state.validators
            validators = validators.filter((v) => {
                const endTime = parseInt(v.endTime) * 1000
                const dif = endTime - now

                // If End time is less than 2 weeks + 1 hour, remove from list they are no use
                const threshold = DAY_MS * 14 + 10 * MINUTE_MS
                if (dif <= threshold) {
                    return false
                }

                return true
            })

            const delegatorPendingMap: ValidatorDelegatorPendingDict =
                getters.nodeDelegatorPendingMap

            let res: ValidatorListItem[] = []

            for (let i = 0; i < validators.length; i++) {
                const v = validators[i]

                const nodeID = v.nodeID

                const delegatorsPending: DelegatorPendingRaw[] = delegatorPendingMap[nodeID] || []

                const delegatedAmt = new BN(v.delegatorWeight)
                let delegatedPendingAmt = new BN(0)

                if (delegatorsPending) {
                    delegatedPendingAmt = delegatorsPending.reduce(
                        (acc: BN, val: DelegatorPendingRaw) => {
                            return acc.add(new BN(val.stakeAmount))
                        },
                        new BN(0)
                    )
                }

                const startTime = new Date(parseInt(v.startTime) * 1000)
                const endTime = new Date(parseInt(v.endTime) * 1000)

                const delegatedStake = delegatedAmt.add(delegatedPendingAmt)
                const validatorStake = new BN(v.stakeAmount)
                // Calculate remaining stake
                const absMaxStake = ONEAVAX.mul(new BN(3000000))
                const relativeMaxStake = validatorStake.mul(new BN(5))
                const stakeLimit = BN.min(absMaxStake, relativeMaxStake)

                const remainingStake = stakeLimit.sub(validatorStake).sub(delegatedStake)

                const listItem: ValidatorListItem = {
                    nodeID: v.nodeID,
                    validatorStake: validatorStake,
                    delegatedStake: delegatedStake,
                    remainingStake: remainingStake,
                    numDelegators: parseInt(v.delegatorCount) + delegatorsPending.length,
                    startTime: startTime,
                    endTime,
                    uptime: parseFloat(v.uptime),
                    fee: parseFloat(v.delegationFee),
                }
                res.push(listItem)
            }

            res = res.filter((v) => {
                // Remove if remaining space is less than minimum
                const min = state.minStakeDelegation
                if (v.remainingStake.lt(min)) return false
                return true
            })

            return res
        },

        nodeDelegatorPendingMap(state): ValidatorDelegatorPendingDict {
            const res: ValidatorDelegatorPendingDict = {}
            const delegators = state.delegatorsPending
            for (let i = 0; i < delegators.length; i++) {
                const delegator = delegators[i]
                const nodeID = delegator.nodeID
                const target = res[nodeID]

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
            const stakeAmt = validator.validatorStake

            // 5 times the validator's stake
            const relativeMaxStake = stakeAmt.mul(new BN(5))

            // absolute max stake
            const mult = new BN(10).pow(new BN(6 + 9))
            const absMaxStake = new BN(3).mul(mult)

            if (relativeMaxStake.lt(absMaxStake)) {
                return relativeMaxStake
            } else {
                return absMaxStake
            }
        },
    },
}

export default platform_module
