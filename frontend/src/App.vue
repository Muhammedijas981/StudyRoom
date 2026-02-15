<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const isAuthPage = computed(() => ['Login', 'Register', 'ForgotPassword'].includes(route.name))
</script>

<template>
  <div class="app-container">
    <header v-if="!isAuthPage" class="navbar">
      <div class="brand">
        <router-link to="/">Maxemo Study Room</router-link>
      </div>
      <nav v-if="authStore.isAuthenticated">
        <router-link to="/profile">Profile</router-link>
        <button @click="authStore.logout" class="nav-logout">Logout</button>
      </nav>
      <nav v-else>
        <router-link to="/login">Login</router-link>
        <router-link to="/register" class="nav-cta">Register</router-link>
      </nav>
    </header>

    <main :class="{ 'no-padding': isAuthPage }">
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--color-background-soft);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.brand a {
  font-size: 1.5rem;
  font-weight: bold;
  color: #646cff;
  text-decoration: none;
}

nav {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

nav a {
  text-decoration: none;
  color: var(--color-text);
  font-weight: 500;
}

nav a:hover,
nav a.router-link-active {
  color: #646cff;
}

.nav-cta {
  background-color: #646cff;
  color: white !important;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-cta:hover {
  background-color: #535bf2;
}

.nav-logout {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.nav-logout:hover {
  border-color: #ff4646;
  color: #ff4646;
}

main {
  flex: 1;
  padding: 2rem;
}

main.no-padding {
  padding: 0;
}
</style>
