<template>
  <div class="my-rooms-content">
    <div class="header-section">
      <div class="title-area">
        <h1>My Rooms</h1>
        <p>Manage your active study groups and created rooms.</p>
      </div>
      
      <button @click="showCreateModal = true" class="create-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Create New Room
      </button>
    </div>

    <!-- Tabs -->
    <div class="tabs">
        <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'joined' }"
            @click="activeTab = 'joined'"
        >
            All Active
        </button>
        <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'created' }"
            @click="activeTab = 'created'"
        >
            Created by Me
        </button>
        <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'archived' }"
            disabled
            title="Coming Soon"
        >
            Archived
        </button>
    </div>

    <div v-if="roomStore.loading" class="loading-state">
      <div class="loader"></div>
    </div>

    <div v-else-if="roomStore.rooms.length === 0" class="empty-state">
      <h3>No rooms found</h3>
      <p v-if="activeTab === 'joined'">You haven't joined any rooms yet.</p>
      <p v-else>You haven't created any rooms yet.</p>
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

    <!-- Create/Edit Modal -->
    <CreateRoomModal 
      v-if="showCreateModal" 
      :edit-mode="!!editingRoom"
      :existing-room="editingRoom"
      @close="handleCloseModal"
      @created="handleRoomCreated"
      @updated="handleRoomUpdated"
    />

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
import { ref, onMounted, watch } from 'vue'
import { useRoomStore } from '../../stores/room'
import RoomCard from '../../components/RoomCard.vue'
import CreateRoomModal from '../../components/CreateRoomModal.vue'
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal.vue'

const roomStore = useRoomStore()
const showCreateModal = ref(false)
const activeTab = ref('joined')
const editingRoom = ref(null)
const showDeleteModal = ref(false)
const roomToDelete = ref(null)
const isDeleting = ref(false)

onMounted(() => {
  roomStore.fetchMyRooms(activeTab.value)
})

watch(activeTab, (newTab) => {
    roomStore.fetchMyRooms(newTab)
})

const handleRoomCreated = () => {
  roomStore.fetchMyRooms(activeTab.value)
}

const openEditModal = (room) => {
    editingRoom.value = room
    showCreateModal.value = true
}

const handleRoomUpdated = () => {
    roomStore.fetchMyRooms(activeTab.value)
    showCreateModal.value = false
    editingRoom.value = null
}

const handleCloseModal = () => {
    showCreateModal.value = false
    editingRoom.value = null
}

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
.my-rooms-content {
    width: 100%;
}
.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}
.title-area h1 {
    font-size: 1.875rem;
    font-weight: 800;
    color: #111827;
    margin-bottom: 0.5rem;
}
.title-area p {
    color: #6B7280;
}
.create-btn {
    background-color: #2563EB;
    color: white;
    border: none;
    padding: 0.625rem 1.25rem;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background-color 0.2s;
}
.create-btn:hover {
    background-color: #1D4ED8;
}

/* Tabs */
.tabs {
    display: flex;
    gap: 2rem;
    border-bottom: 1px solid #E5E7EB;
    margin-bottom: 2rem;
}
.tab-btn {
    background: none;
    border: none;
    padding: 0.75rem 0;
    font-size: 0.95rem;
    color: #6B7280;
    cursor: pointer;
    position: relative;
    font-weight: 500;
}
.tab-btn.active {
    color: #2563EB;
    font-weight: 600;
}
.tab-btn.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #2563EB;
}
.tab-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.rooms-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}
.loading-state {
    display: flex;
    justify-content: center;
    padding: 4rem 0;
}
.loader {
    border: 3px solid #f3f3f3;
    border-radius: 50%;
    border-top: 3px solid #2563EB;
    width: 24px;
    height: 24px;
    animation: spin 1s linear infinite;
}
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
.empty-state {
    text-align: center;
    padding: 4rem 0;
    color: #6B7280;
}
</style>
