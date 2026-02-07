import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import Register from '../views/Register.vue'
import DashboardView from '../views/DashboardView.vue'
import ClientDetailView from '../views/ClientDetailView.vue'
import UserManagement from '../views/UserManagement.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/client/:id',
      name: 'client-detail',
      component: ClientDetailView,
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'user-management',
      component: UserManagement,
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token')
  const userStr = localStorage.getItem('auth_user')
  const isAuthenticated = !!token
  const user = userStr ? JSON.parse(userStr) : null
  
  // If route requires authentication and user is not authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  }
  // If route requires admin and user is not admin
  else if (to.meta.requiresAdmin && (!user || user.role !== 'admin')) {
    next('/dashboard')
  }
  // If route requires guest (login/register) and user is authenticated
  else if (to.meta.requiresGuest && isAuthenticated) {
    next('/dashboard')
  }
  // Allow navigation
  else {
    next()
  }
})

export default router
