<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="brand-header">
        <div class="logo-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="brand-logo"><path d="M22 10v6M2 10v6"/><path d="M2 16h20"/><path d="M12 22a10 10 0 0 1-10-10H0a12 12 0 0 0 12 12v0a12 12 0 0 0 12-12h-2a10 10 0 0 1-10 10Z"/><path d="m12 2 4 7h-8z"/></svg>
        </div>
        <h1 class="brand-name">Maxemo</h1>
      </div>
      <h2>Reset password</h2>
      <p class="subtitle">Enter your email address and we'll send you a link to reset your password</p>
      
      <form @submit.prevent="handleReset" class="auth-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            id="email" 
            v-model="email" 
            type="email" 
            required 
            placeholder="name@example.com"
          >
        </div>

        <button type="submit" class="primary-btn" :disabled="loading">
          <span v-if="loading" class="loader"></span>
          <span v-else>Send reset link</span>
        </button>

        <div class="back-link">
          <router-link to="/login">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            Back to sign in
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const loading = ref(false)

const handleReset = async () => {
  loading.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))
  alert('Reset link sent (simulation)')
  loading.value = false
}
</script>

<style scoped>
/* Scoped styles are handled in global css or copied from Login/Register to keep it consistent. 
   I will define common layout styles in a separate update or keep them self-contained here to match the design. */
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
  line-height: 1.5;
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

.back-link {
  text-align: center;
  margin-top: 1rem;
}

.back-link a {
  color: #2563EB;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.back-link a:hover {
  text-decoration: underline;
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
