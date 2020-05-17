import axios from 'axios';

const api_url = process.env.VUE_APP_EXPLORER_URL;

const explorer_api = axios.create({
    baseURL: api_url,
    withCredentials: false,
    headers:{
        'Content-Type' : 'application/json',
    }
});

export {explorer_api};
