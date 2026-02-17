<template>
  <div class="reported-materials-page">
    <div class="header-section">
      <div class="title-area">
        <h1>Reported Materials</h1>
        <p>Review and manage materials that have been flagged by users.</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loader"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="materials.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
      </div>
      <h3>No reported materials</h3>
      <p>Materials that are reported by users will appear here.</p>
    </div>

    <!-- Materials List -->
    <div v-else class="materials-list">
      <div v-for="material in materials" :key="material.id" class="material-card">
        <div class="card-header">
          <div class="file-info">
            <div class="file-icon" :class="getFileIconClass(material.file_name)">
              <svg v-if="isPdf(material.file_name)" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <svg v-else-if="isImage(material.file_name)" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
            </div>
            <div>
              <h3 class="file-name">{{ material.file_name }}</h3>
              <div class="file-meta">
                <span>{{ material.room_name }}</span>
                <span>•</span>
                <span>Uploaded by {{ material.uploader_name || 'Unknown' }}</span>
                <span>•</span>
                <span>{{ formatSize(material.file_size) }}</span>
              </div>
            </div>
          </div>
          <div class="report-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
            {{ material.report_count }} {{ material.report_count === '1' ? 'Report' : 'Reports' }}
          </div>
        </div>

        <div class="reports-section">
          <h4>Reports:</h4>
          <div class="reports-list">
            <div v-for="report in material.reports" :key="report.id" class="report-item">
              <div class="report-header">
                <span class="reporter-name">{{ report.reporter_name }}</span>
                <span class="report-date">{{ formatDate(report.created_at) }}</span>
              </div>
              <p class="report-comment">{{ report.comment }}</p>
            </div>
          </div>
        </div>

        <div class="card-actions">

          <button class="btn-danger" @click="confirmDelete(material)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Delete Material
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const materials = ref([])
const loading = ref(false)

const fetchReportedMaterials = async () => {
  loading.value = true
  try {
    const res = await axios.get('http://localhost:5000/api/rooms/materials/reported/all', {
      headers: { 'x-auth-token': authStore.token }
    })
    materials.value = res.data
  } catch (err) {
    console.error('Failed to fetch reported materials:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchReportedMaterials()
})

const isPdf = (name) => name.toLowerCase().endsWith('.pdf')
const isImage = (name) => /\.(jpg|jpeg|png|gif|webp)$/i.test(name)

const getFileIconClass = (name) => {
  if (isPdf(name)) return 'icon-pdf'
  if (isImage(name)) return 'icon-image'
  return 'icon-default'
}

const formatSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const confirmDelete = (material) => {
  if (confirm(`Are you sure you want to delete "${material.file_name}"? This action cannot be undone.`)) {
    // TODO: Implement delete functionality
    alert('Delete functionality would be implemented here')
  }
}
</script>

<style scoped>
.reported-materials-page {
  width: 100%;
  padding-bottom: 2rem;
}

.header-section {
  margin-bottom: 2rem;
}

.title-area h1 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 0.5rem;
}

.title-area p {
  color: #6B7280;
  font-size: 0.95rem;
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

.empty-state {
  text-align: center;
  padding: 4rem 0;
}

.empty-icon {
  margin-bottom: 1rem;
  color: #D1D5DB;
}

.empty-state h3 {
  margin-bottom: 0.5rem;
  color: #374151;
}

.empty-state p {
  color: #6B7280;
}

.materials-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.material-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.2s;
}

.material-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Mobile First Card Header */
.card-header {
  display: flex;
  flex-direction: column; /* Stack on mobile */
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #F3F4F6;
}

.file-info {
  display: flex;
  flex-direction: column; /* Stack icon and text */
  gap: 1rem;
  flex: 1;
}

.file-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: flex-start;
}

.icon-pdf { background-color: #FEF2F2; color: #DC2626; }
.icon-image { background-color: #FFF7ED; color: #EA580C; }
.icon-default { background-color: #EFF6FF; color: #2563EB; }

.file-name {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.file-meta {
  font-size: 0.875rem;
  color: #6B7280;
  display: flex;
  flex-wrap: wrap; /* Wrap on mobile */
  gap: 0.5rem;
  line-height: 1.4;
}

.report-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #FEE2E2;
  color: #DC2626;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  align-self: flex-start; /* Don't stretch */
}

.reports-section {
  margin-bottom: 1.5rem;
}

.reports-section h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.report-item {
  background-color: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 1rem;
}

.report-header {
  display: flex;
  flex-direction: column; /* Stack name/date on mobile if needed, but row usually fits */
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.reporter-name {
  font-weight: 600;
  color: #111827;
  font-size: 0.9rem;
}

.report-date {
  font-size: 0.8rem;
  color: #6B7280;
}

.report-comment {
  color: #374151;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-danger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-decoration: none;
  background-color: #DC2626;
  color: white;
  width: 100%; /* Full width button */
}

.btn-danger:hover {
  background-color: #B91C1C;
}

/* Desktop Overrides */
@media (min-width: 640px) {
  .title-area h1 {
    font-size: 1.875rem;
  }

  .material-card {
    padding: 1.5rem;
  }

  .card-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
  
  .file-info {
    flex-direction: row;
    align-items: flex-start;
  }
  
  .file-name {
    margin-bottom: 0.25rem;
  }
  
  .report-badge {
    align-self: auto;
  }
  
  .report-header {
    flex-direction: row;
    align-items: center;
  }
  
  .btn-danger {
    width: auto;
    padding: 0.625rem 1.25rem;
  }
}
</style>
