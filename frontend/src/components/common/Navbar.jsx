import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, LogOut, User, UtensilsCrossed, Menu, X, Bell, Sparkles } from 'lucide-react';
import { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import { CartContext } from '../../context/CartContext';
import useSocket from '../../hooks/useSocket';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../api/notificationApi';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      const { data } = await getNotifications();
      setNotifications(data.data?.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      toast.success(`${notification.title}: ${notification.message}`, {
        duration: 5000,
        position: 'top-right',
      });
    });
    return () => {
      socket.off('new_notification');
    };
  }, [socket]);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'canteen_admin' || user?.role === 'super_admin';

  const studentLinks = [
    { label: 'Home', path: '/home' },
    { label: 'Canteens', path: '/canteens' },
    { label: 'Group Orders', path: '/group' },
    { label: 'My Orders', path: '/orders' },
  ];

  const adminLinks = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Orders', path: '/admin/orders' },
    { label: 'Menu', path: '/admin/menu' },
    { label: 'Analytics', path: '/admin/analytics' },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAdmin ? '/admin/dashboard' : '/home'} className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20 text-white"
            >
              <UtensilsCrossed className="w-5 h-5 stroke-[2.5]" />
            </motion.div>
            <span className="font-black text-slate-900 text-xl tracking-tight group-hover:text-orange-500 transition-colors">
              KORE<span className="text-orange-500">Canteen</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
                    isActive
                      ? 'text-orange-600 bg-orange-50/80'
                      : 'text-slate-600 hover:text-orange-600 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicatorLight"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-orange-500 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {!isAdmin && (
              <Link to="/cart">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2.5 rounded-xl bg-gray-50 border border-gray-200/80 text-slate-700 hover:text-orange-500 hover:border-orange-300 transition-all shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-black shadow-md shadow-orange-500/30"
                    >
                      {totalItems > 9 ? '9+' : totalItems}
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl bg-gray-50 border border-gray-200/80 text-slate-700 hover:text-orange-500 hover:border-orange-300 transition-all shadow-sm"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 bg-orange-500 rounded-full w-2 h-2 animate-ping" />
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60">
                      <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-[11px] text-orange-500 hover:text-orange-600 font-bold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-400 text-xs">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => handleMarkAsRead(notif._id)}
                            className={`px-4 py-3 text-left transition-colors cursor-pointer ${
                              notif.isRead ? 'bg-white hover:bg-gray-50' : 'bg-orange-50/30 hover:bg-orange-50/50'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {!notif.isRead && (
                                <span className="w-2 h-2 mt-1.5 bg-orange-500 rounded-full shrink-0" />
                              )}
                              <div>
                                <p className={`text-xs ${notif.isRead ? 'text-slate-800 font-semibold' : 'text-slate-950 font-extrabold'}`}>
                                  {notif.title}
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                  {notif.message}
                                </p>
                                <p className="text-[9px] text-slate-400 mt-1">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile & Logout */}
            <Link to={isAdmin ? '/admin/dashboard' : '/profile'}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-xl bg-gray-50 border border-gray-200/80 text-slate-700 hover:text-orange-500 hover:border-orange-300 transition-all shadow-sm"
              >
                <User className="w-4 h-4" />
              </motion.div>
            </Link>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </motion.button>

            <button
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden border-t border-gray-100 py-3 space-y-1"
          >
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-xs font-bold ${
                  location.pathname === link.path
                    ? 'bg-orange-50 text-orange-500 font-extrabold'
                    : 'text-slate-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
