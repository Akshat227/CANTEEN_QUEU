import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

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

  // Supabase presence flag
  const useSupabase = !!supabase

  // Initialize: will set up realtime subscription if supabase is configured
  let supabaseChannel = null

  // Load orders: from Supabase if available, otherwise from localStorage
  const loadOrders = async () => {
    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: true })

        if (error) {
          console.error('Supabase loadOrders error', error)
          return
        }

        orders.value = data.map(o => ({
          id: o.id,
          studentName: o.student_name,
          studentId: o.student_id,
          items: o.items,
          total: Number(o.total),
          status: o.status,
          createdAt: o.created_at,
          updatedAt: o.updated_at || o.created_at
        }))
      } catch (err) {
        console.error('loadOrders exception', err)
      }
    } else {
      const stored = localStorage.getItem('canteenOrders')
      if (stored) {
        orders.value = JSON.parse(stored)
      }
    }
  }

  // Save orders: when using Supabase we generally perform per-record ops; keep no-op for bulk
  const saveOrders = async () => {
    if (!useSupabase) {
      localStorage.setItem('canteenOrders', JSON.stringify(orders.value))
      window.dispatchEvent(new CustomEvent('orderUpdated'))
    }
  }

  const addOrder = async (orderData) => {
    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .insert([{
            student_name: orderData.studentName,
            student_id: orderData.studentId,
            items: orderData.items,
            total: orderData.total,
            status: 'pending',
            updated_at: new Date().toISOString()
          }])
          .select()

        if (error) {
          console.error('Supabase addOrder error', error)
          return null
        }

        // data[0] contains inserted row with id
        await loadOrders()
        return data[0].id
      } catch (err) {
        console.error('addOrder exception', err)
        return null
      }
    }

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

  const updateOrderStatus = async (orderId, status) => {
    if (useSupabase) {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', orderId)

        if (error) console.error('Supabase updateOrderStatus error', error)
      } catch (err) {
        console.error('updateOrderStatus exception', err)
      }
      return
    }

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

  const deleteOrder = async (id) => {
    if (useSupabase) {
      try {
        const { error } = await supabase.from('orders').delete().eq('id', id)
        if (error) console.error('Supabase deleteOrder error', error)
      } catch (err) {
        console.error('deleteOrder exception', err)
      }
      return
    }

    const idx = orders.value.findIndex(o => o.id === id)
    if (idx !== -1) {
      orders.value.splice(idx, 1)
      saveOrders()
    }
  }
  // Setup: load and (if supabase) subscribe to realtime changes
  ;(async () => {
    await loadOrders()

    if (useSupabase && supabaseChannel === null) {
      try {
        supabaseChannel = supabase
          .channel('public:orders')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
            // reload entire list on any change
            loadOrders()
            // Also emit a custom event for same-tab listeners
            window.dispatchEvent(new CustomEvent('orderUpdated'))
          })
          .subscribe()
      } catch (err) {
        console.error('Supabase subscription error', err)
      }
    }
  })()

  return {
    orders,
    menuItems,
    addOrder,
    updateOrderStatus,
    deleteOrder,
    pendingOrders,
    inProgressOrders,
    readyOrders,
    getOrderById,
    loadOrders,
    saveOrders
  }
})

