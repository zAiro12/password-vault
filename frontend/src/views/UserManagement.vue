<template>
  <div class="users-management">
    <h1>User Management</h1>
    
    <!-- Pending Users Section -->
    <div class="section">
      <div class="section-header">
        <h2>Pending User Approvals</h2>
        <button @click="refreshPendingUsers" class="btn-refresh" :disabled="loading">
          Refresh
        </button>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-if="loading && !pendingUsers.length" class="loading">
        Loading...
      </div>
      
      <div v-else-if="pendingUsers.length === 0" class="no-data">
        No pending user approvals
      </div>
      
      <table v-else class="users-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Full Name</th>
            <th>Role</th>
            <th>Registered</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in pendingUsers" :key="user.id">
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.full_name || '-' }}</td>
            <td><span class="role-badge" :class="user.role">{{ user.role }}</span></td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td class="actions">
              <button 
                @click="approveUser(user)" 
                class="btn-approve"
                :disabled="actionLoading"
              >
                Approve
              </button>
              <button 
                @click="rejectUser(user)" 
                class="btn-reject"
                :disabled="actionLoading"
              >
                Reject
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- All Users Section -->
    <div class="section">
      <div class="section-header">
        <h2>All Users</h2>
        <button @click="showCreateModal = true" class="btn-create">
          Create User
        </button>
      </div>
      
      <table v-if="allUsers.length > 0" class="users-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Full Name</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in allUsers" :key="user.id">
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.full_name || '-' }}</td>
            <td><span class="role-badge" :class="user.role">{{ user.role }}</span></td>
            <td>
              <span class="status-badge" :class="getStatusClass(user)">
                {{ getStatusText(user) }}
              </span>
            </td>
            <td class="actions">
              <button 
                v-if="user.is_active && user.is_verified"
                @click="deactivateUser(user)" 
                class="btn-deactivate"
                :disabled="actionLoading"
              >
                Deactivate
              </button>
              <button 
                v-else-if="!user.is_active && user.is_verified"
                @click="reactivateUser(user)" 
                class="btn-reactivate"
                :disabled="actionLoading"
              >
                Reactivate
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Create User Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal" @click.stop>
        <h2>Create New User</h2>
        
        <div v-if="createError" class="error-message">
          {{ createError }}
        </div>
        
        <form @submit.prevent="createUser" class="create-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input 
              type="text" 
              id="username" 
              v-model="newUser.username" 
              required
              :disabled="createLoading"
            />
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="newUser.email" 
              required
              :disabled="createLoading"
            />
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              v-model="newUser.password" 
              required
              :disabled="createLoading"
            />
          </div>
          
          <div class="form-group">
            <label for="full_name">Full Name</label>
            <input 
              type="text" 
              id="full_name" 
              v-model="newUser.full_name"
              :disabled="createLoading"
            />
          </div>
          
          <div class="form-group">
            <label for="role">Role</label>
            <select 
              id="role" 
              v-model="newUser.role" 
              required
              :disabled="createLoading"
            >
              <option value="viewer">Viewer</option>
              <option value="technician">Technician</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div class="modal-actions">
            <button 
              type="submit" 
              class="btn-submit"
              :disabled="createLoading"
            >
              {{ createLoading ? 'Creating...' : 'Create User' }}
            </button>
            <button 
              type="button" 
              @click="closeCreateModal" 
              class="btn-cancel"
              :disabled="createLoading"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../plugins/axios'

const pendingUsers = ref([])
const allUsers = ref([])
const loading = ref(false)
const actionLoading = ref(false)
const error = ref(null)
const showCreateModal = ref(false)
const createLoading = ref(false)
const createError = ref(null)

const newUser = ref({
  username: '',
  email: '',
  password: '',
  full_name: '',
  role: 'technician'
})

onMounted(() => {
  loadData()
})

async function loadData() {
  await Promise.all([
    loadPendingUsers(),
    loadAllUsers()
  ])
}

async function loadPendingUsers() {
  loading.value = true
  error.value = null
  
  try {
    const response = await api.get('/api/users/pending')
    pendingUsers.value = response.data.users
  } catch (err) {
    error.value = 'Failed to load pending users: ' + (err.response?.data?.message || err.message)
  } finally {
    loading.value = false
  }
}

async function loadAllUsers() {
  try {
    const response = await api.get('/api/users')
    allUsers.value = response.data.users
  } catch (err) {
    error.value = 'Failed to load users: ' + (err.response?.data?.message || err.message)
  }
}

async function refreshPendingUsers() {
  await loadPendingUsers()
}

async function approveUser(user) {
  if (!confirm(`Are you sure you want to approve user "${user.username}"?`)) {
    return
  }
  
  actionLoading.value = true
  error.value = null
  
  try {
    await api.put(`/api/users/${user.id}/approve`)
    await loadData()
    alert(`User "${user.username}" has been approved successfully`)
  } catch (err) {
    error.value = 'Failed to approve user: ' + (err.response?.data?.message || err.message)
  } finally {
    actionLoading.value = false
  }
}

async function rejectUser(user) {
  if (!confirm(`Are you sure you want to reject and delete user "${user.username}"? This action cannot be undone.`)) {
    return
  }
  
  actionLoading.value = true
  error.value = null
  
  try {
    await api.delete(`/api/users/${user.id}/reject`)
    await loadData()
    alert(`User "${user.username}" has been rejected and deleted`)
  } catch (err) {
    error.value = 'Failed to reject user: ' + (err.response?.data?.message || err.message)
  } finally {
    actionLoading.value = false
  }
}

async function deactivateUser(user) {
  if (!confirm(`Are you sure you want to deactivate user "${user.username}"?`)) {
    return
  }
  
  actionLoading.value = true
  error.value = null
  
  try {
    await api.put(`/api/users/${user.id}/deactivate`)
    await loadData()
    alert(`User "${user.username}" has been deactivated`)
  } catch (err) {
    error.value = 'Failed to deactivate user: ' + (err.response?.data?.message || err.message)
  } finally {
    actionLoading.value = false
  }
}

async function reactivateUser(user) {
  if (!confirm(`Are you sure you want to reactivate user "${user.username}"?`)) {
    return
  }
  
  actionLoading.value = true
  error.value = null
  
  try {
    await api.put(`/api/users/${user.id}/reactivate`)
    await loadData()
    alert(`User "${user.username}" has been reactivated`)
  } catch (err) {
    error.value = 'Failed to reactivate user: ' + (err.response?.data?.message || err.message)
  } finally {
    actionLoading.value = false
  }
}

async function createUser() {
  createLoading.value = true
  createError.value = null
  
  try {
    await api.post('/api/users', newUser.value)
    closeCreateModal()
    await loadData()
    alert(`User "${newUser.value.username}" has been created successfully`)
  } catch (err) {
    createError.value = 'Failed to create user: ' + (err.response?.data?.message || err.message)
  } finally {
    createLoading.value = false
  }
}

function closeCreateModal() {
  showCreateModal.value = false
  createError.value = null
  newUser.value = {
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'technician'
  }
}

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

function getStatusClass(user) {
  if (!user.is_verified) return 'pending'
  if (!user.is_active) return 'inactive'
  return 'active'
}

function getStatusText(user) {
  if (!user.is_verified) return 'Pending'
  if (!user.is_active) return 'Inactive'
  return 'Active'
}
</script>

<style scoped>
.users-management {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  color: #333;
  margin-bottom: 2rem;
}

.section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  color: #555;
  margin: 0;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  border: 1px solid #fcc;
}

.loading,
.no-data {
  text-align: center;
  padding: 2rem;
  color: #888;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.users-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #555;
}

.users-table tbody tr:hover {
  background-color: #f8f9fa;
}

.role-badge,
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.role-badge.admin {
  background-color: #e3f2fd;
  color: #1976d2;
}

.role-badge.technician {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.role-badge.viewer {
  background-color: #e8f5e9;
  color: #388e3c;
}

.status-badge.active {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.inactive {
  background-color: #ffebee;
  color: #c62828;
}

.status-badge.pending {
  background-color: #fff3e0;
  color: #ef6c00;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-refresh,
.btn-create {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-refresh:hover:not(:disabled),
.btn-create:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-approve {
  background-color: #4caf50;
  color: white;
}

.btn-approve:hover:not(:disabled) {
  background-color: #45a049;
}

.btn-reject,
.btn-deactivate {
  background-color: #f44336;
  color: white;
}

.btn-reject:hover:not(:disabled),
.btn-deactivate:hover:not(:disabled) {
  background-color: #da190b;
}

.btn-reactivate {
  background-color: #2196f3;
  color: white;
}

.btn-reactivate:hover:not(:disabled) {
  background-color: #0b7dda;
}

/* Modal Styles */
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
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-submit {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-cancel {
  flex: 1;
  background-color: #999;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-cancel:hover:not(:disabled) {
  background-color: #777;
}
</style>
