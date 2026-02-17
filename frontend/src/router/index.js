import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import Profile from '../views/Profile.vue'
import HelloWorld from '../components/HelloWorld.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HelloWorld
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/auth/ForgotPassword.vue')
  },
  {
    path: '/rooms',
    name: 'RoomList',
    component: () => import('../views/rooms/RoomList.vue')
  },
  {
    path: '/my-rooms',
    name: 'MyRooms',
    component: () => import('../views/rooms/MyRooms.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/saved-materials',
    name: 'SavedMaterials',
    component: () => import('../views/SavedMaterials.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reported-materials',
    name: 'ReportedMaterials',
    component: () => import('../views/ReportedMaterials.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/rooms/create',
    name: 'CreateRoom',
    component: () => import('../views/rooms/CreateRoom.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/rooms/:id',
    name: 'RoomDetails',
    component: () => import('../views/rooms/RoomDetails.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
