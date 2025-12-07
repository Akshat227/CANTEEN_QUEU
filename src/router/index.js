import { createRouter, createWebHistory } from 'vue-router'
import StudentView from '../views/StudentView.vue'
import CanteenDashboard from '../views/CanteenDashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Student',
    component: StudentView
  },
  {
    path: '/canteen',
    name: 'Canteen',
    component: CanteenDashboard
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

