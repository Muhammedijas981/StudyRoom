<template>
  <div class="profile-container">
    <div class="profile-header">
      <h1>My Profile</h1>
      <p>Manage your personal information and account preferences.</p>
    </div>

    <div v-if="authStore.loading && !authStore.user" class="loading-state">
      <div class="loader"></div>
    </div>

    <div v-else-if="authStore.user" class="profile-layout">
      <!-- Main Content -->
      <div class="main-content">
        <div class="card public-profile-card">
          <div class="card-header">
            <h2>Public Profile</h2>
            <p>This information will be displayed to other students.</p>
          </div>
          
          <div class="card-body">
            <!-- Profile Picture Section -->
            <div class="profile-picture-section">
              <div class="avatar-wrapper">
                <img 
                  :src="getAvatarUrl(authStore.user.avatar_url, authStore.user.full_name)" 
                  alt="Profile Picture" 
                />
              </div>
              <div class="avatar-actions">
                <span class="label">Profile Picture</span>
                <div class="btn-group">
                  <button class="btn btn-outline" @click="triggerFileInput">Change</button>
                  <button class="btn btn-danger-outline" @click="removeAvatar">Remove</button>
                </div>
                <input 
                  type="file" 
                  ref="fileInput" 
                  accept="image/*" 
                  style="display: none" 
                  @change="handleAvatarUpload"
                />
              </div>
            </div>

            <!-- Form -->
            <form @submit.prevent="saveProfile" class="profile-form">
              <div class="form-row">
                <div class="form-group">
                  <label>First Name</label>
                  <input type="text" v-model="form.firstName" class="form-control" />
                </div>
                <div class="form-group">
                  <label>Last Name</label>
                  <input type="text" v-model="form.lastName" class="form-control" />
                </div>
              </div>

              <div class="form-group">
                <label>Email Address</label>
                <input type="email" :value="authStore.user.email" disabled class="form-control" />
              </div>

              <div class="form-group">
                <label>Major / Field of Study</label>
                <input type="text" v-model="form.major" class="form-control" placeholder="Computer Science & Engineering" />
              </div>

              <div class="form-group">
                <label>Bio</label>
                <textarea 
                  v-model="form.bio" 
                  class="form-control" 
                  rows="4" 
                  placeholder="Tell us about yourself..."
                  maxlength="200"
                ></textarea>
                <div class="char-count">{{ form.bio ? form.bio.length : 0 }}/200 characters</div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-outline" @click="resetForm">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="isSaving">
                  {{ isSaving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="sidebar">
        <!-- Overview Card -->
        <div class="card overview-card">
          <div class="card-header">
            <h2>Overview</h2>
            <p>Your study activity.</p>
          </div>
          <div class="stats-grid">
            <div class="stat-box">
              <span class="stat-value">{{ authStore.user.stats?.roomsJoined || 0 }}</span>
              <span class="stat-label">Rooms Joined</span>
            </div>
            <div class="stat-box">
              <span class="stat-value">{{ authStore.user.stats?.materialsShared || 0 }}</span>
              <span class="stat-label">Materials Shared</span>
            </div>
          </div>
        </div>

        <!-- Joined Rooms Card -->
        <div class="card joined-rooms-card">
          <div class="card-header">
            <h2>Joined Rooms</h2>
            <p>Recent study groups.</p>
          </div>
          <div class="rooms-list">
            <div v-for="room in authStore.user.joinedRooms" :key="room.id" class="room-item">
              <div class="room-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <div class="room-details">
                <span class="room-name">{{ room.name }}</span>
                <span class="room-members">{{ room.member_count }} members</span>
              </div>
            </div>
            <div v-if="!authStore.user.joinedRooms || authStore.user.joinedRooms.length === 0" class="empty-state">
              No rooms joined yet.
            </div>
          </div>
          <div class="card-footer" v-if="authStore.user.joinedRooms?.length > 0">
            <router-link to="/rooms" class="view-all-link">View all rooms →</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../utils/api'

const authStore = useAuthStore()
const fileInput = ref(null)
const isSaving = ref(false)
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const form = ref({
  firstName: '',
  lastName: '',
  major: '',
  bio: ''
})

const initForm = () => {
  if (authStore.user) {
    const fullName = authStore.user.full_name || ''
    const parts = fullName.split(' ')
    form.value.firstName = parts[0] || ''
    form.value.lastName = parts.slice(1).join(' ') || ''
    form.value.major = authStore.user.major || ''
    form.value.bio = authStore.user.bio || ''
  }
}

watch(() => authStore.user, () => {
  initForm()
}, { immediate: true })

const getAvatarUrl = (path, name) => {
    if (path) {
        if (path.startsWith('http')) return path
        return `${apiUrl}/${path}`
    }
    return `https://ui-avatars.com/api/?name=${name}&background=random&size=128`
}

onMounted(() => {
  if (!authStore.user || !authStore.user.stats) {
      authStore.fetchUser()
  }
})

const resetForm = () => {
  initForm()
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('avatar', file)

  try {
    await api.post('/api/auth/avatar', formData)
    // Refresh user data to get new avatar URL
    await authStore.fetchUser()
  } catch (err) {
    console.error('Avatar upload failed', err)
    alert('Failed to upload avatar')
  }
}

const removeAvatar = async () => {
    // Ideally we'd have an endpoint to remove the avatar explicitly
    // For now, maybe just alert or implement later if backend supports it
    alert("Remove functionality not implemented yet on backend.")
}

const saveProfile = async () => {
  isSaving.value = true
  try {
    const fullName = `${form.value.firstName} ${form.value.lastName}`.trim()
    
    await api.put('/api/auth/profile', {
      full_name: fullName,
      major: form.value.major,
      bio: form.value.bio
    })
    
    // Refresh user data
    await authStore.fetchUser()
    // alert('Profile updated successfully')
  } catch (err) {
    console.error('Profile update failed', err)
    alert('Failed to update profile')
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.profile-header {
  margin-bottom: 2rem;
}

.profile-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.profile-header p {
  color: #6B7280;
  font-size: 1rem;
}

.profile-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .profile-layout {
    grid-template-columns: 2fr 1fr;
  }
}

/* Card Styles */
.card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #F3F4F6;
}

.card-header h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.card-header p {
  font-size: 0.875rem;
  color: #6B7280;
}

.card-body {
  padding: 1.5rem;
}

/* Profile Picture Section */
.profile-picture-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.avatar-wrapper img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.avatar-actions .label {
  font-weight: 600;
  color: #111827;
  font-size: 0.9rem;
}

.btn-group {
  display: flex;
  gap: 0.75rem;
}

/* Form Styles */
.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .form-row {
    grid-template-columns: 1fr 1fr;
  }
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-control {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #111827;
  transition: border-color 0.2s;
  box-sizing: border-box; /* IMPORTANT */
}

.form-control:focus {
  outline: none;
  border-color: #2563EB;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.form-control:disabled {
  background-color: #F9FAFB;
  color: #6B7280;
}

.char-count {
  text-align: right;
  font-size: 0.75rem;
  color: #9CA3AF;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

/* Buttons */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #2563EB;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #1D4ED8;
}

.btn-primary:disabled {
  background-color: #93C5FD;
  cursor: not-allowed;
}

.btn-outline {
  background-color: white;
  border: 1px solid #D1D5DB;
  color: #374151;
}

.btn-outline:hover {
  background-color: #F9FAFB;
  border-color: #9CA3AF;
}

.btn-danger-outline {
  background-color: white;
  border: 1px solid #FECACA;
  color: #DC2626;
}

.btn-danger-outline:hover {
  background-color: #FEF2F2;
  border-color: #FCA5A5;
}

/* Sidebar Stats */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-box {
  background-color: #F9FAFB;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Joined Rooms List */
.rooms-list {
  display: flex;
  flex-direction: column;
}

.room-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #F3F4F6;
}

.room-item:last-child {
  border-bottom: none;
}

.room-icon {
  width: 32px;
  height: 32px;
  background-color: #EFF6FF;
  color: #2563EB;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
}

.room-details {
  display: flex;
  flex-direction: column;
}

.room-name {
  font-weight: 500;
  color: #111827;
  font-size: 0.9rem;
}

.room-members {
  font-size: 0.75rem;
  color: #6B7280;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #9CA3AF;
  font-size: 0.9rem;
}

.card-footer {
  padding: 1rem 1.5rem;
  background-color: #F9FAFB;
  border-top: 1px solid #E5E7EB;
}

.view-all-link {
  color: #2563EB;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
}

.view-all-link:hover {
  text-decoration: underline;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 4rem;
}

.loader {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2563EB;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
