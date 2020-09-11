
import store from '@/store/index';
import {ava} from "@/AVA";

import {
    AVMConstants,
    AVMKeyChain,
    AVMKeyPair
} from "avalanche/dist/apis/avm";

import {
    getPreferredHRP
} from "avalanche/dist/utils";
import {BN} from "avalanche/dist";
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

function calculateStakingReward(amount: BN, duration: number, currentSupply: BN){
    // PlatformVMConstants.
}


export {getAssetIcon, keyToKeypair};
