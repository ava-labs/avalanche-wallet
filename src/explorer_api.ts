import axios, { AxiosInstance } from 'axios'
import { ITransactionData } from './store/modules/history/types'

// Doesn't really matter what we set, it will change
const api_url: string = 'localhost'
const explorer_api: AxiosInstance = axios.create({
    baseURL: api_url,
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
    },
})

async function getAddressHistory(
    addrs: string[],
    limit = 20,
    chainID: string
): Promise<ITransactionData[]> {
    const ADDR_SIZE = 1024
    let selection = addrs.slice(0, ADDR_SIZE)
    let remaining = addrs.slice(ADDR_SIZE)

    let addrsRaw = selection.map((addr) => {
        return addr.split('-')[1]
    })

    // let query = selection.map((val) => {
    //     let raw = val.split('-')[1]
    //     return `address=${raw}`
    // })

    // Get history for all addresses of the active HD wallet
    // let url = `v2/transactions?${query.join(
    //     '&'
    // )}&limit=${limit}&sort=timestamp-desc&disableCount=1&chainID=${chainID}`

    let rootUrl = 'v2/transactions'
    // let res = await explorer_api.get(url)
    let res = await explorer_api.post(rootUrl, {
        address: addrsRaw,
        limit: [limit.toString()],
        sort: ['timestamp-desc'],
        disableCount: ['1'],
        chainID: [chainID],
    })
    let txs = res.data.transactions

    if (txs === null) txs = []

    if (remaining.length > 0) {
        let nextRes = await getAddressHistory(remaining, limit, chainID)
        txs.push(...nextRes)
    }

    return txs
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

async function getAddressChains(addrs: string[]) {
    // Strip the prefix
    let rawAddrs = addrs.map((addr) => {
        return addr.split('-')[1]
    })

    // let cleanAddrs = addrs.map((addr) => {
    //     let clean = 'address=' + addr.split('-')[1]
    //     return clean
    // })

    // let joined = cleanAddrs.join('&')
    // let url = `/v2/addressChains?${joined}&disableCount=1`
    // let res = await explorer_api.get(url)

    let urlRoot = `/v2/addressChains`
    // let query = `${joined}&disableCount=1`

    let res = await explorer_api.post(urlRoot, {
        address: rawAddrs,
        disableCount: ['1'],
    })
    // console.log(urlRoot, query)
    console.log(res)

    return res.data.addressChains
}

export { explorer_api, getAddressHistory, getAddressDetailX, isAddressUsedX, getAddressChains }
