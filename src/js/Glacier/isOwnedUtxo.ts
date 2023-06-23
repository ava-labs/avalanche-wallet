import { Utxo, PChainUtxo } from '@avalabs/glacier-sdk'

/**
 * Check if the UTXO is owned by one of the given addresses
 * @param utxo
 * @param ownedAddresses
 */
export function isOwnedUTXO(utxo: Utxo | PChainUtxo, ownedAddresses: string[]) {
    // Strip chain id
    ownedAddresses = ownedAddresses.map((addr) => {
        return addr.split('-')[1] ?? addr
    })

    return (
        utxo.addresses.filter((addr) => {
            return ownedAddresses.includes(addr)
        }).length > 0
    )
}
