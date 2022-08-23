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
    chainID: string,
    endTime?: string
): Promise<ITransactionData[]> {
    const ADDR_SIZE = 1024
    let selection = addrs.slice(0, ADDR_SIZE)
    let remaining = addrs.slice(ADDR_SIZE)

    let addrsRaw = selection.map((addr) => {
        return addr.split('-')[1]
    })

    let rootUrl = 'v2/transactions'

    let req = {
        address: addrsRaw,
        sort: ['timestamp-desc'],
        disableCount: ['1'],
        chainID: [chainID],
        disableGenesis: ['false'],
    }

    if (limit > 0) {
        //@ts-ignore
        req.limit = [limit.toString()]
    }

    if (endTime) {
        console.log('Setting endtime')
        //@ts-ignore
        req.endTime = [endTime]
    }

    let res = await explorer_api.post(rootUrl, req)
    let txs = res.data.transactions
    let next: string | undefined = res.data.next

    if (txs === null) txs = []

    // If we need to fetch more for this address
    if (next && !limit) {
        let endTime = next.split('&')[0].split('=')[1]
        let nextRes = await getAddressHistory(selection, limit, chainID, endTime)
        txs.push(...nextRes)
    }

    // If there are addresses left, fetch them too
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

    let urlRoot = `/v2/addressChains`

    let res = await explorer_api.post(urlRoot, {
        address: rawAddrs,
        disableCount: ['1'],
    })

    return res.data.addressChains
}
async function getAliasChains() {
    let res = await explorer_api.get('/v2')
    return res.data
}

export {
    explorer_api,
    getAddressHistory,
    getAddressDetailX,
    isAddressUsedX,
    getAddressChains,
    getAliasChains,
}
