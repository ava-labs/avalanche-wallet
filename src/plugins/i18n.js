import VueI18n from "vue-i18n";
import Vue from 'vue';

Vue.use(VueI18n);

import {en} from '../locales/en.js';
import {fr} from '../locales/fr.js';
import {tr} from '../locales/tr.js';

import * as ru from '../locales/ru.json';

// console.log(ru.default);

const messages = {
    en,
    // fr,
    // ru: ru.default,
    // tr
};

// Create VueI18n instance with options
const i18n = new VueI18n({
    locale: 'en', // set locale
    messages, // set locale messages
});

export default i18n;