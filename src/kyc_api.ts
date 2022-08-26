import axios, { AxiosInstance } from 'axios'

export interface AccessToken {
    token: string
    userId: string
}

const BASE_URL = 'https://kyc-poc-be.camino.foundation/api/v1'

const kyc_api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
    },
})

async function generateToken(address: string, publicKeyByte: string): Promise<AccessToken> {
    let url = `/generate_token`
    try {
        let res = await kyc_api.post(url, {
            external_user_id: address,
            public_key: publicKeyByte,
        })
        return res.data
    } catch (e) {
        throw e
    }
}

async function checkVerificationStatus(address: string): Promise<boolean> {
    let url = `/verified/${address}`

    try {
        let res = await kyc_api.get(url)
        return res.data
    } catch (e) {
        throw e
    }
}

export { kyc_api, generateToken, checkVerificationStatus }
