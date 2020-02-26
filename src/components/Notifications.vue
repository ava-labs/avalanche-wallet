<template>
    <div class="notifications" v-show="items.length>0">
        <transition-group name="list">
            <div class="notif_item"
                 v-for="notif in items"
                 :key="notif.id"
            >
                <p class="notif_title" :style="{
                backgroundColor: notif.color,
            }">{{notif.title}}</p>
                <p class="notif_msg">{{notif.message}}</p>
            </div>
        </transition-group>

    </div>
</template>
<script>
    export default {
        computed: {
            items(){
                return this.$store.state.Notifications.items;
            }
        }
    }
</script>
<style scoped>
    .notifications{
        position: fixed;
        display: flex;
        flex-direction: column;
        bottom: 0;
        right: 0;
        padding: 20px;
        z-index: 9;
    }

    .notif_item{
        border-radius: 4px;
        margin-top: 8px;
        overflow: hidden;
        box-shadow: 2px 0px 5px rgba(0,0,0,0.2);
        background-color: #fff;
        max-width: 195px;
    }

    .notif_title{
        font-size: 14px;
        color: #fff;
        font-weight: bold;
        padding: 3px 8px;
    }

    .notif_msg{
        padding: 3px 8px;
    }

    .list-enter-active, .list-leave-active {
        transition: all 1s;
    }
    .list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
        opacity: 0;
        transform: translateX(30px);
    }

    p{
        margin: 0 !important;
    }



    @media only screen and (max-width: 600px) {

        .notifications{
            height: min-content;
            width: 100%;
            left: 0;
            top: 0;
        }

        .notif_item{
            max-width: unset;
            width: 100%;
        }
    }
</style>