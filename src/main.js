// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import iView from 'iview'
import i18n from '@/locale'
import config from '@/config'
import importDirective from '@/directive'
import 'iview/dist/styles/iview.css'
import './index.less'
import '@/assets/icons/iconfont.css'
import VueQuillEditor from 'vue-quill-editor'
// require styles 引入样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import echarts from 'echarts'
import { getToken, initRouter } from '@/libs/util'

// import { initRouter } from '@/libs/util'
// import '@/mock'
// 实际打包时应该不引入mock
/* eslint-disable */
if (process.env.NODE_ENV !== 'production') require('@/mock')

Vue.use(iView, {
  i18n: (key, value) => i18n.t(key, value)
}, VueQuillEditor)
Vue.config.productionTip = false
Vue.prototype.$echarts = echarts
/**
 * @description 全局注册应用配置
 */
Vue.prototype.$config = config
/**
 * 注册指令
 */
importDirective(Vue)

/* eslint-disable no-new */
// eslint-disable-next-line
/* eslint-disable */
new Vue({
  el: '#app',
  router,
  i18n,
  store,
  render: h => h(App),
  mounted () {
    // if (!getToken())
    initRouter(this)
    // this.$router.push({
    //   name: 'home'
    // })
  }
})
