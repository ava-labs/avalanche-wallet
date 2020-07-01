<template>
    <div class="access_view">
        <transition name="fade" mode="out-in">
            <router-view class="card"></router-view>
        </transition>
    </div>
</template>
<style scoped lang="scss">
@use "../../main";

    .access_view{
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: main.$white;
    }

    .card{
        text-align: center;
    }
</style>
