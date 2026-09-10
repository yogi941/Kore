import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Minus, Leaf, Flame, Clock, MapPin, Sparkles, Cpu } from 'lucide-react';
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
    const catPrepTime = item.category === 'beverages' ? '3-5' : item.category === 'lunch' ? '10-12' : '6-8';

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-md flex justify-between gap-5 items-center hover:border-amber-500/30 transition-all ${
          !isAvailable ? 'opacity-50 grayscale' : ''
        }`}
      >
        {/* Left Details */}
        <div className="flex-1 flex flex-col items-start text-left min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className={item.isVeg ? "swiggy-veg-icon" : "swiggy-nonveg-icon"} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
              {item.category || 'General'}
            </span>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              {catPrepTime} mins prep
            </span>
            {!isAvailable && (
              <span className="text-[10px] bg-rose-500/20 text-rose-400 font-extrabold px-2 py-0.5 rounded-md border border-rose-500/30 uppercase">
                Out of Stock
              </span>
            )}
          </div>

          <h4 className="font-extrabold text-slate-100 text-base sm:text-lg group-hover:text-amber-400 transition-colors">
            {item.name}
          </h4>
          <span className="font-black text-amber-400 text-base mt-1">₹{item.price}</span>
          
          {item.description && (
            <p className="text-xs text-slate-400 mt-2 max-w-[420px] leading-relaxed line-clamp-2">
              {item.description}
            </p>
          )}
        </div>

        {/* Right Image & Add Button */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0">
          <div className="w-full h-full rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 shadow-md flex items-center justify-center">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">🍛</span>
            )}
          </div>

          {/* Floating ADD Pill */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 shadow-xl rounded-2xl px-3 py-1.5 text-xs font-black uppercase flex items-center gap-3 select-none min-w-[95px] justify-center text-amber-400">
            {!isAvailable ? (
              <span className="text-slate-500 text-[10px] normal-case">Sold Out</span>
            ) : cartItem ? (
              <>
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => handleDecrease(item)}
                  className="hover:scale-125 text-slate-400 font-bold px-1"
                >
                  -
                </motion.button>
                <span className="text-amber-400 font-black w-4 text-center">{cartItem.quantity}</span>
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => handleAdd(item)}
                  className="hover:scale-125 text-amber-400 font-bold px-1"
                >
                  +
                </motion.button>
              </>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAdd(item)}
                className="w-full h-full text-center tracking-widest text-amber-400 font-black"
              >
                ADD
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Canteen Header */}
        {canteen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/40 border border-slate-800 rounded-3xl p-6 mb-8 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-3xl text-slate-950 font-bold shadow-lg shadow-amber-500/20 shrink-0">
                🍽️
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-100">{canteen.name}</h1>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {canteen.location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-extrabold px-3.5 py-1.5 rounded-full bg-slate-950/80 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                ~10-12 min wait
              </span>
            </div>
          </motion.div>
        )}

        {/* Popular Items Strip */}
        {popular.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-black text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400" /> Popular Picks
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
              {popular.map((item) => (
                <motion.div
                  key={item._id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleAdd(item)}
                  className="shrink-0 w-36 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 text-center cursor-pointer hover:border-amber-500/40 transition-all shadow-lg backdrop-blur-md"
                >
                  <div className="w-16 h-16 bg-slate-950 rounded-xl flex items-center justify-center text-3xl mx-auto mb-2 border border-slate-800">
                    🍛
                  </div>
                  <p className="text-xs font-bold text-slate-200 truncate">{item.name}</p>
                  <p className="text-xs text-amber-400 font-black mt-1">₹{item.price}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Veg Filter */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search dishes or beverages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold border transition-all ${
              vegOnly
                ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-emerald-500/40'
            }`}
          >
            <Leaf className="w-4 h-4 text-emerald-400" /> Pure Veg Only
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-8">
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-extrabold capitalize transition-all ${
                category === cat
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat === 'all' ? 'All Menu Items' : cat}
            </motion.button>
          ))}
        </div>

        {/* Menu Grid */}
        {loading ? (
          <Loader text="Loading canteen menu..." />
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-slate-500 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <p className="text-5xl mb-3">🍽️</p>
            <p className="font-bold text-slate-300">No items found</p>
            <p className="text-xs text-slate-500 mt-1">Try selecting a different category or clearing filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <MenuItemCard key={item._id} item={item} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
