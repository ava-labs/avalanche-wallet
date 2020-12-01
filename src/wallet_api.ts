// Doesn't really matter what we set, it will change
import axios, { AxiosInstance } from 'axios'

const wallet_api: AxiosInstance = axios.create({
    baseURL: '/api',
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
    },
})
export { wallet_api }
