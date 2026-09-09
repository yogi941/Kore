import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, QrCode, Sparkles } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Loader from '../../components/common/Loader';
import QRScannerModal from '../../components/admin/QRScannerModal';
import { getCanteenOrders, updateOrderStatus, verifyPickupToken, claimOrder } from '../../api/orderApi';
import useSocket from '../../hooks/useSocket';
import toast from 'react-hot-toast';

const STATUS_FLOW = {
  pending: { next: 'accepted', label: 'Accept', color: 'bg-blue-500' },
  accepted: { next: 'preparing', label: 'Start Preparing', color: 'bg-purple-500' },
  preparing: { next: 'ready', label: 'Mark Ready', color: 'bg-green-500' },
  ready: { next: 'completed', label: 'Complete', color: 'bg-gray-500' },
  completed: null,
  cancelled: null,
};

const STATUS_BADGE = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-blue-100 text-blue-700',
  preparing: 'bg-purple-100 text-purple-700',
  ready: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
};

const AdminOrders = () => {
  const socket = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [updatingId, setUpdatingId] = useState(null);

  const [pickupTokenInput, setPickupTokenInput] = useState('');
  const [verifiedOrder, setVerifiedOrder] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const handleVerifyToken = async (e) => {
    e.preventDefault();
    if (!pickupTokenInput.trim()) return;
    setVerifying(true);
    setVerifiedOrder(null);
    try {
      const { data } = await verifyPickupToken(pickupTokenInput.trim());
      setVerifiedOrder(data.data);
      toast.success('Order found & verified!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired token');
    } finally {
      setVerifying(false);
    }
  };

  const handleClaimOrder = async () => {
    if (!verifiedOrder) return;
    setClaiming(true);
    try {
      await claimOrder(verifiedOrder._id);
      toast.success(`Order #${verifiedOrder.orderNumber} claimed successfully!`);
      setOrders(prev => prev.map(o => o._id === verifiedOrder._id ? { ...o, status: 'completed' } : o));
      setVerifiedOrder(null);
      setPickupTokenInput('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete order pickup');
    } finally {
      setClaiming(false);
    }
  };

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (statusFilter) params.status = statusFilter;
      if (date) params.date = date;
      const { data } = await getCanteenOrders(params);
      setOrders(data.data.orders || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, date]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_order', (order) => {
      setOrders((prev) => [order, ...prev]);
      toast.success(`New order #${order.orderNumber} received!`);
    });
    socket.on('order_cancelled', ({ orderId }) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: 'cancelled' } : o))
      );
    });
    return () => {
      socket.off('new_order');
      socket.off('order_cancelled');
    };
  }, [socket]);

  const handleStatusUpdate = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
      toast.success(`Order marked as ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const statuses = ['', 'pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <QRScannerModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onVerified={loadOrders}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kitchen Order Dispatch</h1>
            <p className="text-xs text-gray-500">Sorted by Priority Queue & SPT Scheduler</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <QrCode className="w-4 h-4 text-orange-400" /> Scan QR Pickup
            </button>
            <button
              onClick={loadOrders}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
          />
          <div className="flex gap-2 overflow-x-auto">
            {statuses.map((s) => (
              <button
                key={s || 'all'}
                onClick={() => setStatusFilter(s)}
                className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium capitalize transition-colors ${
                  statusFilter === s
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
                }`}
              >
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Token Verification Panel */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm">
          <h2 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
            <span>🎟️</span> Quick Pickup Token Verification
          </h2>
          <form onSubmit={handleVerifyToken} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Pickup Token (e.g. 5231)"
              value={pickupTokenInput}
              onChange={(e) => setPickupTokenInput(e.target.value)}
              className="flex-1 max-w-md px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
            />
            <button
              type="submit"
              disabled={verifying}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {verifying ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          {verifiedOrder && (
            <div className="mt-4 p-4 border border-green-100 bg-green-50/30 rounded-xl max-w-2xl">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    Order #{verifiedOrder.orderNumber}
                  </h4>
                  <p className="text-xs text-gray-500">
                    Student: {verifiedOrder.student?.name} ({verifiedOrder.student?.phone})
                  </p>
                </div>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full capitalize font-medium">
                  {verifiedOrder.status}
                </span>
              </div>
              <div className="border-t border-gray-100/55 pt-2 mt-2">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Items</p>
                {verifiedOrder.items.map((item, i) => (
                  <p key={i} className="text-sm text-gray-700 font-medium">
                    {item.menuItem?.name || item.name} × {item.quantity}
                  </p>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100/55">
                <span className="text-sm font-bold text-gray-900">Total: ₹{verifiedOrder.totalAmount}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setVerifiedOrder(null)}
                    className="text-xs text-gray-500 hover:text-gray-700 font-medium px-3 py-2 border border-gray-200 bg-white rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClaimOrder}
                    disabled={claiming}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {claiming ? 'Claiming...' : 'Confirm Delivery & Claim'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Orders Count */}
        <div className="flex gap-4 mb-4 text-sm text-gray-500">
          <span>{orders.length} order(s) found</span>
          <span className="text-orange-500 font-medium">
            {orders.filter((o) => o.status === 'pending').length} pending
          </span>
        </div>

        {/* Orders List */}
        {loading ? (
          <Loader text="Loading orders..." />
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-3">📋</p>
            <p className="font-medium">No orders found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const flow = STATUS_FLOW[order.status];
              return (
                <div key={order._id} className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex flex-wrap items-start gap-4">

                    {/* Order Info */}
                    <div className="flex-1 min-w-48">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-900">#{order.orderNumber}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{order.student?.name}</p>
                      <p className="text-xs text-gray-400">{order.student?.rollNumber || order.student?.email}</p>
                    </div>

                    {/* Items */}
                    <div className="flex-1 min-w-48">
                      <p className="text-xs text-gray-400 font-medium mb-1">ITEMS</p>
                      {order.items.map((item, i) => (
                        <p key={i} className="text-sm text-gray-700">
                          {item.name} × {item.quantity}
                        </p>
                      ))}
                      {order.specialInstructions && (
                        <p className="text-xs text-amber-600 mt-1 italic">Note: {order.specialInstructions}</p>
                      )}
                    </div>

                    {/* Slot & Amount */}
                    <div className="text-right">
                      {order.pickupSlot && (
                        <p className="text-xs text-gray-500 mb-1">
                          Pickup: {order.pickupSlot.label}
                        </p>
                      )}
                      <p className="font-bold text-gray-900">₹{order.totalAmount}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {flow && (
                        <button
                          onClick={() => handleStatusUpdate(order._id, flow.next)}
                          disabled={updatingId === order._id}
                          className={`${flow.color} text-white text-xs font-medium px-4 py-2 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap`}
                        >
                          {updatingId === order._id ? 'Updating...' : flow.label}
                        </button>
                      )}
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                          disabled={updatingId === order._id}
                          className="text-xs text-red-500 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors"
                        >
                          Reject
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminOrders;
