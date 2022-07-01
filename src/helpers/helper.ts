import { ava } from '@/AVA'

import {
    KeyChain as AVMKeyChain,
    KeyPair as AVMKeyPair,
    NFTTransferOutput,
    UTXO,
} from '@c4tplatform/camino/dist/apis/avm'

import { ONEAVAX, PayloadBase, PayloadTypes } from '@c4tplatform/camino/dist/utils'
import Big from 'big.js'

import { Buffer, BN } from '@c4tplatform/camino'
import createHash from 'create-hash'

function bnToBig(val: BN, denomination = 0): Big {
    return new Big(val.toString()).div(Math.pow(10, denomination))
}

function keyToKeypair(key: string, chainID: string = 'X'): AVMKeyPair {
    let hrp = ava.getHRP()
    let keychain = new AVMKeyChain(hrp, chainID)
    return keychain.importKey(key)
}

function calculateStakingReward(amount: BN, duration: number, currentSupply: BN): BN {
    const platform = ava.getNetwork().P

    let maxConsumption: number = platform.maxConsumption
    let minConsumption: number = platform.minConsumption
    let diffConsumption = maxConsumption - minConsumption
    let maxSupply: BN = platform.maxSupply
    let maxStakingDuration: BN = platform.maxStakingDuration
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

export { keyToKeypair, calculateStakingReward, bnToBig, digestMessage, getPayloadFromUTXO }
