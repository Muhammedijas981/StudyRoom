<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import Sidebar from './components/Sidebar.vue'

const route = useRoute()
const authStore = useAuthStore()
const isSidebarOpen = ref(false)

const isAuthPage = computed(() => ['Login', 'Register', 'ForgotPassword'].includes(route.name))

// Close sidebar on route navigate (mobile UX)
watch(() => route.path, () => {
    isSidebarOpen.value = false
})
</script>

<template>
  <!-- Authentication Pages (Full Screen) -->
  <div v-if="isAuthPage" class="auth-layout">
    <router-view></router-view>
  </div>

  <!-- Dashboard App Layout (Sidebar + Content) -->
  <div v-else class="dashboard-layout">
    <!-- Mobile Header (Visible on small screens only) -->
    <header class="mobile-header" v-if="authStore.isAuthenticated">
      <button class="menu-btn" @click="isSidebarOpen = true" aria-label="Menu">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <span class="mobile-brand">Maxemo</span>
    </header>

    <Sidebar 
        v-if="authStore.isAuthenticated" 
        :class="{ 'mobile-open': isSidebarOpen }"
    />
    
    <!-- Mobile Backdrop -->
    <div 
        v-if="isSidebarOpen && authStore.isAuthenticated" 
        class="sidebar-backdrop"
        @click="isSidebarOpen = false"
    ></div>

    <!-- Navbar for non-authenticated home page -->
    <header v-if="!authStore.isAuthenticated" class="navbar">
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

/* Mobile Header */
.mobile-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: white;
  border-bottom: 1px solid #E5E7EB;
  position: sticky;
  top: 0;
  z-index: 40;
}

.menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-brand {
    font-weight: bold;
    font-size: 1.25rem;
    color: #2563EB;
}

@media (min-width: 1024px) {
  .mobile-header {
    display: none;
  }
}

/* Navbar (Non-Auth) */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem; /* Reduced padding for mobile default */
  background-color: white;
  border-bottom: 1px solid #E5E7EB;
  flex-wrap: wrap; /* Allow wrapping on very small screens */
  gap: 1rem;
}

.brand a {
  font-size: 1.25rem; /* Slightly smaller for mobile */
  font-weight: bold;
  color: #2563EB;
  text-decoration: none;
}

nav {
  display: flex;
  gap: 1rem;
  align-items: center;
}

nav a {
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  font-size: 0.9rem;
}

.nav-cta {
  background-color: #2563EB;
  color: white !important;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
}

/* Main Content */
main {
  padding: 1rem; /* Default mobile padding */
}

main.with-sidebar {
  margin-left: 0; /* Default (Mobile) */
  padding: 1.5rem 1rem;
  max-width: 100%;
  transition: margin-left 0.3s ease;
}

@media (min-width: 1024px) {
  main.with-sidebar {
    margin-left: 260px; /* Desktop width */
    padding: 2rem 3rem;
    max-width: 1400px;
  }
  
  .navbar {
    padding: 1rem 2rem;
  }
  
  .brand a {
    font-size: 1.5rem;
  }
}

/* Backdrop */
.sidebar-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0,0,0,0.5);
    z-index: 45;
}

@media (min-width: 1024px) {
  .sidebar-backdrop {
    display: none;
  }
}
</style>
