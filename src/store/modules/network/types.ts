import {AvaNetwork} from "@/js/AvaNetwork";

export interface NetworkState {
    networks: AvaNetwork[]
    selectedNetwork: null|AvaNetwork
    // isConnected: boolean
    status: NetworkStatus
}

type NetworkStatus = 'disconnected' | 'connecting' | 'connected';


export interface NetworkItem {
    name: string,
    url: string,
    protocol: string,
    port: number,
    networkId: number,
    chainId: string,
}



