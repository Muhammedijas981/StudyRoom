<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="brand-header">
        <div class="logo-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10v6"/><path d="M2 16h20"/><path d="M12 22a10 10 0 0 1-10-10H0a12 12 0 0 0 12 12v0a12 12 0 0 0 12-12h-2a10 10 0 0 1-10 10Z"/><path d="m12 2 4 7h-8z"/></svg>
        </div>
        <h1 class="brand-name">Maxemo</h1>
      </div>
      <h2>Welcome back</h2>
      <p class="subtitle">Enter your credentials to access your account</p>
      
      <form @submit.prevent="handleLogin" class="auth-form">
        <div v-if="authStore.error" class="error-msg">{{ authStore.error }}</div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            id="email" 
            v-model="email" 
            type="email" 
            required 
            placeholder="student@maxemo.edu"
          >
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input 
            id="password" 
            v-model="password" 
            type="password" 
            required 
            placeholder="••••••••••"
          >
        </div>

        <div class="form-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="rememberMe">
            <span>Remember me</span>
          </label>
          <router-link to="/forgot-password" class="forgot-link">Forgot password?</router-link>
        </div>

        <button type="submit" class="primary-btn" :disabled="authStore.loading">
          <span v-if="authStore.loading" class="loader"></span>
          <span v-else>Sign in</span>
        </button>

        <p class="signup-prompt">
          Don't have an account? <router-link to="/register">Sign up</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const rememberMe = ref(false)

const handleLogin = async () => {
  try {
    await authStore.login({
      email: email.value,
      password: password.value
    })
  } catch (e) {
    // Error handled in store
  }
}
</script>

<style scoped>
.auth-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #F9FAFB;
  padding: 1rem;
}

.brand-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.logo-box {
  width: 40px;
  height: 40px;
  background-color: #2563EB;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.brand-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.auth-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 440px;
}

h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  text-align: center;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6B7280;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

input {
  padding: 0.75rem 1rem;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #111827;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus {
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #374151;
  cursor: pointer;
}

.forgot-link {
  color: #2563EB;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.primary-btn {
  background-color: #2563EB;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 46px;
}

.primary-btn:hover {
  background-color: #1D4ED8;
}

.primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #9CA3AF;
  font-size: 0.8rem;
  font-weight: 500;
  margin: 0.5rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #E5E7EB;
}

.divider span {
  padding: 0 1rem;
}

.social-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #E5E7EB;
  background-color: white;
  border-radius: 6px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s;
}

.social-btn:hover {
  background-color: #F9FAFB;
}

.signup-prompt {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #6B7280;
}

.signup-prompt a {
  color: #2563EB;
  text-decoration: none;
  font-weight: 600;
}

.error-msg {
  background-color: #FEF2F2;
  border: 1px solid #FECACA;
  color: #DC2626;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
}

/* Loader */
.loader {
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
