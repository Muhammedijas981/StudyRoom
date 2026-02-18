<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Report Material</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="modal-body">
        <p class="description">Please describe why you're reporting this material. Your report will be reviewed by moderators.</p>
        
        <div class="material-info">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span>{{ materialName }}</span>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="comment">Reason for reporting *</label>
            <textarea
              id="comment"
              v-model="comment"
              placeholder="Describe the issue (e.g., inappropriate content, copyright violation, spam...)"
              rows="5"
              maxlength="500"
              required
            ></textarea>
            <div class="char-count" :class="{ 'limit-warning': comment.length > 450 }">
              {{ comment.length }}/500 characters
            </div>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div v-if="success" class="success-message">
            {{ success }}
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="$emit('close')" :disabled="isSubmitting">
              Cancel
            </button>
            <button type="submit" class="btn-danger" :disabled="isSubmitting || comment.trim().length === 0">
              {{ isSubmitting ? 'Submitting...' : 'Submit Report' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../utils/api'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  materialId: {
    type: Number,
    required: true
  },
  materialName: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'reported'])

const authStore = useAuthStore()
const comment = ref('')
const isSubmitting = ref(false)
const error = ref('')
const success = ref('')

const handleSubmit = async () => {
  error.value = ''
  success.value = ''

  if (comment.value.trim().length === 0) {
    error.value = 'Please provide a reason for reporting'
    return
  }

  if (comment.value.length > 500) {
    error.value = 'Comment must be 500 characters or less'
    return
  }

  isSubmitting.value = true

  try {
    await api.post(
      `/api/rooms/materials/${props.materialId}/report`,
      { comment: comment.value }
    )

    success.value = 'Report submitted successfully. Thank you for helping keep our community safe.'
    
    setTimeout(() => {
      emit('reported')
      emit('close')
    }, 2000)
  } catch (err) {
    error.value = err.response?.data?.msg || 'Failed to submit report. Please try again.'
  } finally {
    isSubmitting.value = false
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
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #E5E7EB;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #6B7280;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #F3F4F6;
  color: #111827;
}

.modal-body {
  padding: 1.5rem;
}

.description {
  color: #6B7280;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.material-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  color: #374151;
  font-size: 0.9rem;
}

.material-info svg {
  color: #6B7280;
  flex-shrink: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;
}

textarea:focus {
  outline: none;
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.char-count {
  text-align: right;
  font-size: 0.8rem;
  color: #6B7280;
  margin-top: 0.5rem;
}

.char-count.limit-warning {
  color: #DC2626;
  font-weight: 500;
}

.error-message {
  padding: 0.75rem 1rem;
  background-color: #FEE2E2;
  color: #B91C1C;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.success-message {
  padding: 0.75rem 1rem;
  background-color: #D1FAE5;
  color: #047857;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-secondary {
  padding: 0.625rem 1.25rem;
  background-color: white;
  border: 1px solid #D1D5DB;
  color: #374151;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #F9FAFB;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger {
  padding: 0.625rem 1.25rem;
  background-color: #DC2626;
  border: none;
  color: white;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover:not(:disabled) {
  background-color: #B91C1C;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
