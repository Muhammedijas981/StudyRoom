<template>
  <div class="saved-materials-page">
    <div class="header-section">
      <div class="title-area">
        <h1>Saved Materials</h1>
        <p>Access and manage your bookmarked study resources.</p>
      </div>
      <button v-if="roomStore.savedMaterials.length > 0" @click="confirmClearAll" class="btn-clear">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        Clear All
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="controls-section">
      <div class="search-bar">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search filenames..."
          @input="handleSearch"
        >
      </div>
      
      <div class="filters">
        <button 
          v-for="filter in filters" 
          :key="filter.id"
          class="filter-btn"
          :class="{ active: activeFilter === filter.id }"
          @click="activeFilter = filter.id"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="roomStore.loading" class="loading-state">
      <div class="loader"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredMaterials.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
      </div>
      <h3>No saved materials found</h3>
      <p>Materials you bookmark from rooms will appear here.</p>
    </div>

    <!-- Materials Grid -->
    <div v-else class="materials-grid">
      <div v-for="material in filteredMaterials" :key="material.id" class="material-card" @mouseleave="activeMenu = null">
        <div class="card-header">
           <div class="file-icon" :class="getFileIconClass(material.file_name)">
             <!-- PDF Icon -->
             <svg v-if="isPdf(material.file_name)" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
             <!-- Image Icon -->
             <svg v-else-if="isImage(material.file_name)" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
             <!-- Default File Icon -->
             <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
           </div>
           
           <!-- Menu -->
           <div class="menu-container">
               <button class="menu-btn" @click.stop="toggleMenu(material.id)">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
               </button>
               <div v-if="activeMenu === material.id" class="dropdown-menu">
                   <button @click="removeMaterial(material.id)" class="dropdown-item delete">
                       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                       Remove from Saved
                   </button>
               </div>
           </div>
        </div>
        
        <div class="card-body">
            <h3 class="file-name" :title="material.file_name">{{ material.file_name }}</h3>
            <p class="room-source">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                Saved from {{ material.room_name }}
            </p>
        </div>
        
        <div class="card-footer">
            <span class="meta-info">{{ formatSize(material.file_size) }} • {{ formatDate(material.saved_at) }}</span>
            <a :href="`http://localhost:5000/${material.file_path}`" download target="_blank" class="download-btn" title="Download">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoomStore } from '../stores/room'

const roomStore = useRoomStore()
const searchQuery = ref('')
const activeFilter = ref('all')
const activeMenu = ref(null)

const filters = [
    { id: 'all', label: 'All Files' },
    { id: 'pdf', label: 'PDFs' },
    { id: 'image', label: 'Images' },
     // { id: 'link', label: 'Links' } // Disabled until backend supports links
]

// Implement simple debounce manually if lodash not available
const handleSearch = () => {
    // Basic search filtering happens on client for now OR trigger fetch
    // Store implementation actually fetches with search query.
    // So we should debounce the fetch.
    debouncedFetch()
}

let timeout
const debouncedFetch = () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
        roomStore.fetchSavedMaterials(searchQuery.value)
    }, 300)
}

onMounted(() => {
    roomStore.fetchSavedMaterials()
})

const filteredMaterials = computed(() => {
    // If backend handles search, we rely on roomStore.savedMaterials which is already filtered by search.
    // But we need to filter by TYPE locally.
    let list = roomStore.savedMaterials
    
    // Client-side filtering for file type
    if (activeFilter.value === 'pdf') {
        list = list.filter(m => m.file_name.toLowerCase().endsWith('.pdf'))
    } else if (activeFilter.value === 'image') {
        list = list.filter(m => /\.(jpg|jpeg|png|gif|webp)$/i.test(m.file_name))
    }
    
    return list
})

const toggleMenu = (id) => {
    if (activeMenu.value === id) {
        activeMenu.value = null
    } else {
        activeMenu.value = id
    }
}

const confirmClearAll = async () => {
    if (confirm('Are you sure you want to clear all saved materials?')) {
        await roomStore.clearSavedMaterials()
    }
}

const removeMaterial = async (id) => {
    try {
        await roomStore.toggleSaveMaterial(id)
        activeMenu.value = null
    } catch (err) {
        console.error(err)
    }
}

// Helpers
const isPdf = (name) => name.toLowerCase().endsWith('.pdf')
const isImage = (name) => /\.(jpg|jpeg|png|gif|webp)$/i.test(name)

const getFileIconClass = (name) => {
    if (isPdf(name)) return 'icon-pdf'
    if (isImage(name)) return 'icon-image'
    return 'icon-default'
}

const formatSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    // Simple format: "Oct 12" or "2 days ago"
    // Let's use simple date string for now
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.saved-materials-page {
    width: 100%;
    padding-bottom: 2rem;
}

/* Mobile First Header */
.header-section {
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column; /* Stack on mobile */
    gap: 1.5rem;
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

.btn-clear {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: 1px solid #E5E7EB;
    border-radius: 6px;
    background-color: white;
    color: #6B7280;
    cursor: pointer;
    font-weight: 500;
    font-size: 1rem;
    width: 100%; /* Full width */
    transition: all 0.2s;
}

.btn-clear:hover {
    background-color: #FEE2E2;
    color: #DC2626;
    border-color: #FCA5A5;
}

/* Mobile Controls */
.controls-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
}

.search-bar {
    position: relative;
    width: 100%;
}

.search-bar input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.75rem;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: all 0.2s;
}

.search-bar input:focus {
    outline: none;
    border-color: #2563EB;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9CA3AF;
}

.filters {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    width: 100%;
}

.filter-btn {
    flex: 1;
    background: white;
    border: 1px solid #E5E7EB;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    color: #6B7280;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
    text-align: center;
    min-width: 80px;
}

.filter-btn:hover {
    background-color: #F3F4F6;
    color: #111827;
}

.filter-btn.active {
    background-color: #EFF6FF;
    color: #2563EB;
    border-color: #BFDBFE;
}

/* Materials Grid */
.materials-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}

.material-card {
    background: white;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    padding: 1.25rem;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
}

.material-card:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
}

.file-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.icon-pdf { background-color: #FEF2F2; color: #DC2626; }
.icon-image { background-color: #FFF7ED; color: #EA580C; }
.icon-default { background-color: #EFF6FF; color: #2563EB; }

.menu-container { position: relative; }

.menu-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #9CA3AF;
    padding: 4px;
    border-radius: 4px;
}

.menu-btn:hover { background-color: #F3F4F6; color: #4B5563; }

.dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid #E5E7EB;
    border-radius: 6px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    min-width: 160px;
    z-index: 10;
    padding: 0.25rem 0;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem 1rem;
    text-align: left;
    background: none;
    border: none;
    font-size: 0.875rem;
    cursor: pointer;
}

.dropdown-item:hover { background-color: #F3F4F6; }
.dropdown-item.delete { color: #DC2626; }

.card-body {
    flex: 1;
    margin-bottom: 1rem;
}

.file-name {
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.5rem 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.room-source {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.8rem;
    color: #6B7280;
    margin: 0;
}

.room-source svg { color: #9CA3AF; }

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid #F3F4F6;
}

.meta-info {
    font-size: 0.8rem;
    color: #9CA3AF;
}

.download-btn {
    color: #3B82F6;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s;
}

.download-btn:hover {
    background-color: #EFF6FF;
    color: #2563EB;
}

.loading-state, .empty-state {
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

/* Desktop Overrides */
@media (min-width: 640px) {
    .header-section {
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
    }
    
    .title-area h1 {
        font-size: 1.875rem;
    }
    
    .btn-clear {
        width: auto;
        font-size: 0.9rem;
        padding: 0.5rem 1rem;
    }
    
    .controls-section {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
    }
    
    .search-bar {
        max-width: 400px;
        flex: 1;
    }
    
    .filter-btn {
        flex: 0 0 auto;
        border: none;
        background: none;
    }
    
    .filter-btn.active {
        border: none;
    }
    
    .materials-grid {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
    }
}
</style>
