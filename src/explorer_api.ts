import axios from 'axios';

// Doesn't really matter what we set, it will change
const api_url = 'localhost';
const explorer_api = axios.create({
    baseURL: api_url,
    withCredentials: false,
    headers:{
        'Content-Type' : 'application/json',
    }
});

export {explorer_api};
