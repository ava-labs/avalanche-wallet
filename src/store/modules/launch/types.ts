import { AvaNetwork } from '@/js/AvaNetwork'

export interface LaunchItem {
    url: string
    title: string
    iconUrl: string
    proxy: WindowProxy | null
}

export interface LaunchState {
    items: LaunchItem[]
    eventListener?: EventListener
    eventFunc?: (event: Event) => void
    network?: AvaNetwork
}
