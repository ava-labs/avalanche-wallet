import { TokenList } from '@/store/modules/assets/types'

function mapTokenInfo(token: any) {
    return { ...token, logoURI: token.logoUri }
}

/**
 * Fetch erc20 token information from glacier
 */
export async function fetchTokenList(): Promise<TokenList> {
    const res = await fetch(
        'https://glacier-api.avax.network/proxy/chain-assets/main/_lists/core-wallet/token-list.erc20.json'
    )
    const json = await res.json()

    const tokensMainnet = json[43114].tokens.map(mapTokenInfo)
    const tokensTestnet = json[43113].tokens.map(mapTokenInfo)

    return {
        name: 'Avalanche (C-Chain)',
        logoURI:
            'https://glacier-api.avax.network/proxy/chain-assets/3e1b653/chains/43113/token-logo.png',
        keywords: [],
        timestamp: '',
        url: '',
        readonly: true,
        version: {
            major: 1,
            minor: 0,
            patch: 0,
        },
        tokens: [...tokensMainnet, ...tokensTestnet],
    }
}
