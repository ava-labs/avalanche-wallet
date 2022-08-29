<template>
    <button @click="toggle">
        <img v-if="val" src="@/assets/theme_toggle/night.svg" />
        <img v-else src="@/assets/theme_toggle/day.svg" />
    </button>
</template>
<script>
export default {
    data() {
        return {
            val: false,
        }
    },
    methods: {
        setNight() {
            this.val = true
            localStorage.setItem('theme', 'night')
            document.documentElement.setAttribute('data-theme', 'night')
            this.$root.theme = 'night'
        },
        setDay() {
            this.val = false
            localStorage.setItem('theme', 'day')
            document.documentElement.setAttribute('data-theme', 'day')
            this.$root.theme = 'day'
        },
        toggle() {
            this.val = !this.val
            if (this.val) {
                this.setNight()
            } else {
                this.setDay()
            }
        },
    },
    mounted() {
        let theme = localStorage.getItem('theme')

        if (!theme) {
            this.setNight()
            return
        }

        if (theme === 'night') {
            this.setNight()
        }
    },
}
</script>
<style scoped lang="scss">
button {
    display: flex;
    align-items: center;
    img {
        max-height: 18px;
    }
}
</style>
