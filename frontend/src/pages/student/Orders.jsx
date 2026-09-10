import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Clock, CheckCircle, XCircle, ChefHat, Package, Eye, X, QrCode, Sparkles } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Loader from '../../components/common/Loader';
import LiveOrderTracker from '../../components/student/LiveOrderTracker';
import { getStudentOrders, cancelOrder } from '../../api/orderApi';
import useSocket from '../../hooks/useSocket';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Clock },
  accepted: { label: 'Accepted', color: 'bg-sky-500/10 text-sky-400 border-sky-500/30', icon: CheckCircle },
  preparing: { label: 'Preparing', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', icon: ChefHat },
  ready: { label: 'Ready for Pickup', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: Package },
  completed: { label: 'Completed', color: 'bg-slate-800 text-slate-400 border-slate-700', icon: CheckCircle },
  collected: { label: 'Collected', color: 'bg-slate-800 text-slate-400 border-slate-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: XCircle },
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState(null);
  const socket = useSocket();

  const fetchOrders = async () => {
    try {
      const { data } = await getStudentOrders();
      setOrders(data.data.orders || []);
    } catch {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Socket listener for real-time order status updates
  useEffect(() => {
    if (!socket) return;

    socket.on('order_status_updated', (updatedOrder) => {
      toast.success(`Order #${updatedOrder.orderNumber} status: ${updatedOrder.status.toUpperCase()}`);
      fetchOrders();
    });

    return () => {
      socket.off('order_status_updated');
    };
  }, [socket]);

  const handleCancelOrder = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await cancelOrder(id);
      toast.success('Order cancelled successfully');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const activeOrders = orders.filter((o) => ['pending', 'accepted', 'preparing', 'ready'].includes(o.status));
  const pastOrders = orders.filter((o) => ['completed', 'collected', 'cancelled'].includes(o.status));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight flex items-center gap-2">
              <span>My Orders & Real-time Tracking</span>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h1>
            <p className="text-xs text-slate-400 mt-1">Track active orders with live countdown timers</p>
          </div>
        </div>

        {loading ? (
          <Loader text="Syncing orders..." />
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center bg-slate-900/60 border border-slate-800 rounded-3xl p-16 shadow-2xl backdrop-blur-md"
          >
            <span className="text-6xl mb-4 block">📋</span>
            <h2 className="text-xl font-bold text-slate-100 mb-2">No orders placed yet</h2>
            <p className="text-slate-400 text-sm">Order some delicious food from campus canteens!</p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Active Orders Section */}
            {activeOrders.length > 0 && (
              <div>
                <h2 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  Active Orders ({activeOrders.length})
                </h2>

                <div className="space-y-4">
                  {activeOrders.map((order) => (
                    <LiveOrderTracker
                      key={order._id}
                      order={order}
                      onShowQR={(ord) => setSelectedQR(ord)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past Orders History Section */}
            <div>
              <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-4">
                Order History ({pastOrders.length})
              </h2>

              <div className="space-y-4">
                {(activeOrders.length === 0 ? orders : pastOrders).map((order) => {
                  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md hover:border-slate-700 transition-all"
                    >
                      <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-800">
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Order No.</p>
                          <h3 className="font-extrabold text-slate-100 text-base">#{order.orderNumber}</h3>
                        </div>

                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusInfo.label}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mb-4">
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Canteen</p>
                          <p className="font-bold text-slate-200">{order.canteen?.name}</p>
                          <p className="text-[11px] text-slate-400">{order.canteen?.location}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Pickup Slot</p>
                          <p className="font-bold text-slate-200">{order.pickupSlot?.label}</p>
                          <p className="text-[11px] text-slate-400">{order.pickupSlot?.time}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Payment Status</p>
                          <p className={`font-extrabold capitalize ${
                            order.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            {order.paymentStatus}
                          </p>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 mb-4">
                        <div className="space-y-1.5">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <span className="text-slate-300 font-medium">
                                {item.name || item.menuItem?.name} <span className="text-slate-500 font-normal">x{item.quantity}</span>
                              </span>
                              <span className="font-bold text-slate-200">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between border-t border-slate-800 mt-2.5 pt-2 font-black text-slate-100 text-sm">
                          <span>Total Amount</span>
                          <span className="text-amber-400">₹{order.totalAmount}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {order.qrCode && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedQR(order)}
                            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-amber-500/10"
                          >
                            <QrCode className="w-4 h-4" /> View QR Token
                          </motion.button>
                        )}
                        {['pending', 'accepted'].includes(order.status) && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold px-4 py-2 rounded-xl transition-colors border border-rose-500/30"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {selectedQR && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setSelectedQR(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 w-full max-w-sm text-center relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setSelectedQR(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-extrabold text-slate-100 text-lg mb-1">Live Pickup QR Code</h3>
              <p className="text-xs text-slate-400 mb-6">Scan at the canteen counter to verify pickup</p>

              <div className="bg-white p-6 rounded-2xl inline-block mb-4 shadow-xl">
                <QRCodeSVG
                  value={JSON.stringify({
                    orderId: selectedQR._id,
                    orderNumber: selectedQR.orderNumber,
                    pickupToken: selectedQR.pickupToken,
                    studentId: selectedQR.student
                  })}
                  size={200}
                />
              </div>

              <p className="font-black text-amber-400 text-base">Order #{selectedQR.orderNumber}</p>
              <p className="text-xs text-slate-400 mt-1">Canteen: {selectedQR.canteen?.name}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;
