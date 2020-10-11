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
    // selected: LanguageItem = {
    //     code: 'en',
    //     name: 'English'
    // }
    // selected: string = "en";
    locale = 'en';

    // select(code: string){
    //     // console.log(this.selected);
    //     // this.selected = val;
    //     this.$root.$i18n.locale = this.selected.code;
    // }

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

// export default {
//     components: {
//         CountryFlag
//     },
//     data(){
//         return{
//             selected: {
//                 code: 'en',
//                 name: 'English'
//             },
//             locale: 'en',
//         }
//     },
//     methods: {
//         select(){
//             console.log(this.selected);
//             this.$root.$i18n.locale = this.selected.code;
//         }
//     },
//     computed: {
//         flag(){
//             let flag = 'us';
//             switch (this.selected) {
//                 case 'en':
//                     flag = 'us';
//                     break;
//                 default:
//                     flag = this.selected;
//                     break;
//             }
//             return flag
//         },
//         items(){
//             let res = [];
//
//             let messages = this.$root.$i18n.messages;
//             for(var langCode in messages){
//                 let data = langMap[langCode];
//                 res.push({
//                     code: langCode,
//                     name: data.name
//                 })
//             }
//             return res;
//         }
//     },
// }
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

        /*&:hover{*/
        /*    border: 1px solid var(--primary-color);*/
        /*}*/

        /*&:before{*/
        /*    left: 0;*/
        /*    position: absolute;*/
        /*    content: "";*/
        /*    pointer-events: none;*/
        /*    user-select: none;*/
        /*    width: 100%;*/
        /*    height: 100%;*/
        /*    background-color: var(--primary-color) !important;*/
        /*    opacity: 0.04;*/
        /*}*/
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
