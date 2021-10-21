import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/home/index.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',

    component: () => import('@/views/about/index.vue')

  },
  {
    path: '/factory',
    name: 'Factory',

    component: () => import('@/views/factory/index.vue')

  }
]

const router = new VueRouter({
  routes
})

export default router
