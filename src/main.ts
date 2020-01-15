import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'

// import BootstrapVue from 'bootstrap-vue'
// import 'bootstrap/dist/css/bootstrap.css'
// import 'bootstrap-vue/dist/bootstrap-vue.css'

import vuetify from './plugins/vuetify';


import { library } from '@fortawesome/fontawesome-svg-core'
import { faDollarSign, faTimesCircle, faSignOutAlt, faSignInAlt, faCaretDown, faHistory, faGlobe, faExchangeAlt, faDna, faCamera, faDownload, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { faBtc} from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faDollarSign, faBtc, faTimesCircle, faSignOutAlt, faSignInAlt, faCaretDown, faHistory, faGlobe, faExchangeAlt, faDna, faCamera, faDownload, faCheckCircle);
Vue.component('fa', FontAwesomeIcon);



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
