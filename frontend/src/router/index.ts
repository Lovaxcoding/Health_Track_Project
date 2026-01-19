import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// Définition des routes
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    // Import direct pour la page principale
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    // Lazy loading (chargé uniquement quand on y va)
    component: () => import('@/views/DashboardView.vue'),
    // Petit bonus : protection de route simple
    beforeEnter: (to, from, next) => {
      const isAuthenticated = localStorage.getItem('user')
      if (isAuthenticated) next()
      else next('/login')
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router