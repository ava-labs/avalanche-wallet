import { WalletType } from '@/js/wallets/types'
import { getTransactionsForAddresses } from '@/js/Glacier/getTransactionsForAddresses'
import { BlockchainId, Network, SortOrder } from '@avalabs/glacier-sdk'
import { filterDuplicateGlacierTxs } from '@/js/Glacier/filterDuplicateGlacierTxs'
import { sortGlacierTxs } from '@/js/Glacier/sortGlacierTxs'

const PAGE_SIZE = 100
const SORT = SortOrder.DESC

export async function getGlacierHistory(
    wallet: WalletType,
    networkId: number,
    isMainnet: boolean,
    limit?: number
) {
    // Reverse the list so we get history for the most recent address first
    const xInternal = wallet.getAllChangeAddressesX()
    const xExternal = wallet.getAllExternalAddressesX()
    const avmAddrs = []
    // Combine X addresses and reverse ordering so most recent is first
    while (xInternal.length || xExternal.length) {
        const internal = xInternal.pop()
        const external = xExternal.pop()
        internal && avmAddrs.push(internal)
        external && avmAddrs.push(external)
    }

    const pvmAddrs: string[] = wallet.getAllAddressesP().reverse()

    // this shouldn't ever happen, but to avoid getting every transaction...
    if (avmAddrs.length === 0) {
        return []
    }

    const txsGlacierX = await getTransactionsForAddresses(
        {
            addresses: avmAddrs,
            blockchainId: BlockchainId.X_CHAIN,
            network: isMainnet ? Network.MAINNET : Network.FUJI,
            pageSize: PAGE_SIZE,
            sortOrder: SORT,
        },
        limit
    )

    const txsGlacierP = await getTransactionsForAddresses(
        {
            addresses: pvmAddrs,
            blockchainId: BlockchainId.P_CHAIN,
            network: isMainnet ? Network.MAINNET : Network.FUJI,
            pageSize: PAGE_SIZE,
            sortOrder: SORT,
        },
        limit
    )

    const externalAddrs = xExternal.length > pvmAddrs.length ? xExternal.reverse() : pvmAddrs

    const txsGlacierC = await getTransactionsForAddresses(
        {
            addresses: [wallet.getEvmAddressBech(), ...externalAddrs],
            blockchainId: BlockchainId.C_CHAIN,
            network: isMainnet ? Network.MAINNET : Network.FUJI,
            pageSize: PAGE_SIZE,
            sortOrder: SORT,
        },
        limit
    )

    // Join X and P chain transactions
    const joined = [...txsGlacierX, ...txsGlacierP, ...txsGlacierC]
    // Filter duplicates
    const filtered = filterDuplicateGlacierTxs(joined)
    // Sort by date
    const sorted = sortGlacierTxs(filtered)

    // Trimmed
    const trimmed = sorted.slice(0, limit)

    return trimmed
}
