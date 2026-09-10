import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, Star, Search, Flame, Cpu, Users, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Loader from '../../components/common/Loader';
import { fetchCanteens } from '../../api/canteenApi';

const Canteens = () => {
  const [canteens, setCanteens] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCanteens()
      .then(({ data }) => {
        setCanteens(data.data || []);
        setFiltered(data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      canteens.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q)
      )
    );
  }, [search, canteens]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Real-Time ML Wait Prediction Active</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight mb-2">
              KCT Campus Canteens
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Order ahead from your favorite campus canteens. Check live queue estimates powered by machine learning and skip the wait line.
            </p>
          </div>
        </motion.div>

        {/* Controls & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search canteens or locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
            />
          </div>

          <div className="text-xs text-slate-400 font-medium self-end sm:self-center">
            Showing <span className="font-bold text-amber-400">{filtered.length}</span> canteens
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((canteen, idx) => {
              const isOpen = canteen.isOpen !== false;
              const waitRange = canteen.waitRange || '8 - 12 mins';
              const activeCount = canteen.activeOrdersCount || 0;
              const queueStatus = canteen.queueStatus || 'Light';

              return (
                <motion.div
                  key={canteen._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="bg-slate-900/80 border border-slate-800/90 rounded-3xl overflow-hidden shadow-xl hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10 transition-all group flex flex-col justify-between"
                >
                  <div>
                    {/* Canteen Image Header */}
                    <div className="h-44 bg-gradient-to-br from-slate-800 via-slate-900 to-amber-950/30 relative overflow-hidden">
                      {canteen.image ? (
                        <img
                          src={canteen.image}
                          alt={canteen.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          🍽️
                        </div>
                      )}

                      {/* Status Badges Overlay */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-md border ${
                          isOpen 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                            : 'bg-slate-800/80 text-slate-400 border-slate-700'
                        }`}>
                          {isOpen ? '● Open Now' : '● Closed'}
                        </span>

                        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30 flex items-center gap-1 shadow-lg">
                          <Cpu className="w-3.5 h-3.5 animate-pulse" />
                          <span>~{canteen.estimatedWaitMinutes || 10} min wait</span>
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-xl font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                          {canteen.name}
                        </h3>
                        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg text-xs font-bold text-amber-400 shrink-0">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{canteen.rating?.toFixed(1) || '4.5'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-4">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>{canteen.location}</span>
                      </div>

                      {/* Live ML Prediction Pill */}
                      <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 mb-4 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-400" />
                          <div>
                            <span className="text-slate-400 text-[10px] block">Est. Wait Range</span>
                            <span className="font-bold text-slate-200">{waitRange}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-slate-400 text-[10px] block">Queue Status</span>
                          <span className="font-bold text-emerald-400 flex items-center gap-1 justify-end">
                            <Users className="w-3 h-3" />
                            {activeCount} orders ({queueStatus})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Button */}
                  <div className="p-5 pt-0">
                    <Link
                      to={`/canteens/${canteen._id}/menu`}
                      className={`w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                        isOpen
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed pointer-events-none'
                      }`}
                    >
                      <span>{isOpen ? 'Explore Menu' : 'Closed'}</span>
                      {isOpen && <ArrowRight className="w-4 h-4" />}
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Canteens;
