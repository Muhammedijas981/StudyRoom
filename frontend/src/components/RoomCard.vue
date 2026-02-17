<template>
  <div class="room-card" @mouseleave="showMenu = false">
    <div class="card-image" :style="{ backgroundImage: `url(${getRoomImage(room)})` }">
      <span class="topic-badge">{{ room.topic }}</span>
      <span v-if="isOwner" class="owner-badge">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
        Owner
      </span>
    </div>
    
    <div class="card-content">
      <div class="header-row">
        <h3>{{ room.name }}</h3>
        
        <!-- 3-dot Menu -->
        <div class="menu-container" v-if="isOwner">
            <button class="menu-btn" @click.prevent.stop="toggleMenu">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </button>
            
            <div v-if="showMenu" class="dropdown-menu">
                <button @click.prevent.stop="handleEdit" class="dropdown-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                </button>
                <button @click.prevent.stop="handleDelete" class="dropdown-item delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    Delete
                </button>
            </div>
        </div>
      </div>

      <p class="description">{{ room.description || 'Join this study group to collaborate and share resources.' }}</p>
      
      <div class="card-footer">
        <div class="members">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span>{{ room.current_members || 0 }} / {{ room.max_capacity }} Members</span>
        </div>
        <router-link :to="`/rooms/${room.id}`" class="join-btn" :class="{ 'enter-btn': room.is_member }">
            {{ room.is_member ? 'Enter Room' : 'Join Room' }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  room: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])

const authStore = useAuthStore()
const showMenu = ref(false)

const isOwner = computed(() => {
  return authStore.user && props.room.created_by === authStore.user.id
})

const toggleMenu = () => {
    showMenu.value = !showMenu.value
}

const handleEdit = () => {
    showMenu.value = false
    emit('edit', props.room)
}

const handleDelete = () => {
    showMenu.value = false
    emit('delete', props.room)
}

const getRoomImage = (room) => {
  if (room.cover_image) {
    return `http://localhost:5000/${room.cover_image}`;
  }
  
  // Fallback to topic-based images
  const lowerTopic = room.topic.toLowerCase();
  if (lowerTopic.includes('math')) return 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80';
  if (lowerTopic.includes('science') || lowerTopic.includes('chem')) return 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80';
  if (lowerTopic.includes('art') || lowerTopic.includes('design')) return 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80';
  if (lowerTopic.includes('lit') || lowerTopic.includes('history')) return 'https://images.unsplash.com/photo-1463320726281-696a413703b6?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80';
  if (lowerTopic.includes('tech') || lowerTopic.includes('code') || lowerTopic.includes('data')) return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80';
  
  return 'https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80';
}
</script>

<style scoped>
.room-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.room-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.card-image {
  height: 140px;
  background-color: #F3F4F6;
  background-size: cover;
  background-position: center;
  position: relative;
  border-bottom: 1px solid #F3F4F6;
}

.topic-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background-color: rgba(31, 41, 55, 0.75);
  color: white;
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  backdrop-filter: blur(4px);
}

.owner-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background-color: #3B82F6;
    color: white;
    padding: 0.25rem 0.625rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
    position: relative;
}

h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.4;
  margin: 0;
  flex: 1;
  padding-right: 0.5rem;
}

/* Menu Button Styles */
.menu-container {
    position: relative;
}

.menu-btn {
    background: transparent;
    border: none;
    color: #6B7280;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
}

.menu-btn:hover {
    background-color: #F3F4F6;
    color: #111827;
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid #E5E7EB;
    border-radius: 6px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    min-width: 120px;
    z-index: 10;
    padding: 0.25rem 0;
    overflow: hidden;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    text-align: left;
    background: none;
    border: none;
    font-size: 0.875rem;
    color: #374151;
    cursor: pointer;
}

.dropdown-item:hover {
    background-color: #F3F4F6;
}

.dropdown-item.delete {
    color: #DC2626;
}

.dropdown-item.delete:hover {
    background-color: #FEF2F2;
}


.description {
  color: #6B7280;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.members {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #6B7280;
  font-size: 0.85rem;
  font-weight: 500;
}

.join-btn {
  background-color: white;
  color: #374151;
  border: 1px solid #E5E7EB;
  padding: 0.375rem 0.875rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
}

.join-btn:hover {
  border-color: #D1D5DB;
  background-color: #F9FAFB;
}

.enter-btn {
    background-color: #EFF6FF;
    color: #2563EB;
    border-color: #BFDBFE;
}

.enter-btn:hover {
    background-color: #DBEAFE;
    color: #1D4ED8;
    border-color: #93C5FD;
}
</style>
