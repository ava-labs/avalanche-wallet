export interface RootState {
    modals: ModalDict,
    assets: AssetType[],
    tx_history: Transaction[]
}


interface Modal {
    open(): void,
    close(): void
}

interface ModalDict {
    [key: string]: Modal
}

export interface AssetType {
    title: string,
    key: string,
    balance: number,
    usd_price: number,
    btc_price: number,
    ava_price: number,
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