import {UTXO, UTXOSet} from "slopes";
// import {UTXODict} from './store/types';

console.log(process.env.VUE_AVA_IP);
import store from './store';

// @ts-ignore
import * as slopes from "slopes";

// console.log(process.env);

let ip = process.env.VUE_APP_AVA_IP || 'localhost';
let port = process.env.VUE_APP_AVA_PORT || '9650';
let protocol = process.env.VUE_APP_AVA_PROTOCOL || 'http';
let network_id = process.env.VUE_APP_NETWORK_ID || '12345';
let chain_id = process.env.VUE_APP_CHAIN_ID || '2PfbSxTqpTGFF2xCX2YgrW6ncrksfmEhcNXGv9rE9CgTRqT4hM';

// @ts-ignore
let bintools = slopes.BinTools.getInstance();
// @ts-ignore
let ava = new slopes.Slopes(ip, parseInt(port), protocol, parseInt(network_id), chain_id);

// @ts-ignore
let avm = ava.AVM();
let keyChain = avm.keyChain();



function getAllUTXOsForAsset(assetId: string){
    let set = new UTXOSet();
    let utxos = store.state.utxos;

    for(var i in utxos){
        let utxo = utxos[i];
        let aId = bintools.avaSerialize(utxo.getAssetID());
        if(aId===assetId){
            set.add(utxo);
        }
    }
    // for(var i=0; i < utxos.length; i++){
    //     let utxo = utxos[i];
    //     let aId = bintools.avaSerialize(utxo.getAssetID());
    //     if(aId===assetId){
    //         set.add(utxo);
    //     }
    // }

    return set;
}




export { avm, bintools, keyChain, getAllUTXOsForAsset };
