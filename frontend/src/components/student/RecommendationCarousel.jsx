import { useEffect, useState, useContext } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { CartContext } from '../../context/CartContext';
import { Sparkles, Clock, ShoppingBag } from 'lucide-react';

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
    <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-red-500/10 p-5 rounded-2xl border border-orange-200/50 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500 animate-pulse" />
          <h2 className="text-lg font-bold text-gray-900">Recommended for You</h2>
          <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            AI Personalized
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {recommendations.slice(0, 3).map((item) => (
          <div
            key={item._id}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md">
                  {item.recommendationReason}
                </span>
                <span className="text-sm font-bold text-gray-900">₹{item.price}</span>
              </div>
              <h3 className="font-semibold text-gray-800 text-base">{item.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-2 mt-1">{item.description}</p>
            </div>

            <div className="mt-4 flex items-center justify-between pt-2 border-t border-gray-50">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>{item.preparationTime || 10}m prep</span>
              </div>
              <button
                onClick={() => addToCart(item, item.canteen?._id || item.canteen, item.canteen?.name)}
                className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
