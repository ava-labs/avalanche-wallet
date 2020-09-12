import Avalanche from "avalanche/dist";
import BinTools from "avalanche/dist/utils/bintools";
import {AVMAPI, KeyChain as AVMKeyChain, MinterSet, UTXOSet, UnsignedTx, Tx} from "avalanche/dist/apis/avm";
import {UnixNow, UTF8Payload, URLPayload} from "avalanche/dist/utils";
import {OutputOwners} from "avalanche/dist/common";

import { Buffer } from 'buffer/';
import BN from "bn.js";

const ip: string = "localhost"
const port: number = 9650
const protocol: string = "http"
const networkID: number = 12345
const avalanche: Avalanche = new Avalanche(ip, port, protocol, networkID, 'X')
const avm: AVMAPI = avalanche.XChain()
const bintools: BinTools = BinTools.getInstance()
const myKeychain: AVMKeyChain = avm.keyChain();
let faucetKey = myKeychain.importKey("PrivateKey-ewoqjP7PxY4yr3iLTpLisriqt94hdyDFNgchSxGGztUrTXtNN")


// Create NFTs from the faucet private key

async function createNFT(name: string, symbol: string, addresses: Buffer[], creatorAddresses: string[]): Promise<string>{
    console.log("Creating NFT Asset...")
    const minterSet: MinterSet = new MinterSet(1, addresses)
    const minterSets: MinterSet[] = [minterSet]

    let utxoSet: UTXOSet = await avm.getUTXOs(addresses)
    // let utxoids: string[] = utxoSet.getUTXOIDs()
    // let locktime = new BN(0);
    // const fee: BN = new BN(0);

    console.log(utxoSet.getAssetIDs());

    let unsignedTx: UnsignedTx = await avm.buildCreateNFTAssetTx(
        utxoSet,
        creatorAddresses,
        minterSets,
        name,
        symbol,
    )
    let tx: Tx = unsignedTx.sign(myKeychain);
    // let tx: Tx =  avm.keyChain().signTx(unsignedTx)
    // console.log(tx.toBuffer().toString('hex'))
    let txid: string = await avm.issueTx(tx)
    console.log(`Create NFT Asset Success: ${txid}`)
    return txid;
}


async function mintNFT(txid: string, addresses: Buffer[], addressStrings: string[], payload:any): Promise<string>{
    console.log(`Creating NFT Mint Operation #1...`)
    let utxoSet = await avm.getUTXOs(addresses);
    let utxoids = utxoSet.getUTXOIDs();
    let result: string = "";

    console.log(utxoids);
    console.log(txid);

    // scan utxos and find the nft one
    for (let index: number = 0; index < utxoids.length; ++index) {
        let value = utxoids[index];
        if (value.substring(0, 10) === txid.substring(0, 10)) {
            result = value
            break
        }
    }

    const groupID: number = 0
    // let locktime = new BN(0);
    // let threshold = 1;
    // const fee: BN = new BN(0)

    // let outputOwners:Array<OutputOwners> = []
    // outputOwners.push(new OutputOwners(addresses, locktime, threshold))

    console.log(utxoids)
    console.log(result);
    console.log('Result:', result);



    let unsignedTx = await avm.buildCreateNFTMintTx(
        utxoSet,
        addressStrings,
        addressStrings,
        result,
        // fee,
        groupID,
        payload.toBuffer(),
        // undefined,
        // // addressStrings,
        // UnixNow(),
        // locktime,
        // threshold,
    )

    let tx = unsignedTx.sign(avm.keyChain());
    // let tx =  avm.keyChain().signTx(unsignedTx)
    // console.log(tx.toBuffer().toString('hex'))
    let mintTxid:string = await avm.issueTx(tx)
    console.log(`NFT Mint Operation Success #1: ${mintTxid}`)
    return mintTxid;
}


async function transferNFT(utxoId: string, toAddresses: string[]): Promise<string>{
    let fee = new BN(0);
    let locktime = new BN(0);
    let threshold = 1;

    let fromAddrs = myKeychain.getAddresses();
    let fromAddrsStr = myKeychain.getAddressStrings();
    let utxos = await avm.getUTXOs(fromAddrs);
    let utxoids = utxos.getUTXOIDs();

    console.log(`Utxo ids: `,utxoids);
    let sourceTxId: string = "";

    for (let index: number = 0; index < utxoids.length; ++index) {
        let value = utxoids[index];
        if (value.substring(0, 10) === utxoId.substring(0, 10)) {
            sourceTxId = value
            break
        }
    }

    console.log("Source tx: ",sourceTxId);


    let unsignedTx = await avm.buildNFTTransferTx(
        utxos,
        toAddresses,
        fromAddrsStr,
        fromAddrsStr,
        sourceTxId,
        // fee,
        // fromAddrsStr,
        // UnixNow(),
        // locktime,
        // threshold
    )

    let tx = unsignedTx.sign(avm.keyChain());

    // let tx =  avm.keyChain().signTx(unsignedTx)
    let txid = await avm.issueTx(tx)
    console.log(`NFT Transfer Operation Success: ${txid}`)
    return txid;
}

// the goods
const getNFT = async (name: string, symbol: string, recevieAddr: string, type: 'utf8'|'url'): Promise<any> => {
    // Using faucet addresses
    const addresses: Buffer[] = myKeychain.getAddresses()
    const addressStrings: string[] = myKeychain.getAddressStrings()

    let txId = await createNFT(name, symbol, addresses, addressStrings);

    setTimeout(async () =>{
        // Minting the NFT

        let payload;
        if(type === 'utf8'){
            payload = new UTF8Payload(`Test test`)
        }else{
            payload = new URLPayload('https://upload.wikimedia.org/wikipedia/commons/f/f7/Bananas.svg')
        }

        let mintTxId = await mintNFT(txId, addresses, addressStrings, payload)

        setTimeout(async () => {
            let nftTo = [recevieAddr];
            await transferNFT( mintTxId, nftTo)
        }, 2000);

    }, 2000);
}




export {
    getNFT
}
