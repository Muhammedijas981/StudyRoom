<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import Sidebar from './components/Sidebar.vue'

const route = useRoute()
const authStore = useAuthStore()

const isAuthPage = computed(() => ['Login', 'Register', 'ForgotPassword'].includes(route.name))
</script>

<template>
  <!-- Authentication Pages (Full Screen) -->
  <div v-if="isAuthPage" class="auth-layout">
    <router-view></router-view>
  </div>

  <!-- Dashboard App Layout (Sidebar + Content) -->
  <div v-else class="dashboard-layout">
    <Sidebar v-if="authStore.isAuthenticated" />
    
    <!-- Navbar for non-authenticated home page or public pages if any -->
    <header v-else class="navbar">
      <div class="brand">
        <router-link to="/">Maxemo Study Room</router-link>
      </div>
      <nav>
        <router-link to="/rooms">Browse Rooms</router-link>
        <router-link to="/login">Login</router-link>
        <router-link to="/register" class="nav-cta">Register</router-link>
      </nav>
    </header>

    <main :class="{ 'with-sidebar': authStore.isAuthenticated }">
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
}

.dashboard-layout {
  min-height: 100vh;
  background-color: #FFFFFF;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  border-bottom: 1px solid #E5E7EB;
}

.brand a {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2563EB;
  text-decoration: none;
}

nav {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

nav a {
  text-decoration: none;
  color: #374151;
  font-weight: 500;
}

.nav-cta {
  background-color: #2563EB;
  color: white !important;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

main {
  padding: 2rem;
}

main.with-sidebar {
  margin-left: 260px; /* Width of sidebar */
  padding: 2rem 3rem;
  max-width: 1400px;
}
</style>
