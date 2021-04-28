import store from '@/store/index'
import { ava } from '@/AVA'

import {
    KeyChain as AVMKeyChain,
    KeyPair as AVMKeyPair,
    NFTTransferOutput,
    UTXO,
} from 'avalanche/dist/apis/avm'

import { Defaults, getPreferredHRP, ONEAVAX, PayloadBase, PayloadTypes } from 'avalanche/dist/utils'
import { BN } from 'avalanche/dist'
import Big from 'big.js'

import { Buffer } from 'avalanche'
import createHash from 'create-hash'

function getAssetIcon(id: string) {
    let url = '/question-solid.svg'
    let AVA = store.getters['Assets/AssetAVA']

    if (!AVA) return url
    if (id === AVA.id) {
        return '/ava_letter_icon.png'
    }
    return url
}

function bnToBig(val: BN, denomination = 0): Big {
    return new Big(val.toString()).div(Math.pow(10, denomination))
}

function keyToKeypair(key: string, chainID: string = 'X'): AVMKeyPair {
    let hrp = getPreferredHRP(ava.getNetworkID())
    let keychain = new AVMKeyChain(hrp, chainID)
    return keychain.importKey(key)
}

function calculateStakingReward(amount: BN, duration: number, currentSupply: BN): BN {
    let networkID = ava.getNetworkID()

    //@ts-ignore
    let defValues = Defaults.network[networkID]

    if (!defValues) {
        console.error('Network default values not found.')
        return new BN(0)
    }
    defValues = defValues.P

    let maxConsumption: number = defValues.maxConsumption
    let minConsumption: number = defValues.minConsumption
    let diffConsumption = maxConsumption - minConsumption
    let maxSupply: BN = defValues.maxSupply
    let maxStakingDuration: BN = defValues.maxStakingDuration
    let remainingSupply = maxSupply.sub(currentSupply)

    let amtBig = Big(amount.div(ONEAVAX).toString())
    let currentSupplyBig = Big(currentSupply.div(ONEAVAX).toString())
    let remainingSupplyBig = Big(remainingSupply.div(ONEAVAX).toString())
    let portionOfExistingSupplyBig = amtBig.div(currentSupplyBig)

    let portionOfStakingDuration = duration / maxStakingDuration.toNumber()
    let mintingRate = minConsumption + diffConsumption * portionOfStakingDuration

    let rewardBig: Big = remainingSupplyBig.times(portionOfExistingSupplyBig)
    rewardBig = rewardBig.times(Big(mintingRate * portionOfStakingDuration))

    let rewardStr = rewardBig.times(Math.pow(10, 9)).toFixed(0)
    let rewardBN = new BN(rewardStr)

    return rewardBN
}

function digestMessage(msgStr: string) {
    let mBuf = Buffer.from(msgStr, 'utf8')
    let msgSize = Buffer.alloc(4)
    msgSize.writeUInt32BE(mBuf.length, 0)
    let msgBuf = Buffer.from(`\x1AAvalanche Signed Message:\n${msgSize}${msgStr}`, 'utf8')
    return createHash('sha256').update(msgBuf).digest()
}

let payloadtypes = PayloadTypes.getInstance()

function getPayloadFromUTXO(utxo: UTXO): PayloadBase {
    let out = utxo.getOutput() as NFTTransferOutput
    let payload = out.getPayloadBuffer()

    let typeId = payloadtypes.getTypeID(payload)
    let pl: Buffer = payloadtypes.getContent(payload)
    let payloadbase: PayloadBase = payloadtypes.select(typeId, pl)

    return payloadbase
}

export {
    getAssetIcon,
    keyToKeypair,
    calculateStakingReward,
    bnToBig,
    digestMessage,
    getPayloadFromUTXO,
}
