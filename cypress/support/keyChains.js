import {Avalanche} from "avalanche/dist";
const BN = require('bn.js');

import {getPreferredHRP} from "avalanche/dist/utils";
import {bintools} from "../../src/AVA";
import {AVMKeyChain} from "avalanche/dist/apis/avm";



const AVAX_IP = 'localhost';
const AVAX_PORT = '9650';
const AVAX_PROTOCOL = 'http';
const NETWORK_ID = 12345;

const FAUCET_KEY = "PrivateKey-ewoqjP7PxY4yr3iLTpLisriqt94hdyDFNgchSxGGztUrTXtNN";
const USER_KEY0 = "PrivateKey-4KsTvehZjr5VKMz9cq9pZQj7i12T8dqW4oz9ZwsTZBujLuYtn";

const ZERO = new BN(0);

let avalanche = new Avalanche(AVAX_IP, AVAX_PORT, AVAX_PROTOCOL, NETWORK_ID, 'X')
let xChain = avalanche.XChain();


const HRP = getPreferredHRP(NETWORK_ID);

let faucetKeychain = new AVMKeyChain(HRP,'X');
let faucetKey = faucetKeychain.importKey(FAUCET_KEY);
let faucetAddress = faucetKey.getAddressString()


let userKeychain = new AVMKeyChain(HRP,'X');
let userKey0 = userKeychain.importKey(USER_KEY0);



const TEST_MNEMONIC = "lamp horror speak web science kingdom gospel switch exile flash copper file powder stereo fever similar worry silent ecology clap step trick assume genre";

export {
    userKey0,
    userKeychain,
    faucetKeychain,
    ZERO,
    xChain,
    faucetAddress,
    TEST_MNEMONIC
}
