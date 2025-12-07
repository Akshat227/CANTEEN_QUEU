# 🍽️ Canteen Queue - College Food Ordering System

A web application that allows college students to order food from the on-campus canteen and receive real-time notifications when their order is ready. The canteen owner has a dashboard to manage orders and update their status.

## Features

### For Students
- Browse menu items and place orders
- View order status in real-time (Pending → In Progress → Ready)
- Receive push notifications when order is ready for pickup
- Track all your orders in one place

### For Canteen Owner
- View all orders organized by status
- Update order status (Pending → In Progress → Ready)
- Real-time statistics dashboard
- Complete orders after pickup

## Technology Stack

- **Vue.js 3** - Frontend framework
- **Pinia** - State management
- **Vue Router** - Routing
- **Vite** - Build tool
- **LocalStorage** - Client-side data persistence
- **Web Notifications API** - Push notifications

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to:
   - **Student View**: `http://localhost:3000/`
   - **Canteen Dashboard**: `http://localhost:3000/canteen`

## How It Works

### Data Storage
All order data is stored in the browser's `localStorage` on the canteen side. This means:
- Data persists across page refreshes
- Works offline (once loaded)
- No backend server required

### Real-Time Updates
The application uses a combination of:
- **Polling**: Checks for updates every 2 seconds
- **Storage Events**: Listens for changes across browser tabs
- **Custom Events**: Handles same-tab updates

### Push Notifications
When an order status changes to "Ready", students receive a browser push notification. Make sure to allow notifications when prompted.

## Usage

### For Students

1. Enter your name and student ID
2. Browse the menu and click items to add them to your cart
3. Adjust quantities using +/- buttons
4. Click "Place Order" to submit
5. Watch your order status update in real-time
6. Receive a notification when your order is ready!

### For Canteen Owner

1. View all orders organized by status (Pending, In Progress, Ready)
2. Click "Start Preparing" to move an order from Pending to In Progress
3. Click "Mark as Ready" to notify the student
4. Click "Complete" after the student picks up the order

## Project Structure

```
├── src/
│   ├── views/
│   │   ├── StudentView.vue      # Student ordering interface
│   │   └── CanteenDashboard.vue # Canteen owner dashboard
│   ├── stores/
│   │   └── orderStore.js        # Pinia store for order management
│   ├── services/
│   │   └── notificationService.js # Push notification service
│   ├── router/
│   │   └── index.js             # Vue Router configuration
│   ├── App.vue                  # Root component
│   └── main.js                  # Application entry point
├── index.html
├── package.json
└── vite.config.js
```

## Customization

### Adding Menu Items
Edit `src/stores/orderStore.js` and modify the `menuItems` array:

```javascript
menuItems: ref([
  { id: 1, name: 'Your Item', price: 50, category: 'Category' },
  // Add more items...
])
```

### Styling
All styles are scoped within each component. Modify the `<style scoped>` sections in the Vue files to customize the appearance.

## Browser Compatibility

- Modern browsers with ES6+ support
- LocalStorage support required
- Web Notifications API for push notifications (optional but recommended)

## Notes

- This is a client-side only application - no backend server required
- Data is stored locally in the browser
- For production use, consider adding a backend for data persistence across devices
- Push notifications require user permission

## License

MIT

