const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const canteenRoutes = require('./routes/canteenRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const groupOrderRoutes = require('./routes/groupOrderRoutes');
const mlRoutes = require('./routes/mlRoutes');
const { getAdminAnalytics } = require('./controllers/analyticsController');
const { verifyAndCollectQR } = require('./controllers/qrVerificationController');
const protect = require('./middleware/authMiddleware');
const authorize = require('./middleware/roleMiddleware');
const { initWorkers } = require('./jobs/workers');

connectDB();
initWorkers();

const app = express();
const server = http.createServer(app);

initSocket(server);

app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter);

app.get('/', (req, res) => res.json({ message: 'Kore Canteen API Server is running', health: '/api/health' }));
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));
app.use('/api/auth', authRoutes);
app.use('/api/canteens', canteenRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/group', groupOrderRoutes);
app.use('/api/ml', mlRoutes);

// Analytics and QR Pickup verification endpoints
app.get('/api/analytics', protect, authorize('canteen_admin', 'super_admin', 'shop_manager'), getAdminAnalytics);
app.post('/api/orders/qr-verify', protect, authorize('canteen_admin', 'super_admin', 'shop_manager'), verifyAndCollectQR);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`));
