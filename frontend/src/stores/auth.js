import { defineStore } from 'pinia'
import axios from 'axios'
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
        const res = await axios.post('http://localhost:5000/api/auth/register', userData)
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
        const res = await axios.post('http://localhost:5000/api/auth/login', credentials)
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
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { 'x-auth-token': this.token }
        })
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
    }
  }
})
