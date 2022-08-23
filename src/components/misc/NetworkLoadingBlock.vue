<template>
    <div class="network_loading" v-if="networkLoading">
        <div>
            <Spinner class="spinner"></Spinner>
            <p>{{ $t('network.blocker.desc') }}</p>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Spinner from '@/components/misc/Spinner.vue'

@Component({
    components: {
        Spinner,
    },
})
export default class NetworkLoadingBlock extends Vue {
    get networkLoading() {
        // return true
        return this.$store.state.Network.status === 'connecting'
    }
}
</script>
<style scoped lang="scss">
.network_loading {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;

    > div {
        border-radius: var(--border-radius-sm);
        max-width: 340px;
        background-color: var(--bg);
        padding: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        //border: 1px solid var(--bg-light);
        box-shadow: 1px 1px 6px 0px rgba(0, 0, 0, 0.1);
    }

    h1 {
        font-weight: normal;
    }
}

.spinner {
    margin-bottom: 30px;
    font-size: 24px;
}
</style>
