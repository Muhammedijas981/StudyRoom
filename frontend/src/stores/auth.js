import { defineStore } from 'pinia'
import api from '../utils/api'
import router from '../router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    async register(userData) {
      this.loading = true
      this.error = null
      try {
        const res = await api.post('/api/auth/register', userData)
        this.token = res.data.token
        localStorage.setItem('token', res.data.token)
        this.user = res.data.user
        router.push('/rooms')
      } catch (err) {
        this.error = err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || 'Registration failed'
        throw err
      } finally {
        this.loading = false
      }
    },

    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const res = await api.post('/api/auth/login', credentials)
        this.token = res.data.token
        localStorage.setItem('token', res.data.token)
        this.user = res.data.user
        router.push('/rooms')
      } catch (err) {
        this.error = err.response?.data?.msg || 'Login failed'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchUser() {
      if (!this.token) return
      
      this.loading = true
      try {
        const res = await api.get('/api/auth/me')
        this.user = res.data
      } catch (err) {
        this.logout()
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      router.push('/login')
    },

    async updatePassword(passwordData) {
      try {
        const res = await api.put('/api/auth/password', passwordData)
        return res.data
      } catch (err) {
        throw err.response?.data?.msg || 'Failed to update password'
      }
    },

    async updateEmail(emailData) {
      try {
        const res = await api.put('/api/auth/email', emailData)
        // Update local user state
        if (this.user && res.data.email) {
          this.user.email = res.data.email
        }
        return res.data
      } catch (err) {
        throw err.response?.data?.msg || 'Failed to update email'
      }
    },

    async deleteAccount() {
      try {
        await api.delete('/api/auth/account')
        this.logout()
      } catch (err) {
        throw err.response?.data?.msg || 'Failed to delete account'
      }
    }
  }
})
