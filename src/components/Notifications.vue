<template>
    <div class="notifications">
        <transition-group name="list">
            <div class="notif_item" v-for="notif in items" :key="notif.id">
                <p
                    class="notif_title"
                    :style="{
                        backgroundColor: notif.color,
                    }"
                >
                    {{ notif.title }}
                </p>
                <p class="notif_msg">{{ notif.message }}</p>
            </div>
        </transition-group>
    </div>
</template>
<script>
export default {
    computed: {
        items() {
            return this.$store.state.Notifications.items
        },
    },
}
</script>
<style scoped>
.notifications {
    pointer-events: none;
    position: fixed;
    display: flex;
    flex-direction: column;
    top: 0;
    right: 0;
    padding: 30px 3vw;
    z-index: 9;
}

.notif_item {
    border-radius: 6px;
    margin-top: 8px;
    overflow: hidden;
    box-shadow: 2px 2px 12px rgba(0, 0, 0, 0.4);
    background-color: var(--bg);
    max-width: 195px;
    font-size: 13px !important;
}

.notif_title {
    /*font-size: 14px;*/
    color: var(--bg-light);
    font-weight: bold;
    padding: 6px 14px;
}

.notif_msg {
    padding: 6px 14px;
}

.list-enter-active,
.list-leave-active {
    transition: all 1s;
}
.list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
    opacity: 0;
    transform: translateX(30px);
}

p {
    margin: 0 !important;
}

@media only screen and (max-width: 600px) {
    .notifications {
        height: min-content;
        width: 100%;
        left: 0;
        top: 0;
    }

    .notif_item {
        max-width: unset;
        width: 100%;
    }
}
</style>
