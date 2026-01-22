import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    // On utilise meta pour dire que cette route est privée
    meta: { requiresAuth: true }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('@/views/ChatView.vue'), // Ta future vue Chat
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// ✅ Le "Vigile" global : plus besoin de répéter beforeEnter sur chaque route
router.beforeEach((to, from, next) => {
  // On vérifie la présence du TOKEN (plus fiable que l'objet user)
  const token = localStorage.getItem('access_token')
  const isProtected = to.matched.some(record => record.meta.requiresAuth)

  if (isProtected && !token) {
    // Pas de badge ? Retour à la case départ
    next('/login')
  } else if (to.name === 'Login' && token) {
    // Déjà connecté ? On skip le login
    next('/dashboard')
  } else {
    // Tout est bon, on circule !
    next()
  }
})

export default router