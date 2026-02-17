<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Delete Room</h2>
        <button class="btn-close" @click="$emit('close')">×</button>
      </div>
      
      <div class="modal-body">
        <p class="warning-text">
          Are you sure you want to delete <strong>{{ roomName }}</strong>? This action cannot be undone.
        </p>
        
        <div class="input-group">
          <label>Type "<strong>delete</strong>" to confirm:</label>
          <input 
            type="text" 
            v-model="confirmationText" 
            placeholder="delete"
            class="form-control"
            @keyup.enter="handleConfirm"
          >
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-outline" @click="$emit('close')">Cancel</button>
        <button 
          class="btn btn-danger" 
          :disabled="!isConfirmed || isProcessing"
          @click="handleConfirm"
        >
          {{ isProcessing ? 'Deleting...' : 'Delete Room' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  roomName: {
    type: String,
    required: true
  },
  isProcessing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'confirm'])

const confirmationText = ref('')

const isConfirmed = computed(() => {
  return confirmationText.value.toLowerCase() === 'delete'
})

const handleConfirm = () => {
  if (isConfirmed.value && !props.isProcessing) {
    emit('confirm')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #DC2626; /* Red for danger */
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6B7280;
  line-height: 1;
}

.modal-body {
  padding: 1.5rem;
}

.warning-text {
  color: #374151;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.input-group {
  margin-bottom: 1rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #374151;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-control:focus {
    outline: 2px solid #DC2626;
    border-color: #DC2626;
}

.modal-footer {
  padding: 1.5rem;
  background-color: #F9FAFB;
  border-top: 1px solid #E5E7EB;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-outline {
  background-color: white;
  border: 1px solid #D1D5DB;
  color: #374151;
}

.btn-outline:hover {
  background-color: #F3F4F6;
}

.btn-danger {
  background-color: #DC2626;
  color: white;
}

.btn-danger:hover {
  background-color: #B91C1C;
}

.btn-danger:disabled {
  background-color: #FCA5A5;
  cursor: not-allowed;
}
</style>
