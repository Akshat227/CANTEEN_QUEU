export class NotificationService {
  constructor() {
    this.permission = null
    this.requestPermission()
  }

  async requestPermission() {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission()
    }
  }

  showNotification(title, body, orderId) {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return
    }

    if (this.permission === 'granted') {
      const notification = new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `order-${orderId}`,
        requireInteraction: true
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      return notification
    } else if (this.permission === 'default') {
      this.requestPermission().then(() => {
        if (this.permission === 'granted') {
          this.showNotification(title, body, orderId)
        }
      })
    }
  }

  notifyOrderReady(orderId, studentName) {
    this.showNotification(
      'Order Ready! 🎉',
      `Your order #${orderId} is ready for pickup, ${studentName}!`,
      orderId
    )
  }
}

export const notificationService = new NotificationService()

