import axios, { AxiosInstance } from 'axios'

// Same for every network
const P_CHAIN_ID = '11111111111111111111111111111111LpoYY'

// Doesn't really matter what we set, it will change
const api_url: string = 'localhost'
const explorer_api: AxiosInstance = axios.create({
    baseURL: api_url,
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
    },
})

async function getAddressHistory(addrs: string[], limit = 20, offset = 0) {
    let query = addrs.map((val) => {
        let raw = val.split('-')[1]
        return `address=${raw}`
    })

    // Get history for all addresses of the active HD wallet
    let url = `/x/transactions?${query.join(
        '&'
    )}&limit=${limit}&offset=${offset}&sort=timestamp-desc&disableCount=1`
    let res = await explorer_api.get(url)
    return res.data
}

async function isAddressUsedX(addr: string) {
    let addrRaw = addr.split('-')[1]
    let url = `/x/transactions?address=${addrRaw}&limit=1&disableCount=1`
    try {
        let res = await explorer_api.get(url)
        // console.log(res);
        if (res.data.transactions.length > 0) return true
        else return false
    } catch (e) {
        throw e
    }
}

async function isAddressUsedP(addr: string) {
    let addrRaw = addr.split('-')[1]
    let url = `/x/transactions?chainID=${P_CHAIN_ID}&address=${addrRaw}&limit=1&disableCount=1`
    try {
        let res = await explorer_api.get(url)
        if (res.data.transactions.length > 0) return true
        else return false
    } catch (e) {
        throw e
    }
}

async function getAddressDetailX(addr: string) {
    let addrRaw = addr.split('-')[1]
    let url = `/x/addresses/${addrRaw}`

    try {
        let res = await explorer_api.get(url)
        return res.data
    } catch (e) {
        throw e
    }
}

async function getAddressTransactionsP(addr: string) {
    let addrRaw = addr.split('-')[1]
    let url = `/x/transactions?chainID=${P_CHAIN_ID}&address=${addrRaw}`
    try {
        let res = await explorer_api.get(url)
        return res.data
    } catch (e) {
        throw e
    }
}

async function getAddressChains(addrs: string[]) {
    // Strip the prefix
    let cleanAddrs = addrs.map((addr) => {
        let clean = 'address=' + addr.split('-')[1]
        return clean
    })

    let joined = cleanAddrs.join('&')
    let url = `/x/addressChains?${joined}`
    let res = await explorer_api.get(url)

    return res.data.addressChains
}

export {
    explorer_api,
    getAddressHistory,
    getAddressDetailX,
    getAddressTransactionsP,
    isAddressUsedX,
    isAddressUsedP,
    getAddressChains,
}
