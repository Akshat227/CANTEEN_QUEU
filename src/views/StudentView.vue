<template>
  <div class="student-view">
    <header class="header">
      <h1>🍽️ Canteen Queue</h1>
      <p class="subtitle">Order your favorite food from campus canteen</p>
    </header>

    <div class="container">
      <!-- Order Form -->
      <div class="order-section">
        <h2>Place Your Order</h2>
        
        <form @submit.prevent="placeOrder" class="order-form">
          <div class="form-group">
            <label for="studentName">Your Name</label>
            <input 
              type="text" 
              id="studentName" 
              v-model="studentName" 
              required 
              placeholder="Enter your name"
            />
          </div>

          <div class="form-group">
            <label for="studentId">Student ID</label>
            <input 
              type="text" 
              id="studentId" 
              v-model="studentId" 
              required 
              placeholder="Enter your student ID"
            />
          </div>

          <div class="menu-section">
            <h3>Menu</h3>
            <div class="menu-grid">
              <div 
                v-for="item in menuItems" 
                :key="item.id" 
                class="menu-item"
                :class="{ selected: isItemSelected(item.id) }"
                @click="toggleItem(item)"
              >
                <div class="item-info">
                  <h4>{{ item.name }}</h4>
                  <p class="category">{{ item.category }}</p>
                  <p class="price">₹{{ item.price }}</p>
                </div>
                <div v-if="getItemQuantity(item.id) > 0" class="quantity-controls">
                  <button type="button" @click.stop="decreaseQuantity(item.id)" class="qty-btn">-</button>
                  <span class="quantity">{{ getItemQuantity(item.id) }}</span>
                  <button type="button" @click.stop="increaseQuantity(item.id)" class="qty-btn">+</button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="cartItems.length > 0" class="cart-summary">
            <h3>Your Order</h3>
            <div class="cart-items">
              <div v-for="item in cartItems" :key="item.id" class="cart-item">
                <span>{{ item.name }} × {{ item.quantity }}</span>
                <span>₹{{ item.price * item.quantity }}</span>
              </div>
            </div>
            <div class="total">
              <strong>Total: ₹{{ total }}</strong>
            </div>
          </div>

          <button 
            type="submit" 
            class="submit-btn"
            :disabled="cartItems.length === 0 || isSubmitting"
          >
            {{ isSubmitting ? 'Placing Order...' : 'Place Order' }}
          </button>
        </form>
      </div>

      <!-- My Orders Section -->
      <div class="orders-section" v-if="myOrders.length > 0">
        <h2>My Orders</h2>
        <div class="orders-list">
          <div 
            v-for="order in myOrders" 
            :key="order.id" 
            class="order-card"
            :class="order.status"
          >
            <div class="order-header">
              <span class="order-id">Order #{{ order.id }}</span>
              <span class="status-badge" :class="order.status">
                {{ getStatusLabel(order.status) }}
              </span>
            </div>
            <div class="order-items">
              <div v-for="item in order.items" :key="item.id" class="order-item">
                {{ item.name }} × {{ item.quantity }}
              </div>
            </div>
            <div class="order-footer">
              <span class="order-total">Total: ₹{{ order.total }}</span>
              <span class="order-time">{{ formatTime(order.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useOrderStore } from '../stores/orderStore'
import { notificationService } from '../services/notificationService'

const orderStore = useOrderStore()
const studentName = ref('')
const studentId = ref('')
const cart = ref({}) // { itemId: quantity }
const isSubmitting = ref(false)
const myOrderIds = ref([]) // Track orders placed by this student

const menuItems = computed(() => orderStore.menuItems)

const cartItems = computed(() => {
  return menuItems.value
    .filter(item => cart.value[item.id] > 0)
    .map(item => ({
      ...item,
      quantity: cart.value[item.id]
    }))
})

const total = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const myOrders = computed(() => {
  return orderStore.orders
    .filter(order => myOrderIds.value.includes(order.id))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const isItemSelected = (itemId) => {
  return cart.value[itemId] > 0
}

const getItemQuantity = (itemId) => {
  return cart.value[itemId] || 0
}

const toggleItem = (item) => {
  if (cart.value[item.id]) {
    delete cart.value[item.id]
  } else {
    cart.value[item.id] = 1
  }
}

const increaseQuantity = (itemId) => {
  cart.value[itemId] = (cart.value[itemId] || 0) + 1
}

const decreaseQuantity = (itemId) => {
  if (cart.value[itemId] > 1) {
    cart.value[itemId]--
  } else {
    delete cart.value[itemId]
  }
}

const placeOrder = () => {
  if (cartItems.value.length === 0) return

  isSubmitting.value = true

  const orderData = {
    studentName: studentName.value,
    studentId: studentId.value,
    items: cartItems.value,
    total: total.value
  }

  const orderId = orderStore.addOrder(orderData)
  myOrderIds.value.push(orderId)

  // Clear cart
  cart.value = {}
  
  // Show success message
  alert(`Order placed successfully! Order ID: #${orderId}`)

  isSubmitting.value = false
}

const getStatusLabel = (status) => {
  const labels = {
    pending: '⏳ Pending',
    in_progress: '👨‍🍳 In Progress',
    ready: '✅ Ready for Pickup'
  }
  return labels[status] || status
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

// Poll for order updates and check for ready status
let pollInterval = null
const notifiedOrders = new Set() // Track orders we've already notified about

const loadNotifiedOrders = () => {
  if (studentId.value) {
    const notifiedStored = localStorage.getItem(`notifiedOrders_${studentId.value}`)
    if (notifiedStored) {
      const ids = JSON.parse(notifiedStored)
      ids.forEach(id => notifiedOrders.add(id))
    }
  }
}

const saveNotifiedOrders = () => {
  if (studentId.value) {
    localStorage.setItem(`notifiedOrders_${studentId.value}`, JSON.stringify(Array.from(notifiedOrders)))
  }
}

const checkOrderUpdates = () => {
  myOrders.value.forEach(order => {
    const isNowReady = order.status === 'ready'
    const alreadyNotified = notifiedOrders.has(order.id)
    
    if (isNowReady && !alreadyNotified) {
      notificationService.notifyOrderReady(order.id, order.studentName)
      notifiedOrders.add(order.id)
      saveNotifiedOrders()
    }
  })
}

onMounted(() => {
  // Load my order IDs from localStorage
  const stored = localStorage.getItem(`studentOrders_${studentId.value}`)
  if (stored) {
    myOrderIds.value = JSON.parse(stored)
  }

  // Load notified orders from localStorage
  loadNotifiedOrders()

  // Poll for updates every 2 seconds
  pollInterval = setInterval(() => {
    orderStore.loadOrders()
    checkOrderUpdates()
  }, 2000)

  // Also listen for storage events (cross-tab updates)
  window.addEventListener('storage', handleStorageChange)
  
  // Custom event for same-tab updates
  window.addEventListener('orderUpdated', handleStorageChange)
})

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('orderUpdated', handleStorageChange)
  
  // Save my order IDs
  if (studentId.value) {
    localStorage.setItem(`studentOrders_${studentId.value}`, JSON.stringify(myOrderIds.value))
  }
})

const handleStorageChange = () => {
  orderStore.loadOrders()
  checkOrderUpdates()
}
</script>

<style scoped>
.student-view {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.order-section,
.orders-section {
  background: white;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.order-section h2,
.orders-section h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.8rem;
}

.order-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #555;
}

.form-group input {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.menu-section h3 {
  color: #333;
  margin-bottom: 15px;
  font-size: 1.3rem;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.menu-item {
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.menu-item:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.menu-item.selected {
  border-color: #667eea;
  background: #f0f4ff;
}

.item-info h4 {
  color: #333;
  margin-bottom: 5px;
  font-size: 1.1rem;
}

.category {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.price {
  color: #667eea;
  font-weight: 600;
  font-size: 1.1rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.qty-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.qty-btn:hover {
  background: #5568d3;
}

.quantity {
  font-weight: 600;
  min-width: 30px;
  text-align: center;
}

.cart-summary {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin-top: 20px;
}

.cart-summary h3 {
  color: #333;
  margin-bottom: 15px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.total {
  font-size: 1.2rem;
  color: #333;
  padding-top: 10px;
  border-top: 2px solid #667eea;
}

.submit-btn {
  padding: 15px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-card {
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  padding: 20px;
  transition: all 0.3s;
}

.order-card.pending {
  border-left: 4px solid #ffa500;
}

.order-card.in_progress {
  border-left: 4px solid #2196f3;
}

.order-card.ready {
  border-left: 4px solid #4caf50;
  background: #f1f8f4;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.order-id {
  font-weight: 600;
  color: #333;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.in_progress {
  background: #cfe2ff;
  color: #084298;
}

.status-badge.ready {
  background: #d1e7dd;
  color: #0f5132;
}

.order-items {
  margin-bottom: 15px;
}

.order-item {
  padding: 5px 0;
  color: #555;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #e0e0e0;
}

.order-total {
  font-weight: 600;
  color: #333;
}

.order-time {
  color: #888;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .menu-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .header h1 {
    font-size: 2rem;
  }
}
</style>

