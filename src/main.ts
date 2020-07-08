import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueI18n from 'vue-i18n'

import { BootstrapVue } from 'bootstrap-vue'
// Install BootstrapVue
Vue.use(BootstrapVue)

import vuetify from './plugins/vuetify';

// @ts-ignore
import i18n from "./plugins/i18n.js";

import ToggleButton from 'vue-js-toggle-button';
Vue.use(ToggleButton)

Vue.config.productionTip = false;

new Vue({
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
  }
}).$mount('#app');


// Extending Big.js with a helper function
import Big from "big.js";

declare module "big.js" {
  interface Big {
    toLocaleString(toFixed: number): string;
  }
}

Big.prototype.toLocaleString = function(toFixed: number = 2) {
  let value = this;
  let remainder = value.mod(1);
  let wholeNums = value.minus(remainder);
  let wnInt = parseInt(wholeNums.toFixed(0));

  if (toFixed === 0) return wnInt.toLocaleString();

  return (parseFloat(remainder) === 0) ?
      wnInt.toLocaleString() :
      wnInt.toLocaleString() + "." + remainder.toFixed(toFixed).split(".")[1].toString();
}
