const axios = require('axios')
const COINGECKO_URL =
    'https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2&vs_currencies=usd'

export async function getAvaxPriceUSD(): Promise<number> {
    let res = await axios.get(COINGECKO_URL)
    return res.data['avalanche-2']['usd']
}
