import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueI18n from 'vue-i18n'
//@ts-ignore
import { Datetime } from 'vue-datetime';
import 'vue-datetime/dist/vue-datetime.css'

import { BootstrapVue } from 'bootstrap-vue'
// Install BootstrapVue
Vue.use(BootstrapVue)

Vue.component('datetime', Datetime);


import vuetify from './plugins/vuetify';

// @ts-ignore
import i18n from "./plugins/i18n.js";


Vue.config.productionTip = false;

const app = new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: h => h(App),
  mounted(){
    // Hide loader once vue is initialized
    let loader = document.getElementById('app_loading');
    if(loader){
      loader.style.display = 'none';
    }
  },
  data: {
    theme: 'day'
  }
}).$mount('#app');


// @ts-ignore
if (window.Cypress) {
  // only available during E2E tests
  // @ts-ignore
  window.app = app
}

// Extending Big.js with a helper function
import Big from "big.js";

declare module "big.js" {
  interface Big {
    toLocaleString(toFixed?: number): string;
  }
}

Big.prototype.toLocaleString = function(toFixed: number = 2) {
  let value = this;

  let split = value.toString().split('.');
  let wholeStr = parseInt(split[0]).toLocaleString('en-US');

  if(split.length===1){
    return wholeStr;
  }else{
    let remainderStr = split[1];
    return `${wholeStr}.${remainderStr}`;
  }
}
