import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Plus, Minus, Leaf } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Loader from '../../components/common/Loader';
import { CartContext } from '../../context/CartContext';
import { fetchMenuByCanteen, fetchPopularItems } from '../../api/menuApi';
import { fetchCanteenById } from '../../api/canteenApi';

const CATEGORIES = ['all', 'breakfast', 'lunch', 'snacks', 'beverages'];

const Menu = () => {
  const { id: canteenId } = useParams();
  const { cartItems, addToCart, removeFromCart, updateQuantity } = useContext(CartContext);
  const [canteen, setCanteen] = useState(null);
  const [items, setItems] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [canteenRes, popularRes] = await Promise.all([
          fetchCanteenById(canteenId),
          fetchPopularItems(canteenId),
        ]);
        setCanteen(canteenRes.data.data);
        setPopular(popularRes.data.data || []);
      } catch {}
    };
    load();
  }, [canteenId]);

  useEffect(() => {
    const params = {};
    if (category !== 'all') params.category = category;
    if (search) params.search = search;
    if (vegOnly) params.isVeg = true;

    fetchMenuByCanteen(canteenId, params)
      .then(({ data }) => setItems(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [canteenId, category, search, vegOnly]);

  const getCartItem = (id) => cartItems.find((i) => i._id === id);

  const handleAdd = (item) => {
    addToCart({ ...item, _id: item._id }, canteenId);
  };

  const handleDecrease = (item) => {
    const existing = getCartItem(item._id);
    if (!existing) return;
    if (existing.quantity === 1) removeFromCart(item._id);
    else updateQuantity(item._id, existing.quantity - 1);
  };

  const MenuItemCard = ({ item }) => {
    const cartItem = getCartItem(item._id);
    const isAvailable = item.isAvailable !== false;
    return (
      <div className={`bg-white p-6 rounded-2xl swiggy-card-shadow border border-gray-50 flex justify-between gap-6 items-center ${
        !isAvailable ? 'opacity-65' : ''
      }`}>
        {/* Left Side: Details */}
        <div className="flex-1 flex flex-col items-start text-left">
          <div className="flex items-center gap-2 mb-2">
            <div className={item.isVeg ? "swiggy-veg-icon" : "swiggy-nonveg-icon"} />
            {!isAvailable && (
              <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded uppercase">
                Out of Stock
              </span>
            )}
          </div>
          <h4 className="font-bold text-[#282c3f] text-base">{item.name}</h4>
          <span className="font-semibold text-gray-800 text-sm mt-1">₹{item.price}</span>
          {item.description && (
            <p className="text-xs text-gray-400 mt-2 max-w-[450px] leading-relaxed">{item.description}</p>
          )}
        </div>
        
        {/* Right Side: Image and Floating Button */}
        <div className="relative w-32 h-28 flex-shrink-0">
          <div className={`w-full h-full rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center ${
            !isAvailable ? 'grayscale' : ''
          }`}>
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">🍛</span>
            )}
          </div>
          
          {/* Swiggy Orange Accent Add Button */}
          <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border border-gray-200 swiggy-card-shadow rounded-xl px-3 py-1.5 text-xs font-bold uppercase flex items-center gap-4 select-none min-w-[90px] justify-center transition-colors ${
            isAvailable ? 'text-orange-500 hover:bg-orange-50/50' : 'text-gray-400 bg-gray-100 border-gray-100 cursor-not-allowed'
          }`}>
            {!isAvailable ? (
              <span className="normal-case">Sold Out</span>
            ) : cartItem ? (
              <>
                <button onClick={() => handleDecrease(item)} className="hover:scale-125 active:scale-95 text-gray-400 font-bold px-1">-</button>
                <span className="text-orange-500 w-4 text-center">{cartItem.quantity}</span>
                <button onClick={() => handleAdd(item)} className="hover:scale-125 active:scale-95 text-orange-500 font-bold px-1">+</button>
              </>
            ) : (
              <button onClick={() => handleAdd(item)} className="w-full h-full text-center tracking-wider text-orange-500">ADD</button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Canteen Header */}
        {canteen && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center text-3xl">🍽️</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{canteen.name}</h1>
              <p className="text-gray-500 text-sm">{canteen.location}</p>
            </div>
            <div className={`ml-auto px-3 py-1.5 rounded-xl text-xs font-medium ${
              canteen.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
            }`}>
              {canteen.isOpen ? 'Open Now' : 'Closed'}
            </div>
          </div>
        )}

        {/* Popular Items */}
        {popular.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-bold text-gray-900 mb-3">🔥 Popular Items</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {popular.map((item) => (
                <div key={item._id} className="flex-shrink-0 w-36 bg-white rounded-xl border border-gray-100 p-3 text-center">
                  <div className="w-16 h-16 bg-orange-50 rounded-xl flex items-center justify-center text-3xl mx-auto mb-2">🍛</div>
                  <p className="text-xs font-medium text-gray-900 line-clamp-1">{item.name}</p>
                  <p className="text-xs text-orange-500 font-semibold mt-1">₹{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search food..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
              vegOnly ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
            }`}
          >
            <Leaf className="w-4 h-4" /> Veg Only
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                category === cat
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
              }`}
            >
              {cat === 'all' ? 'All Items' : cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        {loading ? (
          <Loader text="Loading menu..." />
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="font-medium">No items found</p>
            <p className="text-sm mt-1">Try a different category or clear filters</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {items.map((item) => (
              <MenuItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
