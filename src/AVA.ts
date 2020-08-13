import {Avalanche, AVM, AVMKeyChain, BinTools} from "avalanche";

// Connect to TestNet by default
// Doesn't really matter how we initialize, it will get changed by the network module later
let ip: string = "bootstrap.ava.network";
let port: number = 21000;
let protocol: string = "https";
let network_id: number = 2;
let chain_id: string = "X";
let bintools: BinTools = BinTools.getInstance();
let ava: Avalanche = new Avalanche(ip, port, protocol, network_id, chain_id);
let avm: AVM = ava.XChain();
let keyChain: AVMKeyChain = avm.keyChain();

function isValidAddress(addr:string){
    try{
        let res = bintools.stringToAddress(addr);
        return true;
    }catch(err){
        return false;
    }
}

export { ava, avm, bintools, isValidAddress, keyChain};
