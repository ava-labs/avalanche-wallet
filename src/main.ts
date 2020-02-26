import Vue from 'vue'
import App from './App.vue'
// import './registerServiceWorker'
import router from './router'
import store from './store'
import VueI18n from 'vue-i18n'


// import BootstrapVue from 'bootstrap-vue'
// import 'bootstrap/dist/css/bootstrap.css'
// import 'bootstrap-vue/dist/bootstrap-vue.css'

import vuetify from './plugins/vuetify';

// @ts-ignore
import i18n from "./plugins/i18n.js";
// import AVA from './AVA';

import CountryFlag from 'vue-country-flag'
Vue.component('country-flag', CountryFlag);

// Install BootstrapVue
// Vue.use(BootstrapVue);
// Vue.use(IconsPlugin);

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
