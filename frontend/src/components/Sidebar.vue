<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10v6"/><path d="M2 16h20"/><path d="M12 22a10 10 0 0 1-10-10H0a12 12 0 0 0 12 12v0a12 12 0 0 0 12-12h-2a10 10 0 0 1-10 10Z"/><path d="m12 2 4 7h-8z"/></svg>
      </div>
      <span class="brand-name">Maxemo</span>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/rooms" class="nav-item" active-class="active">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
        Browse Rooms
      </router-link>
      <router-link to="/my-rooms" class="nav-item" active-class="active">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
        My Rooms
      </router-link>
      <router-link to="/saved-materials" class="nav-item" active-class="active">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        Saved Materials
      </router-link>
      <router-link to="/reported-materials" class="nav-item" active-class="active">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
        Reported Materials
      </router-link>

      <div class="nav-section-title">ACCOUNT</div>
      
      <router-link to="/profile" class="nav-item" active-class="active">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Profile
      </router-link>
      <router-link to="/settings" class="nav-item" active-class="active">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        Settings
      </router-link>
    </nav>

    <div class="user-footer" v-if="authStore.user">
      <div 
        class="avatar" 
        :style="authStore.user.avatar_url ? { backgroundImage: `url(${getAvatarUrl(authStore.user.avatar_url)})` } : {}"
        :class="{ 'has-image': authStore.user.avatar_url }"
      >
        <span v-if="!authStore.user.avatar_url">{{ getInitials(authStore.user.full_name) }}</span>
      </div>
      <div class="user-info">
        <div class="user-name">{{ authStore.user.full_name }}</div>
        <div class="user-email">{{ authStore.user.email }}</div>
      </div>
      <button @click="authStore.logout" class="logout-icon-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const getAvatarUrl = (path) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    return `http://localhost:5000/${path}`
}

const getInitials = (name) => {
  return name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : 'U'
}
</script>

<style scoped>

.sidebar {
  width: 260px;
  background-color: #F9FAFB;
  border-right: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  padding: 1.5rem 1rem;
  z-index: 50;
  transition: transform 0.3s ease-in-out;
  transform: translateX(-100%); /* Hidden by default on mobile */
}

/* Open state class (applied by parent) */
.sidebar.mobile-open {
  transform: translateX(0);
}

@media (min-width: 1024px) {
  .sidebar {
    transform: translateX(0); /* Always visible on large screens */
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
  padding: 0 0.5rem;
}

.logo-box {
  width: 32px;
  height: 32px;
  background-color: #2563EB;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-grow: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  color: #4B5563;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.nav-item:hover, .nav-item.active {
  background-color: #EFF6FF; /* Very light blue */
  color: #1D4ED8; /* Darker blue */
}

.nav-item.active {
  background-color: #2563EB;
  color: white;
}

.nav-section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9CA3AF;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  padding: 0 1rem;
  letter-spacing: 0.05em;
}

.user-footer {
  border-top: 1px solid #E5E7EB;
  padding-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 36px;
  height: 36px;
  background-color: #E5E7EB; 
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  background-size: cover;
  background-position: center;
}

.user-info {
  flex-grow: 1;
  overflow: hidden;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.8rem;
  color: #6B7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-icon-btn {
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
}

.logout-icon-btn:hover {
  color: #6B7280;
}
</style>
