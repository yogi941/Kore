import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Star, ChevronRight, Zap, Users, Cpu, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Loader from '../../components/common/Loader';
import RecommendationCarousel from '../../components/student/RecommendationCarousel';
import useAuth from '../../hooks/useAuth';
import { fetchCanteens } from '../../api/canteenApi';

const BREAK_SLOTS = [
  { label: 'Breakfast', time: '8:30 AM – 9:00 AM', icon: '🌅' },
  { label: 'Lunch Break', time: '12:30 PM – 1:30 PM', icon: '🍱' },
  { label: 'Evening Snacks', time: '4:00 PM – 4:30 PM', icon: '☕' },
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
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      {/* Hero Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 border-b border-slate-800">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI-Driven Campus Dining System</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black tracking-tight text-slate-100 mb-3"
          >
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300">{user?.name?.split(' ')[0]} 👋</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed mb-6"
          >
            Skip long canteen queues. Pre-order your meals, track ML wait predictions in real time, and split group orders with friends!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            {BREAK_SLOTS.map((slot) => (
              <div
                key={slot.label}
                className="flex items-center gap-3 bg-slate-900/80 border border-slate-800/90 rounded-2xl px-4 py-2.5 backdrop-blur-md shadow-lg"
              >
                <span className="text-xl">{slot.icon}</span>
                <div>
                  <p className="text-xs font-bold text-slate-200">{slot.label}</p>
                  <p className="text-[10px] text-amber-400 font-mono font-medium">{slot.time}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Recommendation Carousel */}
        <RecommendationCarousel />

        {/* Quick Action Interactive Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-100 text-base group-hover:text-amber-400 transition-colors">Multi-Shop Cart</h3>
                <p className="text-xs text-slate-400 mt-0.5">Combine items from Main Core + Munch Box into 1 order</p>
              </div>
            </div>
            <Link
              to="/canteens"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl transition-all flex items-center gap-1 shadow-lg shadow-amber-500/20"
            >
              Order Now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            className="bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/30 border border-slate-800 hover:border-purple-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-100 text-base group-hover:text-purple-400 transition-colors">Group Order Room</h3>
                <p className="text-xs text-slate-400 mt-0.5">Host live order rooms with friends & split the bill</p>
              </div>
            </div>
            <Link
              to="/group"
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all flex items-center gap-1 shadow-lg shadow-purple-500/20"
            >
              Start Room <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>

        {/* Canteens Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-100 tracking-tight">Featured Campus Canteens</h2>
              <p className="text-xs text-slate-400 mt-0.5">Explore real-time ML wait times and menu options</p>
            </div>
            <Link to="/canteens" className="text-xs font-extrabold text-amber-400 flex items-center gap-1 hover:text-amber-300 transition-colors">
              View All Canteens <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {canteens.slice(0, 6).map((canteen, idx) => (
                <motion.div
                  key={canteen._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="bg-slate-900/80 border border-slate-800/90 rounded-3xl overflow-hidden shadow-xl hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10 transition-all group flex flex-col justify-between"
                >
                  <Link to={`/canteens/${canteen._id}/menu`}>
                    <div className="h-44 bg-slate-800 relative overflow-hidden">
                      {canteen.image ? (
                        <img
                          src={canteen.image}
                          alt={canteen.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">
                          🍽️
                        </div>
                      )}

                      <div className="absolute top-3 right-3 text-[11px] font-bold px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5 animate-pulse" />
                        <span>~{canteen.estimatedWaitMinutes || 10} min wait</span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-slate-100 text-lg group-hover:text-amber-400 transition-colors">
                          {canteen.name}
                        </h3>
                        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg text-xs font-bold text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{canteen.rating?.toFixed(1) || '4.5'}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{canteen.location}</p>

                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
                        <span className="font-bold text-slate-300">Wait Range: </span>
                        <span className="text-amber-400 font-bold">{canteen.waitRange || '8 - 12 mins'}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* How It Works Steps */}
        <section>
          <h2 className="text-xl font-black text-slate-100 mb-6">How Kore Canteen Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { step: '01', icon: '📱', title: 'Browse & Select', desc: 'Choose menu items from your favorite campus canteen.' },
              { step: '02', icon: '⚡', title: 'AI Wait Prediction', desc: 'See real-time ML wait times and queue congestion metrics.' },
              { step: '03', icon: '🎟️', title: 'Express QR Pickup', desc: 'Scan your pickup QR token at the counter and skip the queue.' },
            ].map((item) => (
              <motion.div
                key={item.step}
                whileHover={{ y: -4 }}
                className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-lg relative overflow-hidden"
              >
                <div className="text-4xl font-black text-slate-800 absolute right-4 bottom-2 select-none pointer-events-none">
                  {item.step}
                </div>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-extrabold text-slate-100 text-base mb-1">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
