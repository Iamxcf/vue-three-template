import Vue from 'vue'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets
import '@/styles/index.scss' // global css

import App from './App.vue'
import router from './router'
import store from './store'
import '@/icons' // icon
import methods from '@/utils/index'
Vue.config.productionTip = false
for (const key in methods) {
  if (Object.hasOwnProperty.call(methods, key)) {
    const element = methods[key]
    Vue.use(element)
  }
}
new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
