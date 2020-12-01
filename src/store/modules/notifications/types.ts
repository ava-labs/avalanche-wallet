export interface NotifState {
    items: Notification[]
}

export interface Notification {
    id: number
    title: string
    message: string
    color: string
    duration?: number
}

export interface NotificationInput {
    title: string
    message: string
    color?: string
    type?: string
    duration?: number
}
