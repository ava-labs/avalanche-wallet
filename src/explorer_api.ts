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


async function getAddressDetailX(addr: string){
    let addrRaw = addr.split('-')[1];
    let url = `/x/addresses/${addrRaw}`;

    try{
        let res = await explorer_api.get(url);
        return res.data;
    }catch(e){
        throw e;
    }
}

export {explorer_api, getAddressHistory, getAddressDetailX};
