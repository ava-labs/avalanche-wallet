import { ava, avm, bintools } from '@/AVA'
import { ITransaction } from '@/components/wallet/transfer/types'
import { BN, Buffer } from 'avalanche'
import {
    AssetAmountDestination,
    BaseTx,
    TransferableInput,
    TransferableOutput,
    UnsignedTx,
    UTXO,
    UTXOSet as AVMUTXOSet,
} from 'avalanche/dist/apis/avm'

import { UTXOSet as PlatformUTXOSet } from 'avalanche/dist/apis/platformvm'

export async function buildUnsignedTransaction(
    orders: (ITransaction | UTXO)[],
    addr: string,
    derivedAddresses: string[],
    utxoset: AVMUTXOSet,
    changeAddress?: string,
    memo?: Buffer
) {
    // TODO: Get new change index.
    if (!changeAddress) {
        throw 'Unable to issue transaction. Ran out of change index.'
    }

    let fromAddrsStr: string[] = derivedAddresses
    let fromAddrs: Buffer[] = fromAddrsStr.map((val) => bintools.parseAddress(val, 'X'))
    let changeAddr: Buffer = bintools.stringToAddress(changeAddress)

    // TODO: use internal asset ID
    // This does not update on network change, causing issues
    const AVAX_ID_BUF = await avm.getAVAXAssetID()
    const AVAX_ID_STR = AVAX_ID_BUF.toString('hex')
    const TO_BUF = bintools.stringToAddress(addr)

    const aad: AssetAmountDestination = new AssetAmountDestination([TO_BUF], fromAddrs, [
        changeAddr,
    ])
    const ZERO = new BN(0)
    let isFeeAdded = false

    // Aggregate Fungible ins & outs
    for (let i: number = 0; i < orders.length; i++) {
        let order: ITransaction | UTXO = orders[i]

        if ((order as ITransaction).asset) {
            // if fungible
            let tx: ITransaction = order as ITransaction

            let assetId = bintools.cb58Decode(tx.asset.id)
            let amt: BN = tx.amount

            if (assetId.toString('hex') === AVAX_ID_STR) {
                aad.addAssetAmount(assetId, amt, avm.getTxFee())
                isFeeAdded = true
            } else {
                aad.addAssetAmount(assetId, amt, ZERO)
            }
        }
    }

    // If fee isn't added, add it
    if (!isFeeAdded) {
        if (avm.getTxFee().gt(ZERO)) {
            aad.addAssetAmount(AVAX_ID_BUF, ZERO, avm.getTxFee())
        }
    }

    const success: Error = utxoset.getMinimumSpendable(aad)

    let ins: TransferableInput[] = []
    let outs: TransferableOutput[] = []
    if (typeof success === 'undefined') {
        ins = aad.getInputs()
        outs = aad.getAllOutputs()
    } else {
        throw success
    }

    //@ts-ignore
    let nftUtxos: UTXO[] = orders.filter((val) => {
        if ((val as ITransaction).asset) return false
        return true
    })

    // If transferring an NFT, build the transaction on top of an NFT tx
    let unsignedTx: UnsignedTx
    let networkId: number = ava.getNetworkID()
    let chainId: Buffer = bintools.cb58Decode(avm.getBlockchainID())

    if (nftUtxos.length > 0) {
        let nftSet = new AVMUTXOSet()
        nftSet.addArray(nftUtxos)

        let utxoIds: string[] = nftSet.getUTXOIDs()

        // Sort nft utxos
        utxoIds.sort((a, b) => {
            if (a < b) {
                return -1
            } else if (a > b) {
                return 1
            }
            return 0
        })

        unsignedTx = nftSet.buildNFTTransferTx(
            networkId,
            chainId,
            [TO_BUF],
            fromAddrs,
            fromAddrs, // change address should be something else?
            utxoIds,
            undefined,
            undefined,
            memo
        )

        let rawTx = unsignedTx.getTransaction()
        let outsNft = rawTx.getOuts()
        let insNft = rawTx.getIns()

        // TODO: This is a hackish way of doing this, need methods in avalanche.js
        //@ts-ignore
        rawTx.outs = outsNft.concat(outs)
        //@ts-ignore
        rawTx.ins = insNft.concat(ins)
    } else {
        let baseTx: BaseTx = new BaseTx(networkId, chainId, outs, ins, memo)
        unsignedTx = new UnsignedTx(baseTx)
    }
    return unsignedTx
}
