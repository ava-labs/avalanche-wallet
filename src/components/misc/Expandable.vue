<template>
    <div class="expandable" :active="isActive">
        <div @click="toggle" class="toggle">
            <slot name="triggerOn" v-if="!isActive"></slot>
            <slot name="triggerOff" v-else></slot>
        </div>
        <div class="content">
            <slot name="content"></slot>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            isActive: false,
        }
    },
    methods: {
        toggle() {
            this.isActive = !this.isActive
        },
    },
}
</script>
<style scoped lang="scss">
.content {
    max-height: 0vh;
    overflow: hidden;
    transition-duration: 0.2s;
}

.toggle {
    color: var(--primary-color-light);
    font-size: 13px;
    cursor: pointer;

    &:hover {
        color: var(--primary-color);
    }
}

.expandable[active] {
    .toggle {
        color: var(--secondary-color);
    }
    .content {
        max-height: 100vh;
    }
}
</style>
