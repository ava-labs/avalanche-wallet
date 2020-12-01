<template>
    <div class="access_view">
        <b-container>
            <b-row align-h="center">
                <b-col md="12" lg="10">
                    <transition name="fade" mode="out-in">
                        <router-view class="access_card"></router-view>
                    </transition>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>
<style scoped lang="scss">
@use "../../main";

.access_view {
    display: flex;
    justify-content: center;
    align-items: center;
}

.access_card {
    text-align: center;
}
</style>
