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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          Filters
        </button>
        
        <div v-if="showFilters" class="filter-menu">
            <div 
                v-for="topic in topics" 
                :key="topic" 
                class="filter-option"
                @click="selectFilter(topic)"
            >
                {{ topic }}
            </div>
        </div>
      </div>

      <div v-if="selectedFilter" class="active-filter-tag">
        {{ selectedFilter }}
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
const selectedFilter = ref(null)
const topics = ['Computer Science', 'Mathematics', 'Physics', 'History', 'Literature', 'Art', 'Biology']

let searchTimeout = null

const editingRoom = ref(null)

onMounted(() => {
  roomStore.fetchRooms()
})

const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    roomStore.fetchRooms(searchQuery.value)
  }, 300)
}

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const selectFilter = (topic) => {
  selectedFilter.value = topic
  showFilters.value = false
  roomStore.fetchRooms(topic) 
}

const clearFilter = () => {
  selectedFilter.value = null
  roomStore.fetchRooms(searchQuery.value)
}

const handleRoomCreated = () => {
  // roomStore.fetchRooms() // Optional
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

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.title-area h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.title-area p {
  color: #6B7280;
  font-size: 1rem;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #2563EB;
  color: white;
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: background-color 0.2s;
  border: none;
  cursor: pointer;
}

.create-btn:hover {
  background-color: #1D4ED8;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 480px;
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

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: white;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  color: #374151;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
}

.filter-btn:hover {
  background-color: #F9FAFB;
}

.active-filter-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #EFF6FF;
  color: #2563EB;
  padding: 0.375rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.filter-dropdown-wrapper {
  position: relative;
}

.filter-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-top: 0.5rem;
  z-index: 50;
  min-width: 180px;
  max-height: 300px;
  overflow-y: auto;
}

.filter-option {
  padding: 0.75rem 1rem;
  cursor: pointer;
  color: #374151;
  font-size: 0.9rem;
}

.filter-option:hover {
  background-color: #F3F4F6;
  color: #2563EB;
}

.close-tag {
  background: none;
  border: none;
  color: #60A5FA;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  display: flex;
  align-items: center;
}

.close-tag:hover {
  color: #2563EB;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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
</style>
