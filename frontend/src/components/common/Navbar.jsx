import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, LogOut, User, UtensilsCrossed, Menu, X, Bell } from 'lucide-react';
import { useState, useContext, useEffect } from 'react';
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
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAdmin ? '/admin/dashboard' : '/home'} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">KCT<span className="text-orange-500">Eats</span></span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-orange-500'
                    : 'text-gray-600 hover:text-orange-500'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {!isAdmin && (
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-orange-500 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
            )}
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-orange-500 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-orange-500 rounded-full w-2 h-2" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900 text-[11px] uppercase tracking-wider">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                      >
                        Mark all as read
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
                            notif.isRead ? 'bg-white hover:bg-gray-50/50' : 'bg-orange-50/20 hover:bg-orange-50/30'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {!notif.isRead && (
                              <span className="w-1.5 h-1.5 mt-1.5 bg-orange-500 rounded-full shrink-0" />
                            )}
                            <div>
                              <p className={`text-xs ${notif.isRead ? 'text-gray-800 font-medium' : 'text-gray-950 font-bold'}`}>
                                {notif.title}
                              </p>
                              <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                                {notif.message}
                              </p>
                              <p className="text-[9px] text-gray-400 mt-1">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link to={isAdmin ? '/admin/dashboard' : '/profile'} className="p-2 text-gray-600 hover:text-orange-500 transition-colors">
              <User className="w-5 h-5" />
            </Link>
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1 text-sm text-gray-600 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === link.path
                    ? 'bg-orange-50 text-orange-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
