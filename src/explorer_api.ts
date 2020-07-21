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

export {explorer_api};
