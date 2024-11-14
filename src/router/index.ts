import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Profile from '../views/Profile.vue'
import FileTransform from '../views/FileTransform.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      component: Register,
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      component: Profile,
      meta: { requiresAuth: true }
    },
    {
      path: '/transform',
      component: FileTransform,
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard
router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  
  // Check if route requires auth
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login'
  }
  
  // Redirect to dashboard if logged in user tries to access login/register pages
  if ((to.path === '/login' || to.path === '/register') && authStore.isAuthenticated) {
    return '/dashboard'
  }
})

export default router