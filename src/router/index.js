import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/layout',
    meta: {
      title: '',
      requireAuth: true,
      permissionCheck: false
    }
  },
  {
    path: '/layout',
    name: 'layout',
    redirect: '/indexPage',
    component: () => import(/* webpackChunkName: "about" */ '../views/layout/index.vue'),
    children: [
      {
        name: 'indexPage',
        path: '/indexPage',
        component: () => import(/* webpackChunkName: "layout" */ '@/views/indexPage/index.vue'),
        meta: {
          title: '首页',
          bread: [{ text: '任务管理' }],
          requireAuth: false,
          permissionCheck: false,
          belong: 'taskManage'
        }
      },
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
