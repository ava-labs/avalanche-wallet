import {UTXO, UTXOSet, CryptoHelpers} from "avalanche";
// import {UTXODict} from './store/types';

// console.log(process.env.VUE_AVA_IP);

// @ts-ignore
import * as avalanche from "avalanche";
// import store from './store';
// import assetsStore from './store/modules/assets/assets';
// import {NetworkItem} from "@/store/modules/network/types";


// let ip = process.env.VUE_APP_AVA_IP || 'localhost';
// let port = process.env.VUE_APP_AVA_PORT || '9650';
// let protocol = process.env.VUE_APP_AVA_PROTOCOL || 'http';
// let network_id = process.env.VUE_APP_NETWORK_ID || '12345';
// let chain_id = process.env.VUE_APP_CHAIN_ID || 'GJABrZ9A6UQFpwjPU8MDxDd8vuyRoDVeDAXc694wJ5t3zEkhU';

// Connect to TestNet by default
// Doesn't really matter how we initialize, it will get changed by the network module later
let ip = "bootstrap.ava.network";
let port = 21000;
let protocol = "https";
let network_id = 2;
let chain_id = "X";

// @ts-ignore
let bintools = avalanche.BinTools.getInstance();


// console.log(slopes);
let cryptoHelpers = new avalanche.CryptoHelpers();
// console.log(cryptoHelpers);

// @ts-ignore
let ava = new avalanche.Avalanche(ip, parseInt(port), protocol, parseInt(network_id), chain_id);
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




export { ava, avm, bintools, keyChain, cryptoHelpers, isValidAddress};
