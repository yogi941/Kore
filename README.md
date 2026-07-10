# 🍽️ KCT Canteen - Smart Canteen Pre-Ordering System

A full-stack web application that enables students to **pre-order food from campus canteens**, reducing waiting time during breaks and improving the overall canteen experience.

---

## 📌 Overview

KCT Canteen is a smart food ordering platform designed for educational institutions. Students can browse menus, place orders in advance, receive live order updates, and collect food without standing in long queues.

The system also provides an admin dashboard for canteen staff to manage menu items, monitor incoming orders, and update order status in real time.

---

## ✨ Features

### 👨‍🎓 Student

* Secure Authentication (JWT)
* Browse available canteens
* View menu items
* Add items to cart
* Place food orders
* View order history
* Live order status updates
* QR Code for order pickup
* Notifications

### 👨‍🍳 Admin

* Admin Login
* Dashboard
* Manage Menu
* Add/Edit/Delete Menu Items
* View Incoming Orders
* Update Order Status
* Analytics Dashboard
* Send Notifications

---

## 🛠 Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* React Context API
* Axios
* Socket.io Client

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Socket.io

### Tools

* Git
* GitHub
* Postman

---

## 📂 Project Structure

```text
kct-canteen/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── context/
    │   ├── hooks/
    │   ├── pages/
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/kct-canteen.git

cd kct-canteen
```

---

### 2. Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file:

```env
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret_key
```

Run backend

```bash
npm start
```

or

```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

## 🔗 API Modules

* Authentication
* Canteens
* Menu
* Cart
* Orders
* Notifications
* Admin

---

## 📡 Real-Time Features

Using **Socket.io**

* Live order updates
* Order accepted
* Preparing
* Ready for pickup
* Notifications

---

## 🔐 Authentication

JWT-based authentication is used.

Roles supported:

* Student
* Admin

Protected routes ensure only authorized users can access restricted pages.

---

## 📷 Screens (Planned)

* Login
* Register
* Home
* Canteens
* Menu
* Cart
* Orders
* Admin Dashboard
* Analytics

---

## 🔄 Order Workflow

```text
Student Login
      │
      ▼
Browse Canteens
      │
      ▼
Select Menu Items
      │
      ▼
Add to Cart
      │
      ▼
Place Order
      │
      ▼
Order Received
      │
      ▼
Preparing
      │
      ▼
Ready for Pickup
      │
      ▼
Collected
```

---

## 📈 Future Improvements

* UPI Payment Integration
* AI-Based Food Recommendations
* Estimated Waiting Time
* Inventory Management
* Coupon System
* Feedback & Ratings
* Multi-Campus Support
* Push Notifications
* Dark Mode

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Add new feature"
```

4. Push changes

```bash
git push origin feature-name
```

5. Open a Pull Request

---

## 👨‍💻 Author

**Priya**

B.E. Information Technology

Kumaraguru College of Technology

GitHub: https://github.com/yogi941

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.
