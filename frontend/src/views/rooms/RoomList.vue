<template>
  <div class="dashboard-content">
    <div class="header-section">
      <div class="title-area">
        <h1>Find a Study Room</h1>
        <p>Join a community to collaborate and share resources.</p>
      </div>
      
      <button @click="showCreateModal = true" class="create-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Create Room
      </button>
    </div>

    <!-- Rest of the code... -->

    <!-- Modal -->
    <CreateRoomModal 
      v-if="showCreateModal" 
      :edit-mode="!!editingRoom"
      :existing-room="editingRoom"
      @close="handleCloseModal"
      @created="handleRoomCreated"
      @updated="handleRoomUpdated"
    />

    <div class="filter-bar">
      <div class="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search by topic, room name, or keywords..."
          @input="handleSearch"
        >
      </div>
      
      <div class="filter-dropdown-wrapper">
        <button class="filter-btn" @click="toggleFilters">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M6 12h12M9 18h6"/></svg>
          Sort
        </button>
        
        <div v-if="showFilters" class="filter-menu">
            <div 
                v-for="option in sortOptions" 
                :key="option.value" 
                class="filter-option"
                :class="{ 'active-sort': selectedFilter === option.value }"
                @click="selectFilter(option.value)"
            >
                {{ option.label }}
            </div>
        </div>
      </div>

      <div v-if="selectedFilter && selectedFilter !== 'newest'" class="active-filter-tag">
        Sort: {{ getFilterLabel(selectedFilter) }}
        <button class="close-tag" @click="clearFilter">×</button>
      </div>
    </div>

    <div v-if="roomStore.loading" class="loading-state">
      <div class="loader"></div>
    </div>

    <div v-else-if="roomStore.rooms.length === 0" class="empty-state">
      <h3>No rooms found</h3>
      <p>Try clearing your filters or create a new room.</p>
    </div>

    <div v-else class="rooms-grid">
      <RoomCard 
        v-for="room in roomStore.rooms" 
        :key="room.id" 
        :room="room" 
        @edit="openEditModal"
        @delete="openDeleteModal"
      />
    </div>

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmationModal
      v-if="showDeleteModal"
      :room-name="roomToDelete?.name"
      :is-processing="isDeleting"
      @close="showDeleteModal = false"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoomStore } from '../../stores/room'
import RoomCard from '../../components/RoomCard.vue'
import CreateRoomModal from '../../components/CreateRoomModal.vue'
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal.vue'

const roomStore = useRoomStore()
const searchQuery = ref('')
const showCreateModal = ref(false)
const showFilters = ref(false)
const selectedFilter = ref('newest')
const sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' }
]

let searchTimeout = null

const editingRoom = ref(null)

onMounted(() => {
  roomStore.fetchRooms()
})

const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    roomStore.fetchRooms(searchQuery.value, selectedFilter.value)
  }, 300)
}

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const selectFilter = (value) => {
  selectedFilter.value = value
  showFilters.value = false
  roomStore.fetchRooms(searchQuery.value, value) 
}

const clearFilter = () => {
  selectedFilter.value = 'newest'
  roomStore.fetchRooms(searchQuery.value, 'newest')
}

const getFilterLabel = (value) => {
    const opt = sortOptions.find(o => o.value === value)
    return opt ? opt.label : value
}

const handleRoomCreated = () => {
  roomStore.fetchRooms(searchQuery.value, selectedFilter.value)
}

const openEditModal = (room) => {
    editingRoom.value = room
    showCreateModal.value = true
}

const handleRoomUpdated = () => {
    roomStore.fetchRooms(searchQuery.value) // Refresh list to show updates
    showCreateModal.value = false
    editingRoom.value = null
}

const handleCloseModal = () => {
    showCreateModal.value = false
    editingRoom.value = null
}

const showDeleteModal = ref(false)
const roomToDelete = ref(null)
const isDeleting = ref(false)

const openDeleteModal = (room) => {
    roomToDelete.value = room
    showDeleteModal.value = true
}

const handleDeleteConfirm = async () => {
    if (!roomToDelete.value) return
    
    isDeleting.value = true
    try {
        await roomStore.deleteRoom(roomToDelete.value.id)
        showDeleteModal.value = false
        roomToDelete.value = null
    } catch (err) {
        console.error('Delete failed:', err)
        alert('Failed to delete room: ' + err.message)
    } finally {
        isDeleting.value = false
    }
}
</script>

<style scoped>
.dashboard-content {
  width: 100%;
}

/* Mobile First Styles */
.header-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.title-area h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.title-area p {
  color: #6B7280;
  font-size: 0.95rem;
}

.create-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: #2563EB;
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: background-color 0.2s;
  border: none;
  cursor: pointer;
  width: 100%; /* Full width on mobile */
}

.create-btn:hover {
  background-color: #1D4ED8;
}

.filter-bar {
  display: flex;
  flex-direction: column; /* Stack on mobile */
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  flex: 1;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  font-size: 0.95rem;
  outline: none;
  background-color: white;
  transition: border-color 0.2s;
}

.search-box input:focus {
  border-color: #2563EB;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.filter-dropdown-wrapper {
  width: 100%;
}

.filter-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: white;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  color: #374151;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  width: 100%; /* Full width on mobile */
}

.filter-btn:hover {
  background-color: #F9FAFB;
}

.active-filter-tag {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  background-color: #EFF6FF;
  color: #2563EB;
  padding: 0.5rem 1rem;
  border-radius: 8px; /* Slightly softer radius */
  font-size: 0.875rem;
  font-weight: 500;
  width: 100%; /* Full width for better tap target */
}

.filter-menu {
  position: absolute;
  top: 100%;
  right: 0;
  left: 0; /* Full width dropdown on mobile */
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-top: 0.5rem;
  z-index: 50;
  max-height: 300px;
  overflow-y: auto;
}

.filter-option {
  padding: 1rem; /* Larger touch target */
  cursor: pointer;
  color: #374151;
  font-size: 0.95rem;
  text-align: center;
}

.filter-option:hover, .filter-option.active-sort {
  background-color: #F3F4F6;
  color: #2563EB;
}

.close-tag {
  background: none;
  border: none;
  color: #60A5FA;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
}

.close-tag:hover {
  color: #2563EB;
}

.rooms-grid {
  display: grid;
  grid-template-columns: 1fr; /* Single column default */
  gap: 1.5rem;
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
  padding: 3rem;
  color: #6B7280;
}

/* Tablet & Desktop Overrides */
@media (min-width: 640px) {
  .header-section {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .title-area h1 {
    font-size: 1.875rem;
  }
  
  .create-btn {
    width: auto;
    font-size: 0.9rem;
    padding: 0.625rem 1.25rem;
  }
  
  .filter-bar {
    flex-direction: row;
    align-items: center;
  }
  
  .filter-dropdown-wrapper {
    width: auto;
  }
  
  .filter-btn {
    width: auto;
  }
  
  .filter-menu {
    border-radius: 6px;
    min-width: 180px;
    left: auto; /* Reset left */
  }
  
  .filter-option {
    padding: 0.75rem 1rem;
    text-align: left;
    font-size: 0.9rem;
  }
  
  .rooms-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
  
  .active-filter-tag {
    width: auto;
    border-radius: 999px;
  }
}
</style>
