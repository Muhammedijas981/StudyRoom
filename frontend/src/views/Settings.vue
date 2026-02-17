<template>
  <div class="settings-page">
    <div class="header-section">
      <h1>Account Security</h1>
      <p>Manage your email, password, and account access.</p>
    </div>

    <!-- Change Email Section -->
    <div class="card">
        <h2>Change email address</h2>
        <p class="description">Update the email you use to sign in and receive notifications.</p>
        
        <form @submit.prevent="handleEmailUpdate">
            <div class="form-group">
                <label>Current email</label>
                <input type="email" :value="user?.email" disabled class="input disabled">
            </div>

            <div class="form-group">
                <label>New email</label>
                <input type="email" v-model="emailForm.newEmail" placeholder="Enter your new email" class="input">
            </div>

            <div class="form-group">
                <label>Confirm new email</label>
                <input type="email" v-model="emailForm.confirmEmail" placeholder="Re-enter your new email" class="input">
            </div>
            
            <p v-if="emailMsg" :class="['message', emailMsgType]">{{ emailMsg }}</p>

            <div class="form-actions">
                <button type="submit" class="btn-primary" :disabled="loading.email">
                   {{ loading.email ? 'Updating...' : 'Update Email' }}
                </button>
            </div>
        </form>
    </div>

    <!-- Password Section -->
    <div class="card">
        <h2>Password</h2>
        <p class="description">Change your password or send a reset link to your email.</p>

        <form @submit.prevent="handlePasswordUpdate">
            <div class="form-group">
                <label>Current password</label>
                <input type="password" v-model="passwordForm.currentPassword" placeholder="Enter current password" class="input">
            </div>

            <div class="form-group">
                <label>New password</label>
                <input type="password" v-model="passwordForm.newPassword" placeholder="Minimum 6 characters" class="input">
            </div>

            <div class="form-group">
                <label>Confirm new password</label>
                <input type="password" v-model="passwordForm.confirmPassword" placeholder="Re-enter new password" class="input">
            </div>

            <p v-if="passwordMsg" :class="['message', passwordMsgType]">{{ passwordMsg }}</p>

            <div class="form-actions right">
                <button type="button" class="btn-secondary" disabled title="Not implemented in this demo">Send reset link instead</button>
                <button type="submit" class="btn-primary" :disabled="loading.password">
                    {{ loading.password ? 'Updating...' : 'Update password' }}
                </button>
            </div>
        </form>
    </div>

    <!-- Delete Account Section -->
    <div class="card danger-card">
        <h2 class="text-danger">Delete account</h2>
        <p class="description">Permanently delete your Maxemo account and all associated study rooms and materials.</p>
        
        <p class="warning-text">
            This action cannot be undone. You will lose access to all joined rooms, saved materials, and study history.
        </p>

        <div class="form-actions right">
             <button @click="handleDeleteAccount" class="btn-danger">Delete account</button>
        </div>
    </div>


    <ActionConfirmationModal
        v-if="showDeleteModal"
        title="Delete Account"
        :target-name="user?.email || 'your account'"
        action-type="permanently delete"
        required-text="delete my account"
        confirm-button-text="Delete Account"
        processing-text="Deleting..."
        variant="danger"
        :is-processing="loading.delete"
        @close="showDeleteModal = false"
        @confirm="confirmDeleteAccount"
    >
        <template #message>
            Are you absolutely sure you want to delete your account? This action cannot be undone. 
            <strong>All your joined rooms, saved materials, and study history will be permanently lost.</strong>
        </template>
    </ActionConfirmationModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import ActionConfirmationModal from '../components/ActionConfirmationModal.vue'

const authStore = useAuthStore()
const user = computed(() => authStore.user)

const loading = reactive({ email: false, password: false, delete: false })
const emailMsg = ref('')
const emailMsgType = ref('')
const passwordMsg = ref('')
const passwordMsgType = ref('')
const showDeleteModal = ref(false)

const emailForm = reactive({
    newEmail: '',
    confirmEmail: ''
})

const passwordForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})

const handleEmailUpdate = async () => {
    emailMsg.value = ''
    if (emailForm.newEmail !== emailForm.confirmEmail) {
        emailMsg.value = 'Emails do not match'
        emailMsgType.value = 'error'
        return
    }
    if (!emailForm.newEmail) {
         emailMsg.value = 'New email is required'
         emailMsgType.value = 'error'
         return
    }

    loading.email = true
    try {
        await authStore.updateEmail({ newEmail: emailForm.newEmail })
        emailMsg.value = 'Email updated successfully'
        emailMsgType.value = 'success'
        emailForm.newEmail = ''
        emailForm.confirmEmail = ''
    } catch (err) {
        if (typeof err === 'string') {
             emailMsg.value = err
        } else {
             emailMsg.value = 'Update failed'
        }
        emailMsgType.value = 'error'
    } finally {
        loading.email = false
    }
}

const handlePasswordUpdate = async () => {
    passwordMsg.value = ''
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        passwordMsg.value = 'Passwords do not match'
        passwordMsgType.value = 'error'
        return
    }
    if (passwordForm.newPassword.length < 6) {
        passwordMsg.value = 'Password must be at least 6 characters'
        passwordMsgType.value = 'error'
        return
    }
    if (!passwordForm.currentPassword) {
        passwordMsg.value = 'Current password is required'
        passwordMsgType.value = 'error'
        return
    }

    loading.password = true
    try {
        await authStore.updatePassword({ 
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
        })
        passwordMsg.value = 'Password updated successfully'
        passwordMsgType.value = 'success'
        passwordForm.currentPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
    } catch (err) {
        if (typeof err === 'string') {
             passwordMsg.value = err
        } else {
             passwordMsg.value = 'Update failed'
        }
        passwordMsgType.value = 'error'
    } finally {
        loading.password = false
    }
}

const handleDeleteAccount = () => {
    showDeleteModal.value = true
}

const confirmDeleteAccount = async () => {
    loading.delete = true
    try {
        await authStore.deleteAccount()
        // Logout handled in store
    } catch (err) {
        alert('Failed to delete account: ' + err)
        loading.delete = false
        showDeleteModal.value = false
    }
}
</script>

<style scoped>
.settings-page {
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
    padding-bottom: 2rem;
}
.header-section {
    margin-bottom: 2rem;
}
.header-section h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #111827;
}
.header-section p {
    color: #6B7280;
}

.card {
    background: white;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
}
.card h2 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #111827;
}
.description {
    color: #6B7280;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
}

/* Form Styles */
.form-group {
    margin-bottom: 1.25rem;
}
label {
    display: block;
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: #374151;
}
.input {
    width: 100%;
    padding: 0.625rem 0.875rem;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    font-size: 0.95rem;
    transition: box-shadow 0.2s;
}
.input:focus {
    outline: none;
    border-color: #2563EB;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.input.disabled {
    background-color: #F9FAFB;
    color: #6B7280;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
}
.btn-primary {
    background-color: #2563EB;
    color: white;
    padding: 0.625rem 1.25rem;
    border-radius: 6px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
}
.btn-primary:hover {
    background-color: #1D4ED8;
}
.btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.btn-secondary {
    background-color: white;
    border: 1px solid #D1D5DB;
    color: #374151;
    padding: 0.625rem 1.25rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
}
.btn-secondary:hover {
    background-color: #F9FAFB;
}

/* Danger Zone */
.danger-card {
    background-color: #FEF2F2;
    border-color: #FECACA;
}
.text-danger {
    color: #DC2626;
}
.warning-text {
    font-size: 0.9rem;
    color: #7F1D1D;
    margin-bottom: 1.5rem;
}
.btn-danger {
    background-color: white;
    border: 1px solid #FECACA;
    color: #DC2626;
    padding: 0.625rem 1.25rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}
.btn-danger:hover {
    background-color: #FEF2F2;
    border-color: #DC2626;
}

/* Message Styles */
.message {
    font-size: 0.9rem;
    margin-top: 0.5rem;
    padding: 0.5rem;
    border-radius: 4px;
}
.message.error {
    color: #B91C1C;
    background-color: #FEE2E2;
}
.message.success {
    color: #047857;
    background-color: #D1FAE5;
}
</style>
