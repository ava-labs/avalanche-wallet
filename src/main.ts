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

// import AVA from './AVA';

Vue.use(VueI18n);

// Install BootstrapVue
// Vue.use(BootstrapVue);
// Vue.use(IconsPlugin);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
  mounted(){
    // Hide loader once vue is initialized
    let loader = document.getElementById('app_loading');
    if(loader){
      loader.style.display = 'none';
    }
  }
}).$mount('#app');
