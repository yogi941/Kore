import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Star, Search } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">KCT Canteens</h1>
          <p className="text-gray-500 text-sm mt-1">Choose a canteen to browse their menu</p>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search canteens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((canteen) => (
              <div key={canteen._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center relative">
                  {canteen.image ? (
                    <img src={canteen.image} alt={canteen.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-6xl">🍽️</span>
                  )}
                  <div className={`absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full ${
                    canteen.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {canteen.isOpen ? '● Open' : '● Closed'}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{canteen.name}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{canteen.location}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-gray-600">{canteen.rating?.toFixed(1) || '4.0'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>10–15 min</span>
                    </div>
                  </div>
                  <Link
                    to={`/canteens/${canteen._id}/menu`}
                    className={`block w-full mt-4 py-2 rounded-xl text-sm font-medium text-center transition-colors ${
                      canteen.isOpen
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                    }`}
                  >
                    {canteen.isOpen ? 'View Menu' : 'Currently Closed'}
                  </Link>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-400">
                No canteens found matching "{search}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Canteens;
