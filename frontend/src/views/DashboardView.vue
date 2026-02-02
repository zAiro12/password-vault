<template>
  <div class="dashboard-view">
    <header class="dashboard-header">
      <h1>Password Vault Dashboard</h1>
      <button @click="handleLogout" class="btn-logout">Logout</button>
    </header>
    
    <main class="dashboard-content">
      <div class="stats-section">
        <div class="stat-card">
          <h3>Clients</h3>
          <p class="stat-number">{{ stats.clients }}</p>
        </div>
        <div class="stat-card">
          <h3>Resources</h3>
          <p class="stat-number">{{ stats.resources }}</p>
        </div>
        <div class="stat-card">
          <h3>Credentials</h3>
          <p class="stat-number">{{ stats.credentials }}</p>
        </div>
      </div>

      <div class="clients-section">
        <div class="section-header">
          <h2>Clients</h2>
          <button class="btn-add">+ Add Client</button>
        </div>
        <div class="clients-list">
          <p class="empty-message">No clients yet. Click "Add Client" to create one.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const stats = ref({
  clients: 0,
  resources: 0,
  credentials: 0
})

const handleLogout = () => {
  // TODO: Implement actual logout logic
  console.log('Logging out...')
  router.push('/login')
}
</script>

<style scoped>
.dashboard-view {
  min-height: 100vh;
  background: #f5f5f5;
}

.dashboard-header {
  background: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-header h1 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.btn-logout {
  padding: 0.5rem 1.5rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.btn-logout:hover {
  background: #c82333;
}

.dashboard-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 1rem;
  font-weight: 600;
}

.stat-number {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: #667eea;
}

.clients-section {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
}

.btn-add {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.btn-add:hover {
  background: #5568d3;
}

.clients-list {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-message {
  color: #999;
  font-style: italic;
}
</style>
