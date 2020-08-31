import VueI18n from "vue-i18n";
import Vue from 'vue';

Vue.use(VueI18n);

import en from '../locales/en.json';
let tr = {}


const messages = {
    en,
    tr
};

// Create VueI18n instance with options
const i18n = new VueI18n({
    locale: 'en', // set locale
    messages, // set locale messages
});

export default i18n;