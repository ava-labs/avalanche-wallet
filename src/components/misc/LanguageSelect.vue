<template>
    <div class="sel_locale">
        <vue-select :options="items" label="name" v-model="selected" @input="select">
            <template #selected-option="{ code, name }">
                <div style="display: flex; align-items: baseline;">
                    {{ name }}
                </div>
            </template>
            <template v-slot:option="option">
                {{ option.name }}
            </template>
        </vue-select>
    </div>
</template>
<script>
    import langMap from '@/locales/lang_map';
    import CountryFlag from 'vue-country-flag'

    export default {
        components: {
            CountryFlag
        },
        data(){
            return{
                selected: {
                    code: 'en',
                    name: 'English'
                },
                locale: 'en',
            }
        },
        methods: {
            select(){
                console.log(this.selected);
                this.$root.$i18n.locale = this.selected.code;
            }
        },
        computed: {
            flag(){
                let flag = 'us';
                switch (this.selected) {
                    case 'en':
                        flag = 'us';
                        break;
                    default:
                        flag = this.selected;
                        break;
                }
                return flag
            },
            items(){
                let res = [];

                let messages = this.$root.$i18n.messages;
                for(var langCode in messages){
                    let data = langMap[langCode];
                    res.push({
                        code: langCode,
                        name: data.name
                    })
                }
                return res;
            }
        },
    }
</script>
<style scoped>
    .sel_locale{
        margin: 0px 15px;
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

    }
</style>