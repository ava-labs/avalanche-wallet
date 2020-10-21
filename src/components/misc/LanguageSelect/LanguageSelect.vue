<template>
    <div class="sel_locale">
<!--        <vue-select :options="items" label="name" v-model="selected" @input="select">-->
<!--            <template #selected-option="{ code, name }">-->
<!--                <div style="display: flex; align-items: baseline;">-->
<!--                    {{ name }}-->
<!--                </div>-->
<!--            </template>-->
<!--            <template v-slot:option="option">-->
<!--                {{ option.name }}-->
<!--            </template>-->
<!--        </vue-select>-->
        <country-flag :country="flag" size="small"></country-flag>
        <select v-model="locale">
            <option v-for="item in items" :key="item.code" :value="item.code">
                {{item.nativeName}}
            </option>
        </select>
    </div>
</template>
<script lang="ts">
import "reflect-metadata";
import {Vue, Component, Prop, Watch} from "vue-property-decorator";

//@ts-ignore
import langMap from '@/locales/lang_map';
//@ts-ignore
import CountryFlag from 'vue-country-flag';

import {LanguageItem} from "@/components/misc/LanguageSelect/types";

@Component({
    components: {
        CountryFlag
    }
})



export default class LanguageSelect extends Vue{
    locale = 'en';

    mounted(){
        this.locale = this.$root.$i18n.locale;
    }


    @Watch('locale')
    onSelectedChange(val: string){
        this.$root.$i18n.locale = val;
        localStorage.setItem("lang", val);
    }

    get flag(){
        let flag = 'us';
        let selCode = this.locale;
        switch (selCode) {
            case 'en':
                flag = 'us';
                break;
            case 'fr':
                flag = 'fr';
                break;
            case 'zh_hant':
                flag = "cn";
                break;
            case 'zh_hans':
                flag = "cn";
                break;
            default:
                flag = selCode;
                break;
        }
        return flag
    }
    get items(): LanguageItem[]{
        let res = [];

        let messages = this.$root.$i18n.messages;
        for(var langCode in messages){
            let data = langMap[langCode];

            res.push({
                code: langCode,
                name: data.name,
                nativeName: data.nativeName
            })
        }
        return res;
    }
}

</script>
<style scoped lang="scss">
    .sel_locale{
        margin: 0px 15px;
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 4px 12px;
        border: 1px solid transparent;
        border-radius: 3px;
        position: relative;
        overflow: hidden;
    }

    .sel_locale p.selected{
        margin: 0;
        padding-left: 8px;
        color: var(--primary-color);
    }

    .sel_outlined{
        border-color: #1d82bb !important;
        color: #1d82bb !important;
    }

    .selected{
        font-size: 13px;
    }

    select{
        outline: none;
        flex-grow: 1;
        margin-left: 10px;
        color: var(--primary-color-light);
        cursor: pointer;

        &:hover{
            color: var(--primary-color);
        }
    }

    @media only screen and (max-width: 600px) {
        .sel_locale{
            width: min-content;
        }
        p.selected{
            display: none;
        }
    }
</style>
<style lang="scss">
    .sel_locale{
        .vs__dropdown-toggle{
            border-color: var(--primary-color-light) !important;
        }
    }
</style>
