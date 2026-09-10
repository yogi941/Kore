import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, ChevronRight, Zap, Users } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Loader from '../../components/common/Loader';
import RecommendationCarousel from '../../components/student/RecommendationCarousel';
import useAuth from '../../hooks/useAuth';
import { fetchCanteens } from '../../api/canteenApi';

const BREAK_SLOTS = [
  { label: 'Breakfast', time: '8:30 AM – 9:00 AM', icon: '🌅' },
  { label: 'Lunch', time: '12:30 PM – 1:30 PM', icon: '🍱' },
  { label: 'Evening', time: '4:00 PM – 4:30 PM', icon: '☕' },
];

const Home = () => {
  const { user } = useAuth();
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCanteens()
      .then(({ data }) => setCanteens(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-orange-100 text-sm font-medium mb-1">Good day,</p>
          <h1 className="text-3xl font-bold mb-2">{user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-orange-100 text-sm">Pre-order your meal and skip the queue</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {BREAK_SLOTS.map((slot) => (
              <div key={slot.label} className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <span className="text-lg">{slot.icon}</span>
                <div>
                  <p className="text-xs font-semibold">{slot.label}</p>
                  <p className="text-xs text-orange-100">{slot.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Recommendation Carousel */}
        <RecommendationCarousel />

        {/* Quick Action Banners */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Multi-Shop Ordering</p>
                <p className="text-xs text-gray-500">Order from Main Core + Munch Box together</p>
              </div>
            </div>
            <Link to="/canteens"
              className="bg-orange-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors">
              Order Now
            </Link>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Group Ordering Room</p>
                <p className="text-xs text-gray-500">Order with friends & split the bill live</p>
              </div>
            </div>
            <Link to="/group"
              className="bg-purple-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors">
              Start Group
            </Link>
          </div>
        </div>

        {/* Canteens Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Our Canteens</h2>
            <Link to="/canteens" className="text-sm text-orange-500 flex items-center gap-1 hover:underline">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {canteens.map((canteen) => (
                <Link
                  key={canteen._id}
                  to={`/canteens/${canteen._id}/menu`}
                  className="bg-white rounded-2xl overflow-hidden swiggy-card-shadow swiggy-card-hover group flex flex-col"
                >
                  <div className="h-40 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                    {canteen.image ? (
                      <img src={canteen.image} alt={canteen.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <span className="text-5xl">🍽️</span>
                    )}
                    <div className={`absolute top-3 right-3 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md shadow ${
                      canteen.isOpen
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}>
                      {canteen.isOpen ? 'Open' : 'Closed'}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-[#282c3f] text-base group-hover:text-orange-500 transition-colors line-clamp-1">
                        {canteen.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{canteen.location}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-0.5 bg-green-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{canteen.rating?.toFixed(1) || '4.0'}</span>
                      </div>
                      <span className="text-gray-300 text-xs">•</span>
                      <div className="flex items-center gap-1 text-gray-600 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <span>10–15 MINS</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: '1', icon: '📱', title: 'Browse & Order', desc: 'Choose your canteen and pre-order your meal in advance' },
              { step: '2', icon: '⏰', title: 'Select Pickup Slot', desc: 'Pick a convenient time slot for your break period' },
              { step: '3', icon: '🎟️', title: 'Collect with QR', desc: 'Show your QR token at the counter and collect your food' },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs text-orange-500 font-semibold mb-0.5">Step {item.step}</p>
                  <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
