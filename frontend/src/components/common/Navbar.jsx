import { Link, useNavigate, useLocation } from 'react';
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
    <nav className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-50 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAdmin ? '/admin/dashboard' : '/home'} className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25 ring-2 ring-amber-500/20"
            >
              <UtensilsCrossed className="w-5 h-5 text-slate-950 font-bold" />
            </motion.div>
            <span className="font-black text-slate-100 text-xl tracking-tight group-hover:text-amber-400 transition-colors">
              KORE<span className="text-amber-400">Canteen</span>
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
                  className={`relative px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide transition-all ${
                    isActive
                      ? 'text-amber-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2.5">
            {!isAdmin && (
              <Link to="/cart">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all shadow-md"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-black shadow-lg shadow-amber-500/30"
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
                className="relative p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all shadow-md"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 bg-amber-400 rounded-full w-2 h-2 animate-ping" />
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-2xl"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/80">
                      <h3 className="font-extrabold text-slate-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-[11px] text-amber-400 hover:text-amber-300 font-bold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-slate-500 text-xs">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => handleMarkAsRead(notif._id)}
                            className={`px-4 py-3 text-left transition-colors cursor-pointer ${
                              notif.isRead ? 'bg-slate-900/40 hover:bg-slate-800/40' : 'bg-amber-500/10 hover:bg-amber-500/15'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {!notif.isRead && (
                                <span className="w-2 h-2 mt-1.5 bg-amber-400 rounded-full shrink-0 animate-pulse" />
                              )}
                              <div>
                                <p className={`text-xs ${notif.isRead ? 'text-slate-300 font-semibold' : 'text-amber-300 font-extrabold'}`}>
                                  {notif.title}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                                  {notif.message}
                                </p>
                                <p className="text-[9px] text-slate-500 mt-1 font-mono">
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
                className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all shadow-md"
              >
                <User className="w-4 h-4" />
              </motion.div>
            </Link>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/30"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </motion.button>

            <button
              className="md:hidden p-2 text-slate-400 hover:text-slate-200"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden border-t border-slate-800 py-3 space-y-1"
          >
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-xs font-extrabold ${
                  location.pathname === link.path
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl"
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
