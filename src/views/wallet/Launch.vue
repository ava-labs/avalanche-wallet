<template>
    <div>
        <div class="header">
            <h1>{{ $t('launch.title') }}</h1>
            <p>{{ $t('launch.subtitle') }}</p>
        </div>
        <form @submit.prevent="submit">
            <div>
                <label>{{ $t('launch.url') }}</label>
                <input
                    type="text"
                    placeholder="URL"
                    v-model="url"
                    style="width: 100%"
                    maxlength="2048"
                />
            </div>
            <p v-if="error" class="err">{{ error }}</p>
            <v-btn type="submit" class="button_secondary" small>
                {{ $t('launch.submit') }}
            </v-btn>
        </form>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class Launch extends Vue {
    name = 'launch'
    error = ''
    url = ''

    async submit() {
        await this.$store.dispatch('Launch/launchItem', this.url)
    }
}
</script>

<style scoped lang="scss">
@use '../../styles/main';

h1 {
    font-weight: normal;
}

form > div {
    margin: 12px 0;
}

label {
    margin-top: 6px;
    color: var(--primary-color-light);
    font-size: 14px;
    margin-bottom: 3px;
}

input {
    display: block;
    background-color: var(--bg-light);
    color: var(--primary-color);
    padding: 6px 14px;
    font-size: 13px;
}
</style>
