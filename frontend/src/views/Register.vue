<template>
  <div class="register-view">
    <div class="register-container">
      <h1>Password Vault</h1>
      <h2>Register</h2>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            placeholder="Enter username"
            required
            :disabled="loading"
          />
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="Enter email"
            required
            :disabled="loading"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="Enter password (min 8 chars, 1 number, 1 uppercase)"
            required
            :disabled="loading"
          />
          <small class="hint">Minimum 8 characters, at least 1 number and 1 uppercase letter</small>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="confirmPassword" 
            placeholder="Confirm password"
            required
            :disabled="loading"
          />
        </div>
        
        <button type="submit" class="btn-register" :disabled="loading">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
      </form>
      
      <div class="login-link">
        Already have an account? <router-link to="/login">Login here</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref(null)
const loading = ref(false)

const validateForm = () => {
  // Check if passwords match
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return false
  }
  
  // Validate password strength
  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters long'
    return false
  }
  
  if (!/[0-9]/.test(password.value)) {
    error.value = 'Password must contain at least one number'
    return false
  }
  
  if (!/[A-Z]/.test(password.value)) {
    error.value = 'Password must contain at least one uppercase letter'
    return false
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    error.value = 'Invalid email format'
    return false
  }
  
  return true
}

const handleRegister = async () => {
  error.value = null
  
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  
  const result = await authStore.register({
    username: username.value,
    email: email.value,
    password: password.value
  })
  
  loading.value = false
  
  if (result.success) {
    // Auto-login after registration
    router.push('/dashboard')
  } else {
    error.value = result.error
  }
}
</script>

<style scoped>
.register-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

.register-container {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 450px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
}

h2 {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.2rem;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  border: 1px solid #fcc;
}

.register-form {
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
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.hint {
  color: #888;
  font-size: 0.85rem;
}

.btn-register {
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-register:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-register:active:not(:disabled) {
  transform: translateY(0);
}

.btn-register:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
