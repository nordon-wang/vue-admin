import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('@/views/login/index')
  }, {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  }, {
    path: '/demo',
    component: () => import('@/views/demo/demo'),
    hidden: true
  }, {
    path: '/chat',
    component: () => import('@/views/chat/index'),
    hidden: true
  }, {
    path: '/components',
    component: () => import('@/views/components/index'),
    children: [{
      path: 'form',
      component: () => import('@/views/components/form')
    }, {
      path: 'message',
      component: () => import('@/views/components/message')
    }]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router

// {
//   path: '/about',
//   name: 'About',
//   // route level code-splitting
//   // this generates a separate chunk (about.[hash].js) for this route
//   // which is lazy-loaded when the route is visited.
//   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
// },
