
export interface NetworkState {
    networks: NetworkItem[]
    selectedNetwork: null|NetworkItem
}



export interface NetworkItem {
    name: string,
    url: string,
    protocol: string,
    port: number,
    networkId: number,
    chainId: string,
}
