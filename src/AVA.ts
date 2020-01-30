import {UTXO, UTXOSet} from "slopes";
import {UTXODict} from 'store/types';

console.log(process.env.VUE_AVA_IP);
import store from './store';
// @ts-ignore
import * as slopes from "slopes";


let ip = process.env.VUE_AVA_IP || 'localhost';
let port = process.env.VUE_AVA_PORT || '9650';
let protocol = process.env.VUE_AVA_PROTOCOL || 'http';

// @ts-ignore
let bintools = slopes.BinTools.getInstance();
// @ts-ignore
let ava = new slopes.Slopes(ip, parseInt(port), protocol, 12345);

// @ts-ignore
let avm = ava.AVM();
let keyChain = avm.keyChain();



function getAllUTXOsForAsset(assetId: string){
    let set = new UTXOSet();
    let utxos:UTXODict = store.state.utxos;

    for(var i=0; i<utxos.length;i++){
        let utxo = utxos[i];
        let aId = bintools.avaSerialize(utxo.getAssetID());
        if(aId===assetId){
            set.add(utxo);
        }
    }

    return set;
}




export { avm, bintools, keyChain, getAllUTXOsForAsset };
