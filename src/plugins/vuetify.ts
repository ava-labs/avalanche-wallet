import Vue from 'vue';
import Vuetify from 'vuetify/lib';





import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faDollarSign, faTimesCircle, faSignOutAlt, faSignInAlt, faCaretDown, faHistory, faGlobe,
  faExchangeAlt, faDna, faCamera, faDownload, faCheckCircle, faTimes, faPlus, faMinus,
  faSync, faExclamationTriangle, faPrint, faQrcode, faCopy, faKey, faFileExcel, faList, faTrash, faUpload, faCreditCard, faArrowRight, faArrowLeft, faTint
} from '@fortawesome/free-solid-svg-icons'

import { faBtc} from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(
    faDollarSign, faBtc, faTimesCircle, faSignOutAlt, faSignInAlt, faCaretDown, faHistory,
    faGlobe, faExchangeAlt, faDna, faCamera, faDownload, faCheckCircle, faTimes, faPlus,
    faMinus, faSync, faExclamationTriangle, faPrint, faQrcode, faCopy, faKey, faFileExcel, faList, faTrash, faUpload, faCreditCard, faArrowRight, faArrowLeft, faTint
);

Vue.component('fa', FontAwesomeIcon);



Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#42b983',
        secondary: '#06f',
        accent: '#82B1FF',
        error: '#ff9090',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#ecce73'
      },
    },
  },
  icons: {
    iconfont: 'fa',
  },
});
