<template>
  <div v-if="localRoom" class="room-details-container">
    <!-- Header Section -->
    <div class="room-header">
      <div class="header-content">
        <div class="breadcrumbs">
          <router-link to="/rooms" class="crumb-link">Rooms</router-link>
          <span class="separator">›</span>
          <span class="crumb-current">{{ localRoom.topic }}</span>
        </div>
        
        <div class="title-row">
          <div class="title-left">
              <h1>{{ localRoom.name }}</h1>
              <span class="topic-badge">{{ localRoom.topic }}</span>
          </div>
          
          <div class="action-buttons">
            <button class="btn btn-outline" style="border: 1px solid #E5E7EB;" @click="showMembersModal = true">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Members
            </button>
            
            <button 
                v-if="localRoom.is_member" 
                @click="openLeaveModal" 
                class="btn btn-danger-outline"
                :disabled="isProcessing"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Leave Room
            </button> 
            <button 
                v-else 
                @click="joinRoom" 
                class="btn btn-primary"
                :disabled="isProcessing || isFull"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                {{ isFull ? 'Full' : 'Join Room' }}
            </button>
          </div>
        </div>

        <div class="meta-row">
          <div class="members-info">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="users-icon"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span class="count-text">{{ localRoom.current_members }} / {{ localRoom.max_capacity }} Members</span>
            <div class="avatar-stack" v-if="localRoom.members && localRoom.members.length > 0">
              <img 
                v-for="member in localRoom.members.slice(0, 5)" 
                :key="member.id" 
                :src="getAvatarUrl(member)" 
                :alt="member.full_name" 
                :title="member.full_name"
              />
              <div v-if="localRoom.current_members > 5" class="more-avatars">+{{ localRoom.current_members - 5 }}</div>
            </div>

            <span class="separator-dot">•</span>

            <div class="date-info">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="clock-icon"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Created {{ formatDate(localRoom.created_at) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Materials Section -->
    <div class="materials-section">
      <h2>Shared Materials</h2>

      <!-- Upload Box -->
      <div class="upload-area" :class="{ 'disabled': isProcessing || !localRoom.is_member }" @click="triggerFileInput">
        <input 
            type="file" 
            ref="fileInput"
            accept=".pdf,.jpg,.jpeg,.png" 
            @change="handleFileUpload" 
            :disabled="isProcessing || !localRoom.is_member"
            style="display: none;"
        >
        <div class="upload-content">
          <div class="cloud-icon-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <h3>Click to upload PDF or Image</h3>
          <p>Support for PDF up to 25MB</p>
          <p v-if="!localRoom.is_member" style="color: red; font-size: 0.8rem; margin-top: 0.5rem;">Join room to upload</p>
        </div>
      </div>

      <!-- Materials List -->
      <div v-if="materials.length > 0" class="materials-list">
        <div v-for="file in materials" :key="file.id" class="material-card">
          <div class="file-icon red">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <div class="file-info">
            <div class="file-name">{{ file.file_name }}</div>
            <div class="file-meta">
              Uploaded by {{ file.uploaded_by_name }} · {{ formatDate(file.created_at) }} · {{ (file.file_size / 1024 / 1024).toFixed(2) }} MB
            </div>
          </div>
          <div class="file-actions">
            <button @click.prevent="toggleSave(file)" class="btn-icon" :title="file.is_saved ? 'Unsave' : 'Save'" style="margin-right: 0.5rem; background: none; border: none; cursor: pointer;">
                <svg v-if="file.is_saved" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#2563EB" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #6B7280;"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            </button>
            <button @click.prevent="openReportModal(file)" class="btn-icon" title="Report" style="margin-right: 0.5rem; background: none; border: none; cursor: pointer;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #DC2626;"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
            </button>
            <a href="#" @click.prevent="downloadFile(file)" class="btn-download">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download
            </a>
          </div>
        </div>
      </div>
      <div v-else class="empty-materials">
          <p>No materials uploaded yet.</p>
      </div>
    </div>
  </div>
  <div v-else class="loading-state">
    <div class="loader"></div>
  </div>

  <!-- Members Modal -->
  <div v-if="showMembersModal" class="modal-overlay" @click.self="showMembersModal = false">
      <div class="modal-content">
          <div class="modal-header">
              <h2>Room Members</h2>
              <button class="btn-close" @click="showMembersModal = false">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
          </div>
          <div class="modal-body">
              <div v-if="allMembers && allMembers.length > 0" class="members-list">
                  <div v-for="member in allMembers" :key="member.id" class="member-item">
                      <img 
                          :src="getAvatarUrl(member)" 
                          :alt="member.full_name" 
                          class="member-avatar"
                      />
                      <div class="member-details">
                          <span class="member-name">{{ member.full_name }}</span>
                      </div>
                  </div>
              </div>
              <div v-else class="empty-members">
                  No members yet.
              </div>
          </div>
      </div>
  </div>

  <ActionConfirmationModal
    v-if="showLeaveModal"
    title="Leave Room"
    :target-name="localRoom?.name"
    action-type="leave"
    required-text="leave"
    confirm-button-text="Leave Room"
    processing-text="Leaving..."
    variant="warning"
    :is-processing="isLeaving"
    @close="showLeaveModal = false"
    @confirm="handleLeaveConfirm"
  />

  <ReportMaterialModal
    v-if="showReportModal && materialToReport"
    :material-id="materialToReport.id"
    :material-name="materialToReport.file_name"
    @close="showReportModal = false"
    @reported="handleReportSubmitted"
  />
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRoomStore } from '../../stores/room'
import { useAuthStore } from '../../stores/auth' 
import axios from 'axios'
import ActionConfirmationModal from '../../components/ActionConfirmationModal.vue'
import ReportMaterialModal from '../../components/ReportMaterialModal.vue'

const route = useRoute()
const roomStore = useRoomStore()
const authStore = useAuthStore()
const localRoom = ref(null)
const isProcessing = ref(false)
const showMembersModal = ref(false)
const materials = ref([])
const fileInput = ref(null)
const showReportModal = ref(false)
const materialToReport = ref(null)

const isOwner = computed(() => {
    return localRoom.value && authStore.user && localRoom.value.created_by === authStore.user.id
})

const isFull = computed(() => {
    return localRoom.value && parseFloat(localRoom.value.current_members) >= localRoom.value.max_capacity
})

const allMembers = computed(() => {
    return localRoom.value?.members || []
})

const fetchMaterials = async (roomId) => {
    try {
        const config = authStore.token ? { headers: { 'x-auth-token': authStore.token } } : {}
        const res = await axios.get(`http://localhost:5000/api/rooms/${roomId}/materials`, config)
        materials.value = res.data
    } catch (err) {
        console.error('Failed to fetch materials', err)
    }
}

const toggleSave = async (file) => {
    try {
        if (!authStore.isAuthenticated) {
            alert('Please login to save materials.')
            return
        }
        const res = await roomStore.toggleSaveMaterial(file.id)
        if (materials.value) {
            const index = materials.value.findIndex(m => m.id === file.id)
            if (index !== -1) {
                materials.value[index].is_saved = res.is_saved
            }
        }
    } catch (err) {
        console.error('Failed to toggle save', err)
        alert('Failed to save material: ' + err.message)
    }
}

const triggerFileInput = () => {
    if (localRoom.value.is_member && !isProcessing.value) {
        fileInput.value.click()
    } else if (!localRoom.value.is_member) {
        alert('You must join the room to upload materials.')
    }
}

const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    // Check file size (25MB)
    if (file.size > 25 * 1024 * 1024) {
        alert('File size exceeds 25MB limit.')
        event.target.value = ''
        return
    }

    const formData = new FormData()
    formData.append('material', file)
    
    isProcessing.value = true
    try {
        await axios.post(`http://localhost:5000/api/rooms/${localRoom.value.id}/materials`, formData, {
            headers: {
                'x-auth-token': authStore.token,
                'Content-Type': 'multipart/form-data'
            }
        })
        await fetchMaterials(localRoom.value.id)
    } catch (err) {
        console.error('Upload failed', err)
        alert('Upload failed: ' + (err.response?.data?.msg || err.message))
    } finally {
        isProcessing.value = false
        event.target.value = ''
    }
}

const downloadFile = async (file) => {
    try {
        const response = await axios.get(`http://localhost:5000/${file.file_path}`, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', file.file_name); 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Also open preview in new tab
        window.open(`http://localhost:5000/${file.file_path}`, '_blank');
        
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
        console.error('Download failed:', error);
        window.open(`http://localhost:5000/${file.file_path}`, '_blank');
    }
}

const openReportModal = (file) => {
    materialToReport.value = file
    showReportModal.value = true
}

const handleReportSubmitted = () => {
    // Optional: Could show a success notification here
    showReportModal.value = false
    materialToReport.value = null
}

const fetchRoomData = async () => {
    const roomId = route.params.id
    if (roomId) {
        localRoom.value = await roomStore.getRoomById(roomId)
        await fetchMaterials(roomId)
    }
}

onMounted(async () => {
  await fetchRoomData()
})

const joinRoom = async () => {
    if (isFull.value) return
    isProcessing.value = true
    try {
        await roomStore.joinRoom(localRoom.value.id)
        await fetchRoomData()
    } catch (err) {
        console.error('Failed to join room', err)
        alert('Failed to join room: ' + (err.response?.data?.msg || err.message))
    } finally {
        isProcessing.value = false
    }
}

const leaveRoom = async () => {
    // Replaced by openLeaveModal
}

// Leave Modal Logic
const showLeaveModal = ref(false)
const isLeaving = ref(false)

const openLeaveModal = () => {
    showLeaveModal.value = true
}

const handleLeaveConfirm = async () => {
    isLeaving.value = true
    try {
        await roomStore.leaveRoom(localRoom.value.id)
        showLeaveModal.value = false
        await fetchRoomData()
    } catch (err) {
        console.error('Failed to leave room', err)
        alert('Failed to leave room: ' + err.message)
    } finally {
        isLeaving.value = false
    }
}

const getAvatarUrl = (member) => {
    if (member.avatar_url) {
        if (member.avatar_url.startsWith('http')) {
            return member.avatar_url
        }
        return `http://localhost:5000/${member.avatar_url}`
    }
    return `https://ui-avatars.com/api/?name=${member.full_name}&background=random`
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
  })
}
</script>

<style scoped>
.room-details-container {
  width: 100%;
}

/* Header Styles */
.room-header {
  margin-bottom: 2rem;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6B7280;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.crumb-link {
  color: #6B7280;
  text-decoration: none;
}

.crumb-link:hover {
  text-decoration: underline;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

h1 {
  font-size: 2rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
}

.topic-badge {
  background-color: #EEF2FF;
  color: #4F46E5;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  background-color: white;
  transition: all 0.2s;
}

.btn-outline {
  border: 1px solid #E5E7EB;
  color: #374151;
}

.btn-outline:hover {
  background-color: #F9FAFB;
}

.btn-danger-outline {
  border: 1px solid #FECACA;
  color: #DC2626;
}

.btn-danger-outline:hover {
  background-color: #FEF2F2;
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

.meta-row {
  display: flex;
  align-items: center;
  color: #6B7280;
  font-size: 0.9rem;
  border-bottom: 1px solid #F3F4F6;
  padding-bottom: 1.5rem;
  margin-bottom: 0;
  flex-wrap: wrap; 
}

.members-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.users-icon {
  color: #9CA3AF;
}

.count-text {
  font-weight: 500;
}

.avatar-stack {
  display: flex;
  margin-left: 0.5rem;
}

.avatar-stack img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid white;
  margin-left: -8px;
  object-fit: cover;
}

.avatar-stack img:first-child {
  margin-left: 0;
}

.more-avatars {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid white;
  margin-left: -8px;
  background-color: #F3F4F6;
  color: #6B7280;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.clock-icon {
  color: #9CA3AF;
}

.divider {
  display: none;
}

.separator-dot {
    margin: 0 1rem;
    color: #D1D5DB;
    font-weight: bold;
}

/* Materials Section */
.materials-section h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.5rem;
}

.upload-area {
  background-color: #F9FAFB;
  border: 2px dashed #E5E7EB;
  border-radius: 8px;
  padding: 3rem;
  text-align: center;
  margin-bottom: 2rem;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

.upload-area:hover {
  border-color: #2563EB;
  background-color: #EFF6FF;
}

.cloud-icon-box {
  width: 48px;
  height: 48px;
  background-color: #EEF2FF;
  color: #2563EB;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.upload-content h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.upload-content p {
  color: #6B7280;
  font-size: 0.9rem;
}

/* Materials List */
.materials-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.material-card {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background-color: white;
  transition: box-shadow 0.2s;
}

.material-card:hover {
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.file-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.file-icon.red {
  background-color: #FEF2F2;
  color: #DC2626;
}

.file-info {
  flex-grow: 1;
}

.file-name {
  font-weight: 600;
  color: #111827;
  font-size: 0.95rem;
  margin-bottom: 0.2rem;
}

.file-meta {
  font-size: 0.85rem;
  color: #6B7280;
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-download {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  background-color: white;
  color: #374151;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-download:hover {
  background-color: #F9FAFB;
  border-color: #D1D5DB;
}

.btn-icon {
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
}

.btn-icon:hover {
  background-color: #F3F4F6;
  color: #6B7280;
}

.btn-icon.delete:hover {
  background-color: #FEF2F2;
  color: #DC2626;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 5rem;
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

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: white;
    border-radius: 12px;
    width: 100%;
    max-width: 500px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid #E5E7EB;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #111827;
    margin: 0;
}

.btn-close {
    background: none;
    border: none;
    cursor: pointer;
    color: #6B7280;
    padding: 0.5rem;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-close:hover {
    background-color: #F3F4F6;
    color: #374151;
}

.modal-body {
    padding: 1.5rem;
    overflow-y: auto;
}

.members-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.member-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem;
    border-radius: 8px;
    transition: background-color 0.2s;
}

.member-item:hover {
    background-color: #F9FAFB;
}

.member-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}

.member-name {
    font-weight: 500;
    color: #111827;
}

.empty-members {
    text-align: center;
    color: #6B7280;
    padding: 2rem;
}
</style>
