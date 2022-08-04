import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
// 引入全局样式表
import './assets/css/globel.less'
// 引入字体样式表
import './assets/font/iconfont.css'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api'
// 将全局的echarts对象挂载到Vue的原型对象，其它组件通过this.$echarts调用
Vue.prototype.$echarts = window.echarts
// 使用：this.$http
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
