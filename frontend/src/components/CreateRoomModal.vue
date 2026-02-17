<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h2>{{ editMode ? 'Edit Study Room' : 'Create Study Room' }}</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <p class="modal-subtitle">Set up a space for students to collaborate</p>

      <form @submit.prevent="handleSubmit" class="create-form">
        <div v-if="localError" class="error-msg">{{ localError }}</div>

        <div class="form-group">
          <label for="name">Room Name</label>
          <input 
            id="name" 
            v-model="form.name" 
            type="text" 
            required 
            placeholder="e.g., Advanced Calculus Discussion"
          >
        </div>

        <div class="form-group">
          <label for="topic">Topic / Subject</label>
          <div class="topic-input-wrapper">
             <input 
              id="topic" 
              v-model="form.topic" 
              type="text" 
              required 
              placeholder="e.g., Mathematics"
            >
          </div>
        </div>

        <div class="form-row">
            <div class="form-group half">
            <label for="capacity">Max Students (2-50)</label>
            <input 
                id="capacity" 
                v-model="form.max_capacity" 
                type="number" 
                min="2" 
                max="50"
                required
            >
            </div>
            
            <div class="form-group half">
            <label for="cover_image">Cover Image <span class="optional">(Max 10MB)</span></label>
            <input 
                id="cover_image" 
                type="file" 
                accept="image/*"
                @change="handleFileChange"
            >
            </div>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea 
            id="description" 
            v-model="form.description" 
            rows="3" 
            placeholder="What will this room focus on?"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="$emit('close')">Cancel</button>
          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="loading" class="loader"></span>
            <span v-else>{{ editMode ? 'Update Room' : 'Create Room' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { useRoomStore } from '../stores/room'

const props = defineProps({
    editMode: Boolean,
    existingRoom: Object
})

const emit = defineEmits(['close', 'created', 'updated'])
const roomStore = useRoomStore()
const loading = ref(false)
const localError = ref(null)

const form = reactive({
  name: '',
  topic: '',
  description: '',
  max_capacity: 10,
  cover_image: null
})

// Populate form if in edit mode
watch(() => props.existingRoom, (newVal) => {
    if (newVal && props.editMode) {
        form.name = newVal.name || ''
        form.topic = newVal.topic || ''
        form.description = newVal.description || ''
        form.max_capacity = newVal.max_capacity || 10
        // cover_image remains null unless changed
    }
}, { immediate: true })

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      localError.value = 'File size exceeds 10MB limit.'
      e.target.value = '' // Reset input
      return
    }
    form.cover_image = file
  }
}

const handleSubmit = async () => {
  localError.value = null
  
  // Frontend Validation for Capacity
  if (form.max_capacity < 2 || form.max_capacity > 50) {
      localError.value = 'Max capacity must be between 2 and 50 students.'
      return
  }

  loading.value = true
  try {
    if (props.editMode && props.existingRoom) {
        await roomStore.updateRoom(props.existingRoom.id, form)
        emit('updated')
    } else {
        await roomStore.createRoom(form)
        emit('created')
    }
    emit('close')
  } catch (err) {
    localError.value = roomStore.error || 'Failed to save room'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  color: #9CA3AF;
  cursor: pointer;
  padding: 0;
}

.close-btn:hover {
  color: #4B5563;
}

.modal-subtitle {
  color: #6B7280;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
    display: flex;
    flex-direction: column; /* Stack on mobile */
    gap: 1.25rem;
}

@media (min-width: 640px) {
    .form-row {
        flex-direction: row;
        gap: 1rem;
    }
}

.form-group.half {
    flex: 1;
}

label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.optional {
    color: #9CA3AF;
    font-weight: 400;
    font-size: 0.8rem;
}

input, textarea {
  padding: 0.625rem 0.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}

input:focus, textarea:focus {
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

.cancel-btn {
  padding: 0.625rem 1rem;
  background-color: white;
  border: 1px solid #E5E7EB;
  color: #374151;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  background-color: #F9FAFB;
}

.submit-btn {
  background-color: #2563EB;
  color: white;
  border: none;
  padding: 0.625rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  min-width: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background-color: #1D4ED8;
}

.error-msg {
  background-color: #FEF2F2;
  color: #DC2626;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  text-align: center;
}

.loader {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-bottom-color: transparent;
  border-radius: 50%;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
