<template>
    <div class="term-of-us">
        <p>
            By using this application you agree to the
            <span class="link" @click="click('/legal')">Terms of Use.</span>
        </p>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
@Component({
    name: 'tos',
})
export default class ToS extends Vue {
    helpers = this.globalHelper()

    click(to: string) {
        this.helpers.navigate(to)
    }
}
</script>
<style scoped lang="scss">
.term-of-us {
    color: var(--primary-color-light);
    font-size: 13px;
}
.link {
    color: var(--primary-color) !important;
    cursor: pointer;
}
</style>
