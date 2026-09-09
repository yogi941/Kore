import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { Users, Copy, ShieldCheck, ShoppingCart, CheckCircle, Trash2, ArrowRight } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export default function GroupOrder() {
  const { groupCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [groupOrder, setGroupOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [canteens, setCanteens] = useState([]);
  const [selectedCanteen, setSelectedCanteen] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001');
    setSocket(s);
    return () => s.disconnect();
  }, []);

  const fetchGroupDetails = async (code) => {
    try {
      const res = await axiosInstance.get(`/group/${code}`);
      if (res.data.success) {
        setGroupOrder(res.data.data);
      }
    } catch (err) {
      toast.error('Group Order not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupCode) {
      fetchGroupDetails(groupCode);
    } else {
      setLoading(false);
      axiosInstance.get('/canteens').then((r) => setCanteens(r.data.data || []));
    }
  }, [groupCode]);

  useEffect(() => {
    if (!socket || !groupCode) return;

    socket.emit('join_room', `group_${groupCode}`);

    socket.on('group_member_joined', ({ user: joinedUser }) => {
      toast.success(`${joinedUser.name} joined the group!`);
      fetchGroupDetails(groupCode);
    });

    socket.on('group_cart_updated', (updatedGroup) => {
      setGroupOrder(updatedGroup);
    });

    socket.on('group_order_finalized', ({ parentOrderId }) => {
      toast.success('Group Order finalized by leader!');
      navigate('/orders');
    });

    return () => {
      socket.off('group_member_joined');
      socket.off('group_cart_updated');
      socket.off('group_order_finalized');
    };
  }, [socket, groupCode, navigate]);

  const handleCreateGroup = async () => {
    if (!selectedCanteen) return toast.error('Please select a canteen');
    try {
      const res = await axiosInstance.post('/group/create', { canteenId: selectedCanteen });
      if (res.data.success) {
        toast.success('Group Order created!');
        navigate(`/group/${res.data.data.groupOrder.groupCode}`);
      }
    } catch (err) {
      toast.error('Failed to create group');
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!joinCodeInput) return;
    try {
      const res = await axiosInstance.post('/group/join', { groupCode: joinCodeInput });
      if (res.data.success) {
        toast.success('Joined group!');
        navigate(`/group/${joinCodeInput.toUpperCase()}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid group code');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await axiosInstance.delete(`/group/${groupCode}/items/${itemId}`);
      toast.success('Item removed');
    } catch (err) {
      toast.error('Could not remove item');
    }
  };

  const handleFinalize = async () => {
    try {
      const res = await axiosInstance.post(
        `/group/${groupCode}/finalize`,
        { pickupSlot: { label: 'Standard Group Pickup' } }
      );
      if (res.data.success) {
        toast.success('Order submitted to kitchen!');
        navigate('/orders');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Finalize failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
      </div>
    );
  }

  // View when NO groupCode in URL (Create/Join landing view)
  if (!groupCode) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-orange-100 rounded-2xl text-orange-600 mb-3">
            <Users className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Group Ordering</h1>
          <p className="text-gray-500 mt-2">Order together with friends & split payments seamlessly.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Group Box */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Start a Group Order</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Campus Canteen</label>
                <select
                  value={selectedCanteen}
                  onChange={(e) => setSelectedCanteen(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="">-- Choose Canteen --</option>
                  {canteens.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleCreateGroup}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                Create Group Session <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Join Group Box */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Join Existing Group</h2>
            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter 6-Digit Group Code</label>
                <input
                  type="text"
                  placeholder="e.g. K8F92A"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm tracking-widest font-mono uppercase focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                Join Group <Users className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Active Group Order Room View
  const isLeader = groupOrder?.leader?._id === user?._id || groupOrder?.leader === user?._id;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-6 rounded-2xl shadow-lg mb-8 flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="bg-white/20 text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wide">
            {groupOrder?.canteen?.name || 'Campus Canteen'}
          </span>
          <h1 className="text-2xl font-black mt-1">Group Order Room</h1>
          <p className="text-orange-100 text-sm">Real-Time Shared Cart & Multi-User Billing</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 flex items-center gap-4">
          <div>
            <span className="text-xs text-orange-200 block">JOIN CODE</span>
            <span className="text-2xl font-mono font-bold tracking-widest">{groupCode}</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(groupCode);
              toast.success('Code copied!');
            }}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Group Members */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" /> Connected Members ({groupOrder?.members?.length || 0})
            </h3>
            <ul className="space-y-2">
              {groupOrder?.members?.map((m, idx) => (
                <li key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-sm">
                  <span className="font-medium text-gray-700">{m.name}</span>
                  {m.user === groupOrder.leader._id && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-semibold">
                      Leader
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Shared Items & Finalize */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Group Items</h3>

            {(!groupOrder?.items || groupOrder.items.length === 0) ? (
              <div className="text-center py-8 text-gray-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No items added yet. Members can add items from Menu!</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {groupOrder.items.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50">
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <span className="text-xs text-gray-500">
                        Added by <strong className="text-orange-600">{item.addedByName}</strong> • Qty: {item.quantity}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
                      {(item.addedBy === user?._id || isLeader) && (
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total and Action */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 block">TOTAL GROUP AMOUNT</span>
                <span className="text-2xl font-black text-gray-900">₹{groupOrder?.totalAmount || 0}</span>
              </div>

              {isLeader ? (
                <button
                  onClick={handleFinalize}
                  disabled={!groupOrder?.items || groupOrder.items.length === 0}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl font-bold shadow-md transition-colors"
                >
                  Finalize & Send to Kitchen
                </button>
              ) : (
                <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200 font-medium">
                  Waiting for Leader to Finalize
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
