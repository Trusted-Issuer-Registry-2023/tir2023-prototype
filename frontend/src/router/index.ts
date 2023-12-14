/**
 * This file defines the routes of our application.
 */
import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import VerifyView from '../views/verify/VerifyView.vue'
import RegistryView from '../views/registry/RegistryView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/registry',
      name: 'registry',
      component: RegistryView
    },
    {
      path: '/verify',
      name: 'verify',
      component: VerifyView
    }
  ]
})

export default router
