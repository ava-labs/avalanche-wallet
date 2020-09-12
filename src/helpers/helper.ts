
import store from '@/store/index';
import {ava} from "@/AVA";

import {
    AVMConstants,
    KeyChain as AVMKeyChain,
    KeyPair as AVMKeyPair
} from "avalanche/dist/apis/avm";

import {
    Defaults,
    getPreferredHRP, ONEAVAX
} from "avalanche/dist/utils";
import {BN} from "avalanche/dist";
import Big from 'big.js';

import {PlatformVMConstants} from "avalanche/dist/apis/platformvm";

function getAssetIcon(id:string){
    let url = "/question-solid.svg";
    let AVA = store.getters['Assets/AssetAVA'];

    if(!AVA) return url;
    if(id === AVA.id){
        return  "/ava_letter_icon.png";
    }
    return url;
}


function keyToKeypair(key: string, chainID: string='X'): AVMKeyPair{
    let hrp = getPreferredHRP(ava.getNetworkID());
    let keychain = new AVMKeyChain(hrp, chainID);
    return keychain.importKey(key);
}

function calculateStakingReward(amount: BN, duration: number, currentSupply: BN): BN{
    // PlatformVMConstants.
    let networkID = ava.getNetworkID();

    //@ts-ignore
    let defValues = Defaults.network[networkID];
    // console.log(defValues)

    if(!defValues){
        console.error("Network default values not found.")
        return new BN(0);
    }
    defValues = defValues.P;

    let maxConsumption: number = defValues.maxConsumption;
    let minConsumption: number = defValues.minConsumption;
    let diffConsumption = maxConsumption - minConsumption;
    let maxSupply: BN = defValues.maxSupply;
    let maxStakingDuration: BN = defValues.maxStakingDuration;
    let remainingSupply = maxSupply.sub(currentSupply)

    // console.log("Estimate");
    // console.log(amount.toString(), currentSupply.toString(), duration)
    // console.log(maxConsumption, minConsumption, diffConsumption, maxSupply.toString(), maxStakingDuration.toString())

    let amtBig = Big((amount.div(ONEAVAX)).toString())
    let currentSupplyBig = Big((currentSupply.div(ONEAVAX)).toString())
    let remainingSupplyBig = Big((remainingSupply.div(ONEAVAX)).toString())
    let portionOfExistingSupplyBig = amtBig.div(currentSupplyBig);


    // let portionOfExistingSupply = amount.div(currentSupply);
    let portionOfStakingDuration = duration / maxStakingDuration.toNumber();
    let mintingRate = minConsumption + (diffConsumption * portionOfStakingDuration);

    // console.log('Bigs: ',amtBig.toString(), currentSupplyBig.toString(), portionOfExistingSupplyBig.toString());
    // console.log(remainingSupply.toString(), portionOfExistingSupply.toString(), portionOfStakingDuration, mintingRate)

    let rewardBig: Big = remainingSupplyBig.times(portionOfExistingSupplyBig);
        rewardBig = rewardBig.times(Big(mintingRate*portionOfStakingDuration));

    let rewardStr = rewardBig.times(Math.pow(10,9)).toFixed(0);
    let rewardBN = new BN(rewardStr);


    // console.log("Reward: ",rewardBig.toString());
    return rewardBN;

    // let reward = remainingSupply.mul(portionOfExistingSupply)
    //     reward = reward.mul(new BN(mintingRate * portionOfStakingDuration));
    // return reward
}


export {getAssetIcon, keyToKeypair, calculateStakingReward};
