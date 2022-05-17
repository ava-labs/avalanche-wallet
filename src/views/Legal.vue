<template>
    <div>
        <div class="legal_cont">
            <ToSCoreContent v-if="isCore"></ToSCoreContent>
            <ToSContent v-else></ToSContent>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import ToSContent from '@/components/misc/ToSContent.vue'
import ToSCoreContent from '@/components/misc/ToSCoreContent.vue'
@Component({
    components: { ToSContent, ToSCoreContent },
})
export default class Legal extends Vue {
    get isCore() {
        let urlParams = new URLSearchParams(window.location.search)
        if (urlParams.has('core')) {
            return true
        }
        return false
    }
}
</script>
<style scoped lang="scss">
.legal_cont {
    display: flex;
    flex-direction: column;
    padding-bottom: 4vh;
}
</style>
