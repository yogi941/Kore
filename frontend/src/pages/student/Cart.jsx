import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, Clock, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import WaitingTimeWidget from '../../components/student/WaitingTimeWidget';
import { CartContext } from '../../context/CartContext';
import { placeOrder, validateCart, createPayment, verifyPayment } from '../../api/orderApi';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

const PICKUP_SLOTS = [
  { label: 'Immediate Pickup (ML Optimized)', time: 'Fast preparation & live kitchen queue priority' },
  { label: 'Morning Break (10:30 AM)', time: 'Pre-order for Morning Break' },
  { label: 'Lunch Break (12:30 PM)', time: 'Pre-order for Lunch Break' },
  { label: 'Evening Snack Break (4:30 PM)', time: 'Pre-order for Evening Break' },
];

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Cart = () => {
  const { user } = useAuth();
  const { cartItems, canteenId, totalAmount, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState(PICKUP_SLOTS[0]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [placing, setPlacing] = useState(false);

  // ML Prediction state
  const [mlPrediction, setMlPrediction] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) return;

    setMlLoading(true);
    const itemsPayload = cartItems.map((i) => ({
      category: i.category || 'lunch',
      quantity: i.quantity,
      menuItem: i._id,
    }));

    axiosInstance
      .post('/ml/predict-time', { items: itemsPayload, canteenId })
      .then((res) => {
        if (res.data.success) {
          setMlPrediction(res.data.data);
        }
      })
      .catch((err) => console.warn('ML wait prediction error:', err))
      .finally(() => setMlLoading(false));
  }, [cartItems, canteenId]);

  const handlePlaceOrder = async () => {
    if (!selectedSlot) { toast.error('Please select a pickup slot'); return; }
    if (cartItems.length === 0) { toast.error('Your cart is empty'); return; }

    setPlacing(true);
    try {
      // 1. Validate the cart items
      const cartPayload = cartItems.map((i) => ({ menuItem: i._id, quantity: i.quantity }));
      await validateCart(cartPayload);

      // 2. Load the Razorpay SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setPlacing(false);
        return;
      }

      // 3. Create the order in the database
      const orderPayload = {
        canteenId,
        items: cartPayload,
        pickupSlot: selectedSlot,
        specialInstructions,
      };
      const { data: orderData } = await placeOrder(orderPayload);
      const dbOrder = orderData.data;

      // 4. Create the Razorpay transaction on backend
      const { data: payData } = await createPayment(dbOrder._id);
      const rzpOptions = payData.data;

      // 5. Open Razorpay Checkout overlay
      if (rzpOptions.isMock) {
        if (window.confirm("Mock Payment Mode Active:\nWould you like to simulate a successful payment?")) {
          try {
            setPlacing(true);
            await verifyPayment(dbOrder._id, {
              razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).substr(2, 9),
              razorpay_order_id: rzpOptions.rzpOrderId,
              razorpay_signature: 'mock_signature',
            });
            clearCart();
            toast.success('Mock payment successful!');
            navigate('/orders');
          } catch (err) {
            toast.error(err.response?.data?.message || 'Mock verification failed');
          } finally {
            setPlacing(false);
          }
        } else {
          setPlacing(false);
        }
        return;
      }

      const options = {
        key: rzpOptions.keyId,
        amount: rzpOptions.amount,
        currency: rzpOptions.currency,
        name: 'KORE Canteen Payment',
        description: `Order #${rzpOptions.orderNumber}`,
        order_id: rzpOptions.rzpOrderId,
        handler: async (response) => {
          try {
            setPlacing(true);
            await verifyPayment(dbOrder._id, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            clearCart();
            toast.success('Payment verified successfully!');
            navigate('/orders');
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
          } finally {
            setPlacing(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#f59e0b',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize checkout');
    } finally {
      setPlacing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-7xl mb-6"
          >
            🛒
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Your cart is empty</h2>
          <p className="text-slate-400 text-sm mb-8">Browse canteen menus and add items to your cart</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/canteens')}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-amber-500/20"
          >
            Explore Canteens
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight flex items-center gap-3">
              <ShoppingBag className="w-7 h-7 text-amber-500" />
              Checkout & Review
            </h1>
            <p className="text-xs text-slate-400 mt-1">Review your items and estimated pickup time</p>
          </div>

          <button
            onClick={() => { if (window.confirm('Clear all items from your cart?')) clearCart(); }}
            className="text-xs text-slate-500 hover:text-rose-400 transition-colors font-medium"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Cart Items & Instructions */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Cart Items ({cartItems.length})</h3>
            
            {cartItems.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-lg backdrop-blur-md"
              >
                <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-3xl shrink-0 overflow-hidden border border-slate-700/50">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    '🍛'
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-100 text-sm truncate">{item.name}</h4>
                  <span className="text-amber-400 font-extrabold text-sm">₹{item.price}</span>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 bg-slate-950/80 border border-slate-800 rounded-xl px-2 py-1">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </motion.button>

                  <span className="w-5 text-center text-sm font-bold text-slate-100">{item.quantity}</span>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </motion.button>
                </div>

                <div className="text-right w-16 shrink-0">
                  <span className="text-sm font-black text-slate-100">
                    ₹{item.price * item.quantity}
                  </span>
                </div>

                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-slate-600 hover:text-rose-400 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}

            {/* Special Instructions */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-md">
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Special Kitchen Instructions (optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g., Less spicy, extra chutney..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
          </div>

          {/* Right Column: ML Prediction Widget & Summary */}
          <div className="lg:col-span-5 space-y-5">
            {/* Live ML Waiting Time Prediction Widget */}
            <WaitingTimeWidget prediction={mlPrediction} loading={mlLoading} />

            {/* Pickup Slot Selection */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
              <h3 className="font-bold text-slate-200 text-sm mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" /> Choose Pickup Schedule
              </h3>

              <div className="space-y-2">
                {PICKUP_SLOTS.map((slot) => (
                  <motion.button
                    key={slot.label}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedSlot(slot)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all ${
                      selectedSlot?.label === slot.label
                        ? 'border-amber-500/60 bg-amber-500/10 text-amber-300 font-semibold shadow-lg shadow-amber-500/5'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <p className="font-bold text-slate-200">{slot.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{slot.time}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Bill Summary Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
              <h3 className="font-bold text-slate-200 text-sm mb-4">Payment Summary</h3>

              <div className="space-y-2.5 text-xs text-slate-400 mb-5">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-200">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Platform Fee</span>
                  <span>FREE (Campus)</span>
                </div>
                <div className="border-t border-slate-800 pt-3 flex justify-between font-black text-slate-100 text-lg">
                  <span>Total Amount</span>
                  <span className="text-amber-400">₹{totalAmount}</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
                disabled={placing || !selectedSlot}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-extrabold py-4 rounded-2xl text-sm transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <span>{placing ? 'Processing Order...' : `Pay & Place Order · ₹${totalAmount}`}</span>
                {!placing && <ArrowRight className="w-4 h-4" />}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
