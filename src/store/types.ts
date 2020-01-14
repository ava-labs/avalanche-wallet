export interface RootState {
    modals: Object,
    assets: AssetType[],
    tx_history: Transaction[]
}


export interface AssetType {
    title: string,
    key: string,
    balance: number,
    usd_price: number,
    btc_price: number,
    address: string
}

export interface Transaction {
    id: string,
    asset: string,
    amount: number,
    to: string,
    date: Date,
    status: string
}