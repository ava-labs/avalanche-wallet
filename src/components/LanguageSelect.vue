<template>
    <div class="sel_locale">
        <v-select class="sel_outlined" :items="items"
                  dense outlined hide-details solo flat
                  item-text="name"
                  item-value="code"
                  @change="select" color="#42b983" v-model="selected">
            <template v-slot:selection="{item, index}">
                <country-flag :country='flag' size='normal'/>
                <p class="selected">{{item.name}}</p>
            </template>
        </v-select>
    </div>
</template>
<script>
    import langMap from '@/locales/lang_map';

    export default {
        data(){
            return{
                selected: 'en',
                locale: 'en',
            }
        },
        methods: {
            select(){
                this.$root.$i18n.locale = this.selected;
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
    }

    .sel_outlined{

    }

    @media only screen and (max-width: 600px) {
        .sel_locale{
            width: min-content;
        }
        p.selected{
            display: none;
        }
    }
    /*.sel_locale >>> .v-input .sel_outlined{*/
    /*    border: none !important;*/
    /*}*/
    /*.sel_locale >>> div[role='button']{*/
    /*    box-shadow: none !important;*/
    /*}*/
</style>