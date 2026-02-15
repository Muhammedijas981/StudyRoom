<template>
  <div class="room-card">
    <div class="card-image" :style="{ backgroundImage: `url(${getRoomImage(room)})` }">
      <span class="topic-badge">{{ room.topic }}</span>
      
      <button v-if="isOwner" @click.prevent="$emit('edit', room)" class="edit-icon-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button>
    </div>
    
    <div class="card-content">
      <h3>{{ room.name }}</h3>
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
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  room: {
    type: Object,
    required: true
  }
})

defineEmits(['edit'])

const authStore = useAuthStore()

const isOwner = computed(() => {
  return authStore.user && props.room.created_by === authStore.user.id
})

const getRoomImage = (room) => {
// ...
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

.card-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
  line-height: 1.4;
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

.edit-icon-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: rgba(255, 255, 255, 0.9);
  color: #4B5563;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 2;
}

.edit-icon-btn:hover {
  background-color: #2563EB;
  color: white;
}
</style>
