import { isUtxo, UtxoType } from '@/js/Glacier/models'
import { UtxoCsvRow } from '@/js/CSV/models'
import { isOwnedUTXO } from '@/js/Glacier/isOwnedUtxo'

/**
 * Return data needed for a CSV row given a UTXO object from Glacier
 * @param utxo
 * @param ownedAddresses
 */
export function createUtxoCsvData(
    utxo: UtxoType,
    ownedAddresses: string[]
): {
    amount: string
    assetID: string
    isOwner: boolean
    threshold: number
    chain: string
    owners: string[]
    locktime: number
} {
    const isOwned = isOwnedUTXO(utxo, ownedAddresses)
    if (isUtxo(utxo)) {
        return {
            amount: utxo.asset.amount,
            assetID: utxo.asset.assetId,
            isOwner: isOwned,
            threshold: utxo.threshold,
            chain: utxo.createdOnChainId,
            owners: utxo.addresses,
            locktime: utxo.locktime,
        }
    } else {
        return {
            amount: utxo.amount,
            assetID: utxo.assetId,
            isOwner: isOwned,
            threshold: 1, //TODO: Fix when this is available on the data
            chain: utxo.createdOnChainId,
            owners: utxo.addresses,
            locktime: 0, //TODO: Fix when this is available on the data
        }
    }
}
