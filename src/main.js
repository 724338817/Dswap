import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'Assets/style/index.less'
import dayjs from 'dayjs'
import VueClipboard from 'vue-clipboard2'
Vue.use(VueClipboard)

Vue.use(ElementUI)
Vue.config.productionTip = false

Vue.filter('thousandSeparator', (num) => {
  if (!num || !Number.isFinite(+num)) return num // （!num）是针对null，因为+null返回0会导致Number.isFinite(+num)返回true，发生误判
  const decimals = Number.isInteger(+num) ? '' : String(num).split('.')[1]
  const arr = String(parseInt(num)).split('').reverse()
  return `${arr
    .map((item, index) => {
      return index !== 0 && index % 3 === 0 ? item + ',' : item
    })
    .reverse()
    .join('')}${decimals && '.' + decimals}`
})

// Vue.filter('timeTrans', (timestamp) => {
//   return dayjs(timestamp).format('MM-DD')
// })

Vue.filter('timeTrans', (timestamp) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? to.meta.title : ''
  const authorization = store.state.authorization
  const permission = store.state.permission
  // token 失效
  if (!authorization && to.meta.requireAuth) {
    next('/login')
  } else if (!permission.includes(to.name) && to.meta.permissionCheck) {
    // 没有权限
    next('/noPermission')
  } else {
    next()
  }
})

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
