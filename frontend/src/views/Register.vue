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
          <div class="input-with-action">
            <input 
              :type="revealMainPass ? 'text' : 'password'" 
              id="password" 
              v-model="password" 
              placeholder="Enter password (min 8 chars, 1 number, 1 uppercase)"
              required
              :disabled="loading"
            />
            <button 
              type="button" 
              class="reveal-toggle"
              @mousedown="revealMainPass = true"
              @mouseup="revealMainPass = false"
              @mouseleave="revealMainPass = false"
              @touchstart="revealMainPass = true"
              @touchend="revealMainPass = false"
              tabindex="-1"
              :aria-label="revealMainPass ? 'Hiding password' : 'Press to reveal password'"
            >
              <svg v-if="!revealMainPass" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
          <small class="hint">Minimum 8 characters, at least 1 number and 1 uppercase letter</small>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <div class="input-with-action">
            <input 
              :type="revealConfirmPass ? 'text' : 'password'" 
              id="confirmPassword" 
              v-model="confirmPassword" 
              placeholder="Confirm password"
              required
              :disabled="loading"
            />
            <button 
              type="button" 
              class="reveal-toggle"
              @mousedown="revealConfirmPass = true"
              @mouseup="revealConfirmPass = false"
              @mouseleave="revealConfirmPass = false"
              @touchstart="revealConfirmPass = true"
              @touchend="revealConfirmPass = false"
              tabindex="-1"
              :aria-label="revealConfirmPass ? 'Hiding confirm password' : 'Press to reveal confirm password'"
            >
              <svg v-if="!revealConfirmPass" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
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
const revealMainPass = ref(false)
const revealConfirmPass = ref(false)

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
    // Show success message - user needs admin approval before login
    error.value = null
    // Display success message to the user
    alert('Registration successful! Your account is pending approval by an administrator. You will be able to login once your account is approved.')
    // Redirect to login page
    router.push('/login')
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

.input-with-action {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-action input {
  flex: 1;
  padding-right: 3rem;
}

.reveal-toggle {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: color 0.2s;
  user-select: none;
}

.reveal-toggle:hover {
  color: #667eea;
}

.reveal-toggle:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
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
