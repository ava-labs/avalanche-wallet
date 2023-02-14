import axios, { AxiosInstance } from 'axios'

// Doesn't really matter what we set, it will change
const api_url: string = 'localhost'
const signavault_api: AxiosInstance = axios.create({
    baseURL: api_url,
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
    },
})

interface MultisigTx {
    id: number
    alias: string
    threshold: number
    signers: Signer[]
    transactionId: string
    unsignedTx: string
}

interface Signer {
    address: string
    signature: string
}

async function getAllMultisigTransactions(ownerAddress: string): Promise<MultisigTx[]> {
    let res = await signavault_api.get(`/v1/multisig/${ownerAddress}`)
    return res.data
}

export { signavault_api, getAllMultisigTransactions }
