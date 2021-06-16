import Vue from 'vue'
import VueRouter from 'vue-router'
// import Edit from '../edit/index.vue'
import Home from '@/views/index/index.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/',
    name: 'Edit',
    component: () => import('@/views/edit/index.vue')
  },
  {
    path: '/title',
    name: 'Title',
    component: () => import('@/views/title/index.vue')
  }
]

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
