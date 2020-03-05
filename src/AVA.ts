import {UTXO, UTXOSet, CryptoHelpers} from "slopes";
// import {UTXODict} from './store/types';

// console.log(process.env.VUE_AVA_IP);

// @ts-ignore
import * as slopes from "slopes";
// import store from './store';
import assetsStore from './store/modules/assets/assets';

let ip = process.env.VUE_APP_AVA_IP || 'localhost';
let port = process.env.VUE_APP_AVA_PORT || '9650';
let protocol = process.env.VUE_APP_AVA_PROTOCOL || 'http';
let network_id = process.env.VUE_APP_NETWORK_ID || '12345';
let chain_id = process.env.VUE_APP_CHAIN_ID || 'GJABrZ9A6UQFpwjPU8MDxDd8vuyRoDVeDAXc694wJ5t3zEkhU';

// @ts-ignore
let bintools = slopes.BinTools.getInstance();


// console.log(slopes);
let cryptoHelpers = new slopes.CryptoHelpers();
// console.log(cryptoHelpers);

// @ts-ignore
let ava = new slopes.Slopes(ip, parseInt(port), protocol, parseInt(network_id), chain_id);
// @ts-ignore
let avm = ava.AVM();
let keyChain = avm.keyChain();






function isValidAddress(addr:string){
    try{
        let res = bintools.stringToAddress(addr);
        return true;
    }catch(err){
        return false;
    }
}




export { avm, bintools, keyChain, cryptoHelpers, isValidAddress};
