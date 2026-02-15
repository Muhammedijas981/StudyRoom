<template>
  <div class="create-room-container">
    <div class="form-card">
      <div class="form-header">
        <h1>Create Study Room</h1>
        <p>Set up a space for students to collaborate</p>
      </div>

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
          <input 
            id="topic" 
            v-model="form.topic" 
            type="text" 
            required 
            placeholder="e.g., Mathematics"
          >
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea 
            id="description" 
            v-model="form.description" 
            rows="4" 
            placeholder="What will this room focus on?"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="capacity">Max Capacity</label>
          <input 
            id="capacity" 
            v-model="form.max_capacity" 
            type="number" 
            min="2" 
            max="50"
            required
          >
          <span class="help-text">Limit between 2 and 50 members</span>
        </div>

        <div class="form-actions">
          <router-link to="/rooms" class="cancel-btn">Cancel</router-link>
          <button type="submit" class="submit-btn" :disabled="roomStore.loading">
            <span v-if="roomStore.loading" class="loader"></span>
            <span v-else>Create Room</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRoomStore } from '../../stores/room'

const router = useRouter()
const roomStore = useRoomStore()

const form = reactive({
  name: '',
  topic: '',
  description: '',
  max_capacity: 10
})

const localError = ref(null)

const handleSubmit = async () => {
  localError.value = null
  try {
    await roomStore.createRoom(form)
    router.push('/rooms')
  } catch (err) {
    localError.value = roomStore.error || 'Failed to create room'
  }
}
</script>

<style scoped>
.create-room-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 1rem;
}

.form-card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.form-header {
  margin-bottom: 2rem;
  text-align: center;
}

.form-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 0.5rem;
}

.form-header p {
  color: #6B7280;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

input, textarea {
  padding: 0.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

input:focus, textarea:focus {
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.help-text {
  font-size: 0.8rem;
  color: #6B7280;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  color: #4B5563;
  text-decoration: none;
  font-weight: 500;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  background-color: #F3F4F6;
}

.submit-btn {
  background-color: #2563EB;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  min-width: 140px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.submit-btn:hover {
  background-color: #1D4ED8;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-msg {
  background-color: #FEF2F2;
  color: #DC2626;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
}

.loader {
  width: 20px;
  height: 20px;
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
