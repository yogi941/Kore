import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Clock } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import { CartContext } from '../../context/CartContext';
import { placeOrder, validateCart, createPayment, verifyPayment } from '../../api/orderApi';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

const PICKUP_SLOTS = [
  { label: 'Immediate Pickup (10-15 mins)', time: 'Fast preparation order' },
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
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [placing, setPlacing] = useState(false);

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
        name: 'KCTEats Payment',
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
          color: '#f97316',
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

  const getIstTime = () => {
    const now = new Date();
    const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    return new Date(istString);
  };

  const isSlotExpired = (label) => {
    const ist = getIstTime();
    const currentMins = (ist.getHours() * 60) + ist.getMinutes();
    const name = label.toLowerCase();

    // Morning Break: Active only between 8:30 AM (510 mins) and 10:15 AM (615 mins)
    if (name.includes('morning') || name.includes('breakfast')) {
      return currentMins < 510 || currentMins > 615;
    }
    // Lunch Break: Active only between 11:00 AM (660 mins) and 12:15 PM (735 mins)
    if (name.includes('lunch')) {
      return currentMins < 660 || currentMins > 735;
    }
    return true;
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-7xl mb-4">🛒</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-sm mb-6">Add items from a canteen to get started</p>
          <button onClick={() => navigate('/canteens')}
            className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-orange-600 transition-colors">
            Browse Canteens
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-orange-500" /> Your Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item) => (
              <div key={item._id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                  {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" /> : '🍛'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                  <p className="text-orange-500 font-semibold text-sm">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-orange-100 transition-colors">
                    <Minus className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                  <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition-colors">
                    <Plus className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
                <p className="text-sm font-bold text-gray-900 w-14 text-right flex-shrink-0">
                  ₹{item.price * item.quantity}
                </p>
                <button onClick={() => removeFromCart(item._id)}
                  className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Special Instructions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions (optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g., Less spicy, extra chutney..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 resize-none"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            {/* Pickup Slot */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" /> Select Pickup Slot
              </h3>
              <div className="space-y-2">
                {PICKUP_SLOTS.map((slot) => (
                  <button
                    key={slot.label}
                    onClick={() => setSelectedSlot(slot)}
                    className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${
                      selectedSlot?.label === slot.label
                        ? 'border-orange-400 bg-orange-50 text-orange-700 font-semibold'
                        : 'border-gray-200 hover:border-orange-200 text-gray-700'
                    }`}
                  >
                    <p className="font-medium">{slot.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{slot.time}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Bill Summary</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Item Total</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>₹0</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={placing || !selectedSlot}
                className="w-full mt-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                {placing ? 'Placing Order...' : `Place Order · ₹${totalAmount}`}
              </button>
              <button onClick={() => { if (window.confirm('Clear cart?')) clearCart(); }}
                className="w-full mt-2 text-sm text-gray-400 hover:text-red-400 transition-colors">
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
