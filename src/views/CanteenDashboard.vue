<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>🏪 Canteen Dashboard</h1>
      <p class="subtitle">Manage orders and update status</p>
    </header>

    <div class="dashboard-container">
      <!-- Statistics -->
      <div class="stats-grid">
        <div class="stat-card pending">
          <div class="stat-icon">⏳</div>
          <div class="stat-info">
            <div class="stat-value">{{ pendingOrders.length }}</div>
            <div class="stat-label">Pending Orders</div>
          </div>
        </div>
        <div class="stat-card in-progress">
          <div class="stat-icon">👨‍🍳</div>
          <div class="stat-info">
            <div class="stat-value">{{ inProgressOrders.length }}</div>
            <div class="stat-label">In Progress</div>
          </div>
        </div>
        <div class="stat-card ready">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <div class="stat-value">{{ readyOrders.length }}</div>
            <div class="stat-label">Ready for Pickup</div>
          </div>
        </div>
        <div class="stat-card total">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <div class="stat-value">{{ allOrders.length }}</div>
            <div class="stat-label">Total Orders</div>
          </div>
        </div>
      </div>

      <!-- Orders by Status -->
      <div class="orders-grid">
        <!-- Pending Orders -->
        <div class="orders-column">
          <div class="column-header pending">
            <h2>⏳ Pending</h2>
            <span class="count-badge">{{ pendingOrders.length }}</span>
          </div>
          <div class="orders-list">
            <div 
              v-for="order in pendingOrders" 
              :key="order.id" 
              class="order-card"
            >
              <div class="order-header">
                <div>
                  <div class="order-id">Order #{{ order.id }}</div>
                  <div class="student-info">
                    <strong>{{ order.studentName }}</strong>
                    <span class="student-id">(ID: {{ order.studentId }})</span>
                  </div>
                </div>
                <div class="order-time">{{ formatTime(order.createdAt) }}</div>
              </div>
              
              <div class="order-items">
                <div 
                  v-for="item in order.items" 
                  :key="item.id" 
                  class="order-item"
                >
                  <span>{{ item.name }} × {{ item.quantity }}</span>
                  <span>₹{{ item.price * item.quantity }}</span>
                </div>
              </div>
              
              <div class="order-footer">
                <div class="order-total">Total: ₹{{ order.total }}</div>
                <button 
                  @click="updateStatus(order.id, 'in_progress')" 
                  class="status-btn in-progress-btn"
                >
                  Start Preparing
                </button>
              </div>
            </div>
            <div v-if="pendingOrders.length === 0" class="empty-state">
              No pending orders
            </div>
          </div>
        </div>

        <!-- In Progress Orders -->
        <div class="orders-column">
          <div class="column-header in-progress">
            <h2>👨‍🍳 In Progress</h2>
            <span class="count-badge">{{ inProgressOrders.length }}</span>
          </div>
          <div class="orders-list">
            <div 
              v-for="order in inProgressOrders" 
              :key="order.id" 
              class="order-card"
            >
              <div class="order-header">
                <div>
                  <div class="order-id">Order #{{ order.id }}</div>
                  <div class="student-info">
                    <strong>{{ order.studentName }}</strong>
                    <span class="student-id">(ID: {{ order.studentId }})</span>
                  </div>
                </div>
                <div class="order-time">{{ formatTime(order.updatedAt) }}</div>
              </div>
              
              <div class="order-items">
                <div 
                  v-for="item in order.items" 
                  :key="item.id" 
                  class="order-item"
                >
                  <span>{{ item.name }} × {{ item.quantity }}</span>
                  <span>₹{{ item.price * item.quantity }}</span>
                </div>
              </div>
              
              <div class="order-footer">
                <div class="order-total">Total: ₹{{ order.total }}</div>
                <button 
                  @click="updateStatus(order.id, 'ready')" 
                  class="status-btn ready-btn"
                >
                  Mark as Ready
                </button>
              </div>
            </div>
            <div v-if="inProgressOrders.length === 0" class="empty-state">
              No orders in progress
            </div>
          </div>
        </div>

        <!-- Ready Orders -->
        <div class="orders-column">
          <div class="column-header ready">
            <h2>✅ Ready for Pickup</h2>
            <span class="count-badge">{{ readyOrders.length }}</span>
          </div>
          <div class="orders-list">
            <div 
              v-for="order in readyOrders" 
              :key="order.id" 
              class="order-card ready"
            >
              <div class="order-header">
                <div>
                  <div class="order-id">Order #{{ order.id }}</div>
                  <div class="student-info">
                    <strong>{{ order.studentName }}</strong>
                    <span class="student-id">(ID: {{ order.studentId }})</span>
                  </div>
                </div>
                <div class="order-time">{{ formatTime(order.updatedAt) }}</div>
              </div>
              
              <div class="order-items">
                <div 
                  v-for="item in order.items" 
                  :key="item.id" 
                  class="order-item"
                >
                  <span>{{ item.name }} × {{ item.quantity }}</span>
                  <span>₹{{ item.price * item.quantity }}</span>
                </div>
              </div>
              
              <div class="order-footer">
                <div class="order-total">Total: ₹{{ order.total }}</div>
                <button 
                  @click="completeOrder(order.id)" 
                  class="status-btn complete-btn"
                >
                  Complete
                </button>
              </div>
            </div>
            <div v-if="readyOrders.length === 0" class="empty-state">
              No ready orders
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useOrderStore } from '../stores/orderStore'

const orderStore = useOrderStore()

const pendingOrders = computed(() => orderStore.pendingOrders)
const inProgressOrders = computed(() => orderStore.inProgressOrders)
const readyOrders = computed(() => orderStore.readyOrders)
const allOrders = computed(() => orderStore.orders)

const updateStatus = (orderId, status) => {
  orderStore.updateOrderStatus(orderId, status)
  
  // Dispatch custom event for same-tab updates
  window.dispatchEvent(new CustomEvent('orderUpdated'))
  
  // Show notification
  const order = orderStore.getOrderById(orderId)
  if (status === 'ready' && order) {
    // This will trigger notification on student side
    console.log(`Order #${orderId} is now ready for ${order.studentName}`)
  }
}

const completeOrder = async (orderId) => {
  // Delete order (server or local)
  await orderStore.deleteOrder(orderId)
  // Notify same-tab listeners
  window.dispatchEvent(new CustomEvent('orderUpdated'))
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  // Poll for new orders every 2 seconds
  setInterval(() => {
    orderStore.loadOrders()
  }, 2000)
  
  // Listen for storage events
  window.addEventListener('storage', () => {
    orderStore.loadOrders()
  })
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.dashboard-header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

.dashboard-container {
  max-width: 1600px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 15px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin-top: 5px;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.orders-column {
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  margin-bottom: 15px;
  border-bottom: 3px solid;
}

.column-header.pending {
  border-color: #ffa500;
}

.column-header.in-progress {
  border-color: #2196f3;
}

.column-header.ready {
  border-color: #4caf50;
}

.column-header h2 {
  font-size: 1.5rem;
  color: #333;
  margin: 0;
}

.count-badge {
  background: #f0f0f0;
  padding: 5px 12px;
  border-radius: 20px;
  font-weight: 600;
  color: #333;
}

.orders-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-card {
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  padding: 15px;
  transition: all 0.3s;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-card.ready {
  border-color: #4caf50;
  background: #f1f8f4;
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.order-id {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 5px;
}

.student-info {
  font-size: 0.9rem;
  color: #666;
}

.student-id {
  color: #999;
  margin-left: 5px;
}

.order-time {
  font-size: 0.85rem;
  color: #888;
  white-space: nowrap;
}

.order-items {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  color: #555;
  font-size: 0.95rem;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-total {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.status-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.in-progress-btn {
  background: #2196f3;
  color: white;
}

.in-progress-btn:hover {
  background: #1976d2;
  transform: translateY(-1px);
}

.ready-btn {
  background: #4caf50;
  color: white;
}

.ready-btn:hover {
  background: #45a049;
  transform: translateY(-1px);
}

.complete-btn {
  background: #666;
  color: white;
}

.complete-btn:hover {
  background: #555;
  transform: translateY(-1px);
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 40px 20px;
  font-style: italic;
}

@media (max-width: 1200px) {
  .orders-grid {
    grid-template-columns: 1fr;
  }
  
  .orders-column {
    max-height: none;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .dashboard-header h1 {
    font-size: 2rem;
  }
}
</style>

