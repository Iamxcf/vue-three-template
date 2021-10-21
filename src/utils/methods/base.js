// import {cloneDeep, debounce, throttle} from 'lodash/fp'
import cloneDeep from 'lodash/cloneDeep'
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'
import dayjs from 'dayjs'
console.log('cloneDeep :>> ', throttle)
export default {
  install(Vue) {
    Vue.prototype.$cloneDeep = cloneDeep
    Vue.prototype.$debounce = debounce
    Vue.prototype.$throttle = throttle
    Vue.prototype.$dayjs = dayjs// vue原型挂载dayjs
  }
}
