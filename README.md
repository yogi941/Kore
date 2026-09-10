# 🍽️ Kore Canteen - Smart Campus Food Pre-Ordering & Management System

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.18-blue.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-v18.2-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v5.0-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3.4-38B2AC.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-v4.6-010101.svg)](https://socket.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-Redis-DC382D.svg)](https://taskforcesh.github.io/bullmq/)
[![Razorpay](https://img.shields.io/badge/Payment-Razorpay-02042B.svg)](https://razorpay.com/)

**Kore Canteen** is a full-stack, enterprise-grade smart canteen pre-ordering platform built to eliminate long queues and streamline food ordering across campus canteens.

Students can browse canteen menus, receive **AI/ML food recommendations**, create **Group Orders** with shared cart invite links, pay securely via **Razorpay** or cash, and track their order status in real time. Canteen admins get a live management dashboard with **QR code verification** and sales analytics.

---

## 📌 Key Features

### 👨‍🎓 Student Portal
* 🔐 **Secure Authentication**: JWT-based user login and registration with password hashing (`bcryptjs`).
* 🏢 **Multi-Canteen Browsing**: View all campus canteens, operating hours, active status, and pickup time slots.
* 🍕 **Dynamic Menu & Filtering**: Search food items by name, filter by diet (`Veg`, `Non-Veg`, `Jain`, `Egg`), category, or price range.
* 🤖 **Smart AI/ML Recommendations**: Personalised food recommendations powered by order history, time-of-day contextual suggestions, and popularity scoring.
* 👥 **Group Ordering & Split Cart**: Host or join a group cart using a unique 6-character room code. Split bill calculations, member order aggregation, and unified parent order placement.
* 💳 **Flexible Payments**: Integration with **Razorpay** checkout for instant UPI/Card payments alongside Cash on Pickup options.
* ⚡ **Real-time Order Tracking**: Live WebSocket (`Socket.io`) updates as the order transitions through status stages (`Pending` ➔ `Confirmed` ➔ `Preparing` ➔ `Ready for Pickup` ➔ `Completed`).
* 📲 **QR Code Pickup Pass**: Auto-generated QR code pass for each confirmed order for instant validation at the counter.
* 🔔 **In-App Notifications**: Real-time notifications for status changes and order updates.

### 👨‍🍳 Admin & Staff Dashboard
* 🔐 **Role-Based Access Control (RBAC)**: Support for `canteen_admin`, `shop_manager`, and `super_admin` roles.
* 📋 **Live Kanban Order Management**: Filter and manage incoming orders in real time with quick status toggles.
* 📷 **QR Code Scanner Verification**: Scan or input student order QR codes at the counter to instantly mark orders as `Completed`.
* 🍔 **Menu Management**: Add, edit, delete, or toggle availability (`In Stock` / `Out of Stock`) for menu items on the fly.
* 📊 **Analytics & Reporting**: Interactive revenue analytics, daily order volume charts, top-selling items breakdown, and peak ordering hours insights.

### ⚙️ Backend Architecture
* 🔄 **Async Queue Worker System**: Built-in **BullMQ** & **Redis** job processing for background tasks (e.g. automatic order cancellation for unpaid/stale orders).
* 🛡️ **Security & Rate Limiting**: Protected with **Helmet HTTP headers**, CORS restriction, and `express-rate-limit` middleware.

---

## 🛠 Tech Stack

### Frontend
| Technology | Description |
| :--- | :--- |
| **React 18** | UI framework with Hooks & Context API |
| **Vite** | Next-generation frontend build tool |
| **Tailwind CSS** | Utility-first CSS styling framework |
| **Lucide React** | Modern icon set |
| **Socket.io Client** | Real-time WebSocket listener |
| **Axios** | HTTP client with request/response interceptors |
| **React Hot Toast** | Elegant toast notification system |
| **QRCode.react** | Dynamic QR code generation for pickup passes |

### Backend
| Technology | Description |
| :--- | :--- |
| **Node.js & Express.js** | Modular RESTful API server |
| **MongoDB & Mongoose** | NoSQL database with strict schema modeling |
| **Socket.io** | Event-based real-time communication server |
| **BullMQ & IORedis** | Redis-backed asynchronous job queue processing |
| **Razorpay Node SDK** | Payment gateway order creation & signature verification |
| **JWT & Bcrypt.js** | Secure token auth & password hashing |
| **Helmet & Rate Limit** | API security and DDoS protection |

---

## 📂 Project Structure

```text
korecanteen/
├── backend/
│   ├── config/              # DB connection, Socket.io initialization
│   ├── controllers/         # Request handlers (auth, canteen, order, ml, analytics, etc.)
│   ├── jobs/                # BullMQ background workers and queue definitions
│   ├── middleware/          # JWT auth, RBAC authorization, error handling
│   ├── models/              # Mongoose Schemas (User, Canteen, MenuItem, Order, GroupOrder, etc.)
│   ├── routes/              # Express API route modules
│   ├── services/            # Business logic (ML recommendations, payments, socket handlers)
│   ├── utils/               # QR generator, helper functions
│   ├── seed.js              # Database seeder script with sample canteens & food items
│   ├── server.js            # Main Express application entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/             # Axios instance & API endpoints config
    │   ├── components/      # Shared components (Navbar, Footer, Modals, OrderCard, QRScanner)
    │   ├── context/         # AuthContext, CartContext, SocketContext
    │   ├── hooks/           # Custom React hooks
    │   ├── pages/           # Pages split into Student & Admin views
    │   │   ├── student/     # Home, Canteens, Menu, Cart, GroupOrder, Orders, Profile, Login, Register
    │   │   └── admin/       # Dashboard, AdminOrders, MenuManagement, Analytics
    │   ├── App.jsx          # Router & Route protection setup
    │   ├── index.css        # Tailwind directives & base styles
    │   └── main.jsx         # React application root
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cloud connection string)
* [Redis](https://redis.io/) (Optional, required if running background queues with BullMQ)

---

### 1. Clone the Repository
```bash
git clone https://github.com/yogi941/korecanteen.git
cd korecanteen
```

---

### 2. Backend Setup

Navigate to the `backend` directory:
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/kct-canteen?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Redis (Optional - for BullMQ queue processing)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

#### Seed Sample Data (Recommended)
Populate the database with sample canteens (e.g. CCD, Main Core Counter), menu items, and admin/student accounts:
```bash
node seed.js
```

#### Start Backend Server
```bash
# Development mode with Nodemon
npm run dev

# Production mode
npm start
```
The backend server will run on `http://localhost:5000`.

---

### 3. Frontend Setup

Open a new terminal tab and navigate to the `frontend` directory:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```

The frontend application will be live at `http://localhost:5173`.

---

## 📡 Real-Time Socket.io Events

Kore Canteen relies on WebSockets for real-time order tracking and notifications:

| Event Name | Direction | Payload / Description |
| :--- | :--- | :--- |
| `join_canteen_room` | Client ➔ Server | Join room associated with a specific canteen ID |
| `join_user_room` | Client ➔ Server | Join personal notification channel for live order updates |
| `order_status_updated` | Server ➔ Client | Emitted when staff changes order status (`Preparing`, `Ready`, etc.) |
| `new_order_placed` | Server ➔ Client | Notifies canteen staff dashboard of incoming orders instantly |
| `group_cart_updated` | Server ➔ Client | Syncs item additions/deletions across group order participants |

---

## 🔗 Main API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
* `POST /api/auth/register` - Student / User registration
* `POST /api/auth/login` - User authentication & JWT generation
* `GET /api/auth/profile` - Get logged-in user details

### 🏢 Canteens & Menus (`/api/canteens`, `/api/menu`)
* `GET /api/canteens` - Fetch all active canteens
* `GET /api/menu?canteen=<id>` - Get menu items filtered by canteen, category, or search query
* `POST /api/menu` - *(Admin)* Create new menu item
* `PUT /api/menu/:id` - *(Admin)* Update menu item details / stock status

### 🛒 Cart & Group Orders (`/api/cart`, `/api/group`)
* `GET /api/cart` - Get user's active cart items
* `POST /api/cart` - Add item to cart
* `POST /api/group/create` - Host a new group order session
* `POST /api/group/join` - Join an existing group session with code

### 📦 Orders & Payments (`/api/orders`)
* `POST /api/orders` - Place a new individual or group order
* `GET /api/orders/my-orders` - Get current user's order history
* `POST /api/orders/create-razorpay-order` - Initialize Razorpay transaction
* `POST /api/orders/verify-payment` - Verify Razorpay payment signature
* `POST /api/orders/qr-verify` - *(Staff)* Scan and verify QR pickup code

### 🤖 Machine Learning / AI (`/api/ml`)
* `GET /api/ml/recommendations` - Get AI/ML personalized food recommendations

---

## 🔄 Order Lifecycle Workflow

```text
[ Student ]                                    [ Canteen Staff ]
     │                                                 │
     ├─► Browse Canteens & Select Menu                 │
     ├─► (Optional) Invite Friends to Group Cart      │
     ├─► Place Order (Razorpay / Cash)                │
     │        │                                        │
     │        └─── Socket Event: `new_order_placed` ──►│
     │                                                 ├─► Order Appears on Admin Kanban
     │◄── Socket Event: `order_status_updated` ────────┤─► Status: "Preparing"
     │                                                 │
     │◄── Socket Event: `order_status_updated` ────────┤─► Status: "Ready for Pickup"
     │    (Student gets QR Code Pickup Pass)           │
     │                                                 │
     ├─► Arrives at Counter & Shows QR Pass ──────────►│
     │                                                 ├─► Staff Scans QR Pass
     │                                                 └─► Status: "Completed"
```

---

## 🤝 Contributing

Contributions are welcome! Follow these steps to contribute:

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 👩‍💻 Author & Maintainer

**Priya**  
*Department of Information Technology*  
*Kumaraguru College of Technology (KCT)*  

🐙 **GitHub**: [@yogi941](https://github.com/yogi941)

---



