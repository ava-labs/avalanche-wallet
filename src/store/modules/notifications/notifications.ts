import { Module, Store } from 'vuex'
import { RootState } from '@/store/types'
import { NotifState, Notification, NotificationInput } from '@/store/modules/notifications/types'

const COLOR_SUCCESS: string = '#6BC688'
const COLOR_WARNING: string = '#c39043'
const COLOR_ERROR: string = '#E84970'
let notif_id = 0

const notifications_module: Module<NotifState, RootState> = {
    namespaced: true,
    state: {
        items: [],
    },
    mutations: {},
    actions: {
        add(store, data: NotificationInput) {
            const id = notif_id++
            // let color = data.color || NOTIF_COLOR;
            const type = data.type || 'success'
            const duration = data.duration || 5000
            let color = COLOR_SUCCESS

            switch (type) {
                case 'success':
                    color = COLOR_SUCCESS
                    break
                case 'error':
                    color = COLOR_ERROR
                    break
                case 'warning':
                    color = COLOR_WARNING
                    break
            }

            const item: Notification = {
                id: id,
                title: data.title,
                message: data.message,
                color: color,
                duration: 5000,
            }

            setTimeout(() => {
                for (let i = 0; i < store.state.items.length; i++) {
                    const item = store.state.items[i]
                    if (item.id === id) {
                        store.state.items.splice(i, 1)
                    }
                }
            }, duration)
            store.state.items.push(item)
        },
    },
    getters: {},
}

export default notifications_module
