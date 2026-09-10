import { useEffect, useState, useContext } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';
import { CartContext } from '../../context/CartContext';
import { Sparkles, Clock, ShoppingBag, Cpu } from 'lucide-react';

export default function RecommendationCarousel({ canteenId }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await axiosInstance.get('/ml/recommendations', {
          params: { canteenId },
        });
        if (res.data.success) {
          setRecommendations(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load recommendations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [canteenId]);

  if (loading || recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl mb-8 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-xl text-slate-950 shadow-md shadow-amber-500/20">
            <Sparkles className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
              Recommended For You
            </h2>
            <p className="text-xs text-slate-400">ML Personalization Engine</p>
          </div>
        </div>

        <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
          <Cpu className="w-3.5 h-3.5" />
          <span>AI Match</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
        {recommendations.slice(0, 3).map((item) => (
          <motion.div
            key={item._id}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-xl"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-md border border-amber-500/20">
                  {item.recommendationReason || 'Popular Choice'}
                </span>
                <span className="text-sm font-black text-amber-400">₹{item.price}</span>
              </div>
              <h3 className="font-extrabold text-slate-100 text-sm mt-1">{item.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">{item.description}</p>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{item.preparationTime || 10}m prep</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => addToCart(item, item.canteen?._id || item.canteen, item.canteen?.name)}
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-extrabold transition-all shadow-md shadow-amber-500/20"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Add
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
