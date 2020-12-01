const axios = require('axios')
const COINGECKO_URL =
    'https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2&vs_currencies=usd'

let prices = {
    usd: 0,
}

function updatePrices() {
    axios.get(COINGECKO_URL).then((res) => {
        prices.usd = res.data['avalanche-2'].usd
    })
}

module.exports = {
    prices,
    updatePrices,
}
