import Vue from 'vue'

import 'normalize.css/normalize.css'

import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/dayjs'
import './plugins/element'
import './plugins/batchComponents'

import '@/styles/index.scss'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
