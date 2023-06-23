import {
    isCChainExportTransaction,
    isCChainImportTransaction,
    isPChainUtxo,
    isTransactionP,
    isTransactionX,
    TransactionType,
} from '@/js/Glacier/models'
import { BN } from 'avalanche'
import { Utxo, PChainUtxo, UtxoType } from '@avalabs/glacier-sdk'
import AvaAsset from '@/js/AvaAsset'
export function getExportBalances(tx: TransactionType, destinationChainId: string, getAsset: any) {
    const balances: {
        [assetID: string]: {
            id: string
            amount: BN
            decimals: number
            symbol: string
        }
    } = {}

    // For exported utxo, createdOnChainId is source chain, and consumedOnChainId is destination chain.
    let exportedUTXOs: Array<Utxo | PChainUtxo> = []

    if (isTransactionP(tx) || isTransactionX(tx) || isCChainExportTransaction(tx)) {
        const utxosOut: Array<Utxo | PChainUtxo> = tx.emittedUtxos || []
        exportedUTXOs = utxosOut.filter((utxo) => {
            return utxo.consumedOnChainId === destinationChainId
        })
    } else if (isCChainImportTransaction(tx)) {
        exportedUTXOs = tx.evmOutputs.map((out) => {
            return {
                assetId: out.asset.assetId,
                amount: out.asset.amount,
                decimals: out.asset.denomination,
                symbol: out.asset.name,
                utxoId: '',
                addresses: [out.toAddress],
                createdOnChainId: '',
                consumedOnChainId: '',
                staked: false,
                txHash: tx.txHash,
                outputIndex: 0,
                blockTimestamp: 0,
                blockNumber: '0',
                utxoType: UtxoType.TRANSFER,
            } as PChainUtxo
        })
    }

    exportedUTXOs.forEach((utxo) => {
        let assetId, amount, decimals, symbol

        if (isPChainUtxo(utxo)) {
            const asset = getAsset(utxo.assetId) as AvaAsset
            assetId = utxo.assetId
            amount = utxo.amount
            decimals = asset.denomination || 0
            symbol = asset.symbol || utxo.assetId.substr(0, 4)
        } else {
            assetId = utxo.asset.assetId
            amount = utxo.asset.amount
            decimals = utxo.asset.denomination
            symbol = utxo.asset.symbol
        }

        if (balances[assetId]) {
            balances[assetId].amount.iadd(new BN(amount))
        } else {
            balances[assetId] = {
                id: assetId,
                amount: new BN(amount),
                decimals,
                symbol,
            }
        }
    })

    return balances
}
