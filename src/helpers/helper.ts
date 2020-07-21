
import store from '@/store/index';
import {AVMKeyChain, AVMKeyPair} from "avalanche";

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
    let keychain = new AVMKeyChain(chainID);
    let addr = keychain.importKey(key);
    return keychain.getKey(addr);
}


export {getAssetIcon, keyToKeypair};
