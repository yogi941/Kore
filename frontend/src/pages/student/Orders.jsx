import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Clock, CheckCircle, XCircle, ChefHat, Package, Eye, X } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Loader from '../../components/common/Loader';
import { getStudentOrders, cancelOrder } from '../../api/orderApi';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  accepted: { label: 'Accepted', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  preparing: { label: 'Preparing', color: 'bg-purple-100 text-purple-700', icon: ChefHat },
  ready: { label: 'Ready for Pickup', color: 'bg-green-100 text-green-700', icon: Package },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-600', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600', icon: XCircle },
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState(null);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

        {loading ? (
          <Loader text="Loading orders..." />
        ) : orders.length === 0 ? (
          <div className="text-center bg-white border border-gray-100 rounded-2xl p-16">
            <span className="text-5xl">📋</span>
            <h2 className="text-lg font-bold text-gray-900 mt-4 mb-2">No orders placed yet</h2>
            <p className="text-gray-500 text-sm">Order some tasty food from our canteens!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusInfo.icon;
              return (
                <div key={order._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase">Order No.</p>
                      <h3 className="font-bold text-gray-900">#{order.orderNumber}</h3>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusInfo.label}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Canteen</p>
                      <p className="font-medium text-gray-900">{order.canteen?.name}</p>
                      <p className="text-xs text-gray-500">{order.canteen?.location}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Pickup Slot</p>
                      <p className="font-medium text-gray-900">{order.pickupSlot?.label}</p>
                      <p className="text-xs text-gray-500">{order.pickupSlot?.time}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Payment Status</p>
                      <p className={`font-semibold capitalize ${
                        order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {order.paymentStatus}
                      </p>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="bg-gray-50 rounded-xl p-3 mb-4">
                    <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Items</p>
                    <div className="space-y-1.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.name} <span className="text-gray-400 font-normal">x{item.quantity}</span></span>
                          <span className="font-medium text-gray-900">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between border-t border-gray-200 mt-2 pt-2 font-bold text-gray-900 text-sm">
                      <span>Total Amount</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {order.status === 'ready' && (
                      <button
                        onClick={() => setSelectedQR(order)}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                      >
                        <Eye className="w-4 h-4" /> View QR Token
                      </button>
                    )}
                    {['pending', 'accepted'].includes(order.status) && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold px-4 py-2 rounded-xl transition-colors border border-red-100"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedQR(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedQR(null)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Pickup Token</h3>
            <p className="text-xs text-gray-500 mb-6">Show this QR code at the canteen counter to claim your food</p>
            <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl inline-block mb-4 shadow-inner">
              <QRCodeSVG value={JSON.stringify({
                orderId: selectedQR._id,
                orderNumber: selectedQR.orderNumber,
                pickupToken: selectedQR.pickupToken,
                studentId: selectedQR.student
              })} size={200} />
            </div>
            <p className="font-bold text-gray-800 text-sm">#{selectedQR.orderNumber}</p>
            <p className="text-xs text-gray-400 mt-1">Canteen: {selectedQR.canteen?.name}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
