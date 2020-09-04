import {Avalanche} from "avalanche/dist";
const BN = require('bn.js');

import {getPreferredHRP} from "avalanche/dist/utils";
import {ava, bintools} from "../../src/AVA";
import {AVMKeyChain} from "avalanche/dist/apis/avm";
// import {Buffer} from 'avalanche';
import * as bip39 from 'bip39';
import HDKey from 'hdkey';



const AVAX_IP = 'localhost';
const AVAX_PORT = 9650;
const AVAX_PROTOCOL = 'http';
const NETWORK_ID = 12345;

const FAUCET_KEY = "PrivateKey-ewoqjP7PxY4yr3iLTpLisriqt94hdyDFNgchSxGGztUrTXtNN";

const ZERO = new BN(0);

let avalanche = new Avalanche(AVAX_IP, AVAX_PORT, AVAX_PROTOCOL, NETWORK_ID, 'X')
let xChain = avalanche.XChain();
    xChain.setFee(new BN('1000000'))
let nodeKeys = avalanche.NodeKeys();


// init user on local gecko for test purposes
let geckoUsername = 'root';
let geckoPass = 'bababak1234!hadiama';

// Create user in gecko node
try {
    nodeKeys.createUser(geckoUsername, geckoPass);
    console.log("Created keystore user.")
}catch (e) {

}

const HRP = getPreferredHRP(NETWORK_ID);

let faucetKeychain = new AVMKeyChain(HRP,'X');
let faucetKey = faucetKeychain.importKey(FAUCET_KEY);
let faucetAddress = faucetKey.getAddressString()
xChain.importKey(geckoUsername, geckoPass, faucetKey.getPrivateKeyString()).then(async (res) => {
    let bal = await xChain.getAllBalances(faucetAddress);
});


const AVA_CHANGE_PATH = `m/44'/9000'/0'/0`;

const TEST_MNEMONIC = bip39.generateMnemonic(256);
const seed = bip39.mnemonicToSeedSync(TEST_MNEMONIC);
let HD = HDKey.fromMasterSeed(seed);

let key0 = HD.derive(AVA_CHANGE_PATH+'/0') ;
let pk = key0.privateKey as Buffer;

let userKeychain = new AVMKeyChain(HRP,'X');
let userKey0 = userKeychain.importKey(pk);


async function sendAvax(address:string, amount:number){
    let utxoSet = await xChain.getUTXOs([faucetAddress])
    let assetId = await xChain.getAVAXAssetID();

    let sendAmount = new BN(amount);
    let unsigned_tx =  await xChain.buildBaseTx(utxoSet, sendAmount, assetId,[address], [faucetAddress], [faucetAddress] );
    let signed_tx = unsigned_tx.sign(faucetKeychain);

    await xChain.issueTx(signed_tx)
}


async function createFixedCapAsset(name: string, symbol: string, address: string, amount: number, denomination: number = 2){

    let holders = [{
        "address": address,
        "amount": amount
    }]

    await xChain.createFixedCapAsset(geckoUsername,geckoPass,name,symbol,denomination,holders)
}

export {
    userKey0,
    userKeychain,
    faucetKeychain,
    ZERO,
    xChain,
    faucetAddress,
    TEST_MNEMONIC,
    sendAvax,
    createFixedCapAsset
}
