<template>
  <div class="profile-container">
    <div v-if="authStore.loading" class="loading">Loading profile...</div>
    
    <div v-else-if="authStore.user" class="profile-card">
      <div class="profile-header">
        <div class="avatar-placeholder">
          {{ getInitials(authStore.user.full_name) }}
        </div>
        <h2>{{ authStore.user.full_name }}</h2>
        <p class="email">{{ authStore.user.email }}</p>
      </div>

      <div class="profile-details">
        <h3>Profile Details</h3>
        <p><strong>Member since:</strong> {{ formatDate(authStore.user.created_at) }}</p>
      </div>

      <div class="actions">
        <button @click="authStore.logout" class="logout-btn">Logout</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.fetchUser()
})

const getInitials = (name) => {
  return name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : 'USER'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 1rem;
}

.profile-card {
  background-color: var(--color-background-soft);
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.profile-header {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  background-color: #646cff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

h2 {
  margin: 0.5rem 0;
  color: var(--color-heading);
}

.email {
  color: #888;
  margin: 0;
}

.profile-details {
  text-align: left;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding: 1rem 0;
  margin: 1rem 0;
}

.actions {
  margin-top: 2rem;
}

.logout-btn {
  background-color: #ff4646;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #e03e3e;
}
</style>
