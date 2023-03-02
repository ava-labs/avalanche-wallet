import { Avalanche, BinTools, BN, Buffer } from '@c4tplatform/caminojs/dist'
import {
    AVMAPI,
    KeyChain,
    MinterSet,
    Tx,
    UnsignedTx,
    UTXOSet,
} from '@c4tplatform/caminojs/dist/apis/avm'
import { GetUTXOsResponse } from '@c4tplatform/caminojs/dist/apis/avm/interfaces'
import { UnixNow } from '@c4tplatform/caminojs/dist/utils'

const ip: string = 'localhost'
const port: number = 9650
const protocol: string = 'http'
const networkID: number = 1002

const avalanche: Avalanche = new Avalanche(ip, port, protocol, networkID)
const bintools: BinTools = BinTools.getInstance()
const privKey: string = `PrivateKey-vmRQiZeXEXYMyJhEiqdC2z5JhuDbxL8ix9UVvjgMu2Er1NepE`
const threshold: number = 1
const locktime: BN = new BN(0)
const asOf: BN = UnixNow()
const memo: Buffer = Buffer.from('AVM utility method buildCreateNFTAssetTx to create an NFT')
const name: string = 'non fungible token TEST'
const symbol: string = 'NTS'

let xchain: AVMAPI
let xKeychain: KeyChain
let xAddresses: Buffer[]
let xAddressStrings: string[]
let avaxAssetID: string
let fee: BN
let xBlockchainID: string
let avaxAssetIDBuf: Buffer

const InitAvalanche = async () => {
    await avalanche.fetchNetworkSettings()
    xchain = avalanche.XChain()
    xKeychain = xchain.keyChain()
    xKeychain.importKey(privKey)
    xAddresses = xchain.keyChain().getAddresses()
    xAddressStrings = xchain.keyChain().getAddressStrings()
    avaxAssetID = avalanche.getNetwork().X.avaxAssetID
    fee = xchain.getDefaultTxFee()
    xBlockchainID = avalanche.getNetwork().X.blockchainID
    avaxAssetIDBuf = bintools.cb58Decode(avaxAssetID)
}

export async function testBuildNFT (): Promise<any> {
    await InitAvalanche()

    const avmUTXOResponse: GetUTXOsResponse = await xchain.getUTXOs(xAddressStrings)
    const utxoSet: UTXOSet = avmUTXOResponse.utxos
    const minterSets: MinterSet[] = [new MinterSet(threshold, xAddresses)]
    const unsignedTx: UnsignedTx = await xchain.buildCreateNFTAssetTx(
        utxoSet,
        xAddressStrings,
        xAddressStrings,
        minterSets,
        name,
        symbol,
        memo,
        asOf,
        locktime
    )

    const tx: Tx = unsignedTx.sign(xKeychain)
    const txid: string = await xchain.issueTx(tx)
    console.log(`Success! TXID: ${txid}`);
    return txid;
}
