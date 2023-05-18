import { ChainIdType } from '@/constants'

const mainnetBase = 'https://subnets.avax.network/'
const fujiBase = 'https://subnets-test.avax.network/'

const avascanMainnet = `https://avascan.info`
const avascanFuji = `https://testnet.avascan.info`
/**
 * Get the URL for the given transaction hash on subnets.avax.network
 * @param txHash
 * @param chain
 * @param isMainnet
 */
export function getTxURL(txHash: string, chain: ChainIdType, isMainnet: boolean) {
    // For C chain use avascan
    //TODO: Switch to glacier when ready
    if (chain === 'C') {
        const base = isMainnet ? avascanMainnet : avascanFuji
        return base + `/blockchain/c/tx/${txHash}`
    }

    const base = isMainnet ? mainnetBase : fujiBase
    const chainPath = chain.toLowerCase() + '-chain'
    return `${base}${chainPath}/tx/${txHash}`
}
