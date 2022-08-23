<template>
    <div class="sel_locale">
        <country-flag :country="flag" size="small" class="flag"></country-flag>
        <select v-model="locale">
            <option v-for="item in items" :key="item.code" :value="item.code">
                {{ item.nativeName }}
            </option>
        </select>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Watch } from 'vue-property-decorator'

//@ts-ignore
import langMap from '@/locales/lang_map'
//@ts-ignore
import CountryFlag from 'vue-country-flag'

import { LanguageItem } from '@/components/misc/LanguageSelect/types'

interface FLAG_DICT {
    [key: string]: string
}
const FLAGS_OVERRIDE: FLAG_DICT = {
    en: 'us',
    zh_hant: 'cn',
    zh_hans: 'cn',
    cs: 'cz',
    ca: 'es-ca',
    uk: 'ua',
    af: 'za',
    ar: 'ae',
    da: 'dk',
    el: 'gr',
    he: 'il',
    nb: 'no',
    sr: 'rs',
    sv: 'se',
    ja: 'jp',
}

@Component({
    components: {
        CountryFlag,
    },
})
export default class LanguageSelect extends Vue {
    locale = 'en'

    mounted() {
        this.locale = this.$root.$i18n.locale
    }

    @Watch('locale')
    onSelectedChange(val: string) {
        this.$root.$i18n.locale = val
        localStorage.setItem('lang', val)
    }

    get flag() {
        let selCode = this.locale

        if (FLAGS_OVERRIDE[selCode]) {
            return FLAGS_OVERRIDE[selCode]
        } else {
            return selCode
        }
    }

    get items(): LanguageItem[] {
        let res = []

        let messages = this.$root.$i18n.messages
        for (var langCode in messages) {
            // @ts-ignore
            let data = langMap[langCode]
            // @ts-ignore

            res.push({
                code: langCode,
                name: data.name,
                nativeName: data.nativeName,
            })
        }
        return res
    }
}
</script>
<style scoped lang="scss">
@use '../../../styles/main';
.sel_locale {
    display: flex;
    flex-direction: row;
    align-items: center;
    // padding: 14px 24px;
    border: 1px solid transparent;
    border-radius: 3px;
    position: relative;
    overflow: hidden;

    &:hover {
        opacity: 0.5;
    }
}

.flag {
    flex-shrink: 0;
}
.sel_locale p.selected {
    margin: 0;
    padding-left: 8px;
    color: var(--primary-color);
}

.sel_outlined {
    border-color: #1d82bb !important;
    color: #1d82bb !important;
}

.selected {
    //font-size: 13px;
}

select {
    outline: none;
    flex-grow: 1;
    margin-left: 10px;
    color: var(--primary-color);
    cursor: pointer;
    //font-size: 13px;

    &:hover {
        color: var(--primary-color);
    }
}

.small-flag {
    transform: scale(0.35);
}

@include main.medium-device {
    .small-flag {
        transform: scale(0.25);
    }
}

@media only screen and (max-width: 600px) {
    // .sel_locale {
    //     width: min-content;
    // }
    p.selected {
        display: none;
    }
}
</style>
<style lang="scss">
.sel_locale {
    .vs__dropdown-toggle {
        border-color: var(--primary-color-light) !important;
    }
}
</style>
