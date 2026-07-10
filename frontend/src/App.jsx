import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Login from './pages/student/Login';
import Register from './pages/student/Register';
import Home from './pages/student/Home';
import Canteens from './pages/student/Canteens';
import Menu from './pages/student/Menu';
import Cart from './pages/student/Cart';
import Orders from './pages/student/Orders';
import Profile from './pages/student/Profile';

import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/AdminOrders';
import MenuManagement from './pages/admin/MenuManagement';
import Analytics from './pages/admin/Analytics';

// Smart root redirect: always runs inside AuthProvider
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'canteen_admin' || user.role === 'super_admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/home" replace />;
};

// Inner app that has access to AuthProvider context
const AppRoutes = () => (
  <>
    <Toaster position="top-right" />
    <Routes>
      {/* Root: smart redirect based on auth state */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student protected routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/home" element={<Home />} />
        <Route path="/canteens" element={<Canteens />} />
        <Route path="/canteens/:id/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Admin protected routes */}
      <Route element={<ProtectedRoute allowedRoles={['canteen_admin', 'super_admin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/menu" element={<MenuManagement />} />
        <Route path="/admin/analytics" element={<Analytics />} />
      </Route>

      {/* Catch-all: go back to root smart redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
