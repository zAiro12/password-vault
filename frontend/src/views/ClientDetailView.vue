<template>
  <div class="client-detail-view">
    <header class="detail-header">
      <button @click="goBack" class="btn-back">← Back to Dashboard</button>
      <h1>Client Detail</h1>
      <div class="spacer"></div>
    </header>
    
    <main class="detail-content">
      <div class="client-info">
        <h2>Client Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>Client ID:</label>
            <span>{{ clientId }}</span>
          </div>
          <div class="info-item">
            <label>Name:</label>
            <span>To be loaded...</span>
          </div>
          <div class="info-item">
            <label>Created:</label>
            <span>To be loaded...</span>
          </div>
          <div class="info-item">
            <label>Status:</label>
            <span>To be loaded...</span>
          </div>
        </div>
      </div>

      <div class="resources-section">
        <div class="section-header">
          <h2>Resources</h2>
          <button class="btn-add">+ Add Resource</button>
        </div>
        <div class="resources-list">
          <p class="empty-message">No resources for this client yet.</p>
        </div>
      </div>

      <div class="credentials-section">
        <div class="section-header">
          <h2>Credentials</h2>
          <button class="btn-add">+ Add Credential</button>
        </div>
        <div class="credentials-list">
          <p class="empty-message">No credentials for this client yet.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const clientId = computed(() => route.params.id)

const goBack = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.client-detail-view {
  min-height: 100vh;
  background: #f5f5f5;
}

.detail-header {
  background: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-header h1 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.spacer {
  width: 180px;
}

.btn-back {
  padding: 0.5rem 1rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.btn-back:hover {
  background: #5a6268;
}

.detail-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.client-info,
.resources-section,
.credentials-section {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.client-info h2,
.section-header h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.3rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-weight: 600;
  color: #666;
  font-size: 0.9rem;
}

.info-item span {
  color: #333;
  font-size: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
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

.resources-list,
.credentials-list {
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-message {
  color: #999;
  font-style: italic;
}
</style>
