import Vue from 'vue'
import router from './router'
import App from './App'
import ElementUI from 'element-ui'
import HighchartsVue from 'highcharts-vue'
import 'element-ui/lib/theme-chalk/index.css'

Vue.config.productionTip = false

Vue.use(ElementUI)
Vue.use(HighchartsVue)
/* eslint-disable no-new */
// new Vue({
//   data () {
//     return {
//       list: []
//     };
//   },
//   router,
//   components: {App},
//   template: '<App :list="list"/>'
// }).$mount('#app');
new Vue({
  el: '#app',
  render: h => h(App),
  router
})
