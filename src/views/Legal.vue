<template>
    <div>
        <div class="legal_cont">
            <ToSContent></ToSContent>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import ToSContent from '@/components/misc/ToSContent.vue'
@Component({
    components: { ToSContent },
})
export default class Legal extends Vue {}
</script>
<style scoped lang="scss">
.legal_cont {
    display: flex;
    flex-direction: column;
    padding-bottom: 4vh;
}
</style>
