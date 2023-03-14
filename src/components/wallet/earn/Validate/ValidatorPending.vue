<template>
    <div>
        <Spinner class="pending-validator" style="color: var(--primary-color)"></Spinner>
        <br />
        <p class="text-pending-validator">
            {{ $t('validator.pending.validator_pending') }}
            <a :href="link" target="_blank">
                <v-icon class="v-icon-color">mdi-arrow-top-right-thick</v-icon>
            </a>
        </p>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Component, Prop, Vue } from 'vue-property-decorator'
import Spinner from '@/components/misc/Spinner.vue'

@Component({
    name: 'validator_pending',
    components: {
        Spinner,
    },
})
export default class ValidatorPending extends Vue {
    link = '#'
}
</script>
<style scoped lang="scss">
@use '../../../../styles/main';

.pending-validator {
    font-size: 40px;
    position: relative;
    left: 3%;
}

.text-pending-validator {
    color: var(--primary-color);
}

.v-icon-color {
    color: var(--primary-color);
}
</style>
