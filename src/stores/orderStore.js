import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useOrderStore = defineStore('orders', () => {
  const orders = ref([])
  const menuItems = ref([
    { id: 1, name: 'Burger', price: 50, category: 'Fast Food' },
    { id: 2, name: 'Pizza', price: 120, category: 'Fast Food' },
    { id: 3, name: 'Pasta', price: 80, category: 'Italian' },
    { id: 4, name: 'Sandwich', price: 40, category: 'Fast Food' },
    { id: 5, name: 'Rice Bowl', price: 60, category: 'Main Course' },
    { id: 6, name: 'Salad', price: 45, category: 'Healthy' },
    { id: 7, name: 'Coffee', price: 30, category: 'Beverages' },
    { id: 8, name: 'Tea', price: 20, category: 'Beverages' },
  ])

  // Load from localStorage
  const loadOrders = () => {
    const stored = localStorage.getItem('canteenOrders')
    if (stored) {
      orders.value = JSON.parse(stored)
    }
  }

  // Save to localStorage
  const saveOrders = () => {
    localStorage.setItem('canteenOrders', JSON.stringify(orders.value))
    // Trigger custom event for same-tab communication
    window.dispatchEvent(new CustomEvent('orderUpdated'))
    // Note: storage event only fires in other tabs, not the same tab
  }

  // Initialize
  loadOrders()

  // Listen for storage changes (for real-time updates)
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', () => {
      loadOrders()
    })
  }

  const addOrder = (orderData) => {
    const newOrder = {
      id: Date.now(),
      studentName: orderData.studentName,
      studentId: orderData.studentId,
      items: orderData.items,
      total: orderData.total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    orders.value.push(newOrder)
    saveOrders()
    return newOrder.id
  }

  const updateOrderStatus = (orderId, status) => {
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = status
      order.updatedAt = new Date().toISOString()
      saveOrders()
    }
  }

  const pendingOrders = computed(() => 
    orders.value.filter(o => o.status === 'pending').sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  )

  const inProgressOrders = computed(() => 
    orders.value.filter(o => o.status === 'in_progress').sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  )

  const readyOrders = computed(() => 
    orders.value.filter(o => o.status === 'ready').sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  )

  const getOrderById = (id) => {
    return orders.value.find(o => o.id === id)
  }

  return {
    orders,
    menuItems,
    addOrder,
    updateOrderStatus,
    pendingOrders,
    inProgressOrders,
    readyOrders,
    getOrderById,
    loadOrders
  }
})

