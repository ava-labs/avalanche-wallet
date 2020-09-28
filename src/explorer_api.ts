import axios, { AxiosInstance } from 'axios';

// Doesn't really matter what we set, it will change
const api_url: string = 'localhost';
const explorer_api: AxiosInstance = axios.create({
    baseURL: api_url,
    withCredentials: false,
    headers:{
        'Content-Type' : 'application/json',
    }
});

async function getAddressHistory(addrs: string[], limit=20, offset=0){
    let query = addrs.map(val => {
        let raw = val.split('-')[1];
        return `address=${raw}`;
    });

    // Get history for all addresses of the active HD wallet
    let url = `/x/transactions?${query.join('&')}&limit=${limit}&offset=${offset}&sort=timestamp-desc`;
    let res = await explorer_api.get(url);
    return res.data;
}

export {explorer_api, getAddressHistory};
