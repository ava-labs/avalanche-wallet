import { ava, avm, bintools, cChain, pChain } from '@/AVA'
import { ITransaction } from '@/components/wallet/transfer/types'
import { BN, Buffer } from 'avalanche'
import {
    AssetAmountDestination,
    BaseTx,
    MinterSet,
    NFTMintOutput,
    TransferableInput,
    TransferableOutput,
    UnsignedTx as AVMUnsignedTx,
    UTXO as AVMUTXO,
    UTXOSet,
    UTXOSet as AVMUTXOSet,
    AVMConstants,
} from 'avalanche/dist/apis/avm'

import { PayloadBase } from 'avalanche/dist/utils'
import { OutputOwners } from 'avalanche/dist/common'
import {
    UTXOSet as PlatformUTXOSet,
    UnsignedTx as PlatformUnsignedTx,
    PlatformVMConstants,
} from 'avalanche/dist/apis/platformvm'

import { UnsignedTx as EVMUnsignedTx } from 'avalanche/dist/apis/evm'
import { ChainIdType } from '@/constants'

import { web3 } from '@/evm'

export async function buildUnsignedTransaction(
    orders: (ITransaction | AVMUTXO)[],
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
        let order: ITransaction | AVMUTXO = orders[i]

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
    let unsignedTx: AVMUnsignedTx
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
        unsignedTx = new AVMUnsignedTx(baseTx)
    }
    return unsignedTx
}

export async function buildCreateNftFamilyTx(
    name: string,
    symbol: string,
    groupNum: number,
    fromAddrs: string[],
    minterAddr: string,
    changeAddr: string,
    utxoSet: UTXOSet
) {
    let fromAddresses = fromAddrs
    let changeAddress = changeAddr
    let minterAddress = minterAddr

    const minterSets: MinterSet[] = []

    // Create the groups
    for (var i = 0; i < groupNum; i++) {
        const minterSet: MinterSet = new MinterSet(1, [minterAddress])
        minterSets.push(minterSet)
    }

    let unsignedTx: AVMUnsignedTx = await avm.buildCreateNFTAssetTx(
        utxoSet,
        fromAddresses,
        [changeAddress],
        minterSets,
        name,
        symbol
    )
    return unsignedTx
}

export async function buildMintNftTx(
    mintUtxo: AVMUTXO,
    payload: PayloadBase,
    quantity: number,
    ownerAddress: string,
    changeAddress: string,
    fromAddresses: string[],
    utxoSet: UTXOSet
): Promise<AVMUnsignedTx> {
    let addrBuf = bintools.parseAddress(ownerAddress, 'X')
    let owners = []

    let sourceAddresses = fromAddresses

    for (var i = 0; i < quantity; i++) {
        let owner = new OutputOwners([addrBuf])
        owners.push(owner)
    }

    let groupID = (mintUtxo.getOutput() as NFTMintOutput).getGroupID()

    let mintTx = await avm.buildCreateNFTMintTx(
        utxoSet,
        owners,
        sourceAddresses,
        [changeAddress],
        mintUtxo.getUTXOID(),
        groupID,
        payload
    )
    return mintTx
}
export async function buildExportTransaction(
    sourceChain: ChainIdType,
    destinationChain: ChainIdType,
    utxoSet: AVMUTXOSet | PlatformUTXOSet,
    fromAddresses: string[],
    toAddress: string,
    amount: BN, // export amount + fee
    sourceChangeAddress: string,
    evmBechAddress?: string // Used ONLY for c chain exports
): Promise<AVMUnsignedTx | PlatformUnsignedTx | EVMUnsignedTx> {
    let destinationChainId
    switch (destinationChain) {
        case 'X':
            destinationChainId = avm.getBlockchainID()
            break
        case 'P':
            destinationChainId = pChain.getBlockchainID()
            break
        case 'C':
            destinationChainId = cChain.getBlockchainID()
            break
    }
    if (sourceChain === 'X') {
        return await avm.buildExportTx(
            utxoSet as AVMUTXOSet,
            amount,
            destinationChainId,
            [toAddress],
            fromAddresses,
            [sourceChangeAddress]
        )
    } else if (sourceChain === 'P') {
        return await pChain.buildExportTx(
            utxoSet as PlatformUTXOSet,
            amount,
            destinationChainId,
            [toAddress],
            fromAddresses,
            [sourceChangeAddress]
        )
    } else if (sourceChain === 'C') {
        const txcount = await web3.eth.getTransactionCount(fromAddresses[0])
        const nonce: number = txcount
        const avaxAssetIDBuf: Buffer = await avm.getAVAXAssetID()
        const avaxAssetIDStr: string = bintools.cb58Encode(avaxAssetIDBuf)

        let fromAddressHex = fromAddresses[0]
        let fromAddressBech = evmBechAddress!

        return await cChain.buildExportTx(
            amount,
            avaxAssetIDStr,
            destinationChainId,
            fromAddressHex,
            fromAddressBech,
            [toAddress],
            nonce
        )
    }
    throw 'Invalid source chain.'
}

export enum AvmTxNameEnum {
    'Transaction' = AVMConstants.BASETX,
    'Mint' = AVMConstants.CREATEASSETTX,
    'Operation' = AVMConstants.OPERATIONTX,
    'Import' = AVMConstants.IMPORTTX,
    'Export' = AVMConstants.EXPORTTX,
}

export enum PlatfromTxNameEnum {
    'Transaction' = PlatformVMConstants.BASETX,
    'Add Validator' = PlatformVMConstants.ADDVALIDATORTX,
    'Add Delegator' = PlatformVMConstants.ADDDELEGATORTX,
    'Import' = PlatformVMConstants.IMPORTTX,
    'Export' = PlatformVMConstants.EXPORTTX,
    'Add Subnet Validator' = PlatformVMConstants.ADDSUBNETVALIDATORTX,
    'Create Chain' = PlatformVMConstants.CREATECHAINTX,
    'Create Subnet' = PlatformVMConstants.CREATESUBNETTX,
    'Advance Time' = PlatformVMConstants.ADVANCETIMETX,
    'Reward Validator' = PlatformVMConstants.REWARDVALIDATORTX,
}

// TODO: create asset transactions
export enum ParseableAvmTxEnum {
    'Transaction' = AVMConstants.BASETX,
    'Import' = AVMConstants.IMPORTTX,
    'Export' = AVMConstants.EXPORTTX,
}

export enum ParseablePlatformEnum {
    'Transaction' = PlatformVMConstants.BASETX,
    'Add Validator' = PlatformVMConstants.ADDVALIDATORTX,
    'Add Delegator' = PlatformVMConstants.ADDDELEGATORTX,
    'Import' = PlatformVMConstants.IMPORTTX,
    'Export' = PlatformVMConstants.EXPORTTX,
}
