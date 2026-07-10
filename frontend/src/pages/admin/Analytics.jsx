import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, IndianRupee, Users, BarChart2 } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Loader from '../../components/common/Loader';
import useAuth from '../../hooks/useAuth';
import { getPlatformAnalytics, getDailyRevenue, getDemandForecast } from '../../api/adminApi';

const Analytics = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const canteenId = user?.canteen?._id || user?.canteen;

  const [analytics, setAnalytics] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const promises = [getDailyRevenue({ days })];
        if (isSuperAdmin) promises.push(getPlatformAnalytics());
        if (canteenId) promises.push(getDemandForecast(canteenId));

        const results = await Promise.allSettled(promises);
        const [revRes, analyticsRes, forecastRes] = results;

        if (revRes.status === 'fulfilled') setRevenue(revRes.value.data.data || []);
        if (analyticsRes?.status === 'fulfilled') setAnalytics(analyticsRes.value.data.data);
        if (forecastRes?.status === 'fulfilled') setForecast(forecastRes.value.data.data || []);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [days, isSuperAdmin, canteenId]);

  const maxRevenue = Math.max(...revenue.map((r) => r.revenue || 0), 1);

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar /><Loader /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>

        {/* Overview Cards */}
        {isSuperAdmin && analytics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Students', value: analytics.overview.totalStudents.toLocaleString(), icon: Users, bg: 'bg-blue-500' },
              { label: 'Total Orders', value: analytics.overview.totalOrders.toLocaleString(), icon: ShoppingBag, bg: 'bg-orange-500' },
              { label: 'Total Revenue', value: `₹${(analytics.overview.totalRevenue || 0).toLocaleString()}`, icon: IndianRupee, bg: 'bg-green-500' },
              { label: 'Completion Rate', value: `${analytics.overview.completionRate}%`, icon: TrendingUp, bg: 'bg-purple-500' },
            ].map(({ label, value, icon: Icon, bg }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm text-gray-500">{label}</p>
                  <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-orange-500" /> Daily Revenue (₹)
            </h2>
            {revenue.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No revenue data</div>
            ) : (
              <div className="flex items-end gap-2 h-48">
                {revenue.map((r) => {
                  const height = ((r.revenue || 0) / maxRevenue) * 100;
                  return (
                    <div key={r._id} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="relative w-full flex flex-col items-center">
                        <span className="hidden group-hover:block absolute -top-7 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                          ₹{r.revenue} · {r.orders} orders
                        </span>
                        <div
                          className="w-full bg-orange-400 hover:bg-orange-500 rounded-t-lg transition-colors cursor-pointer"
                          style={{ height: `${Math.max(height, 4)}%`, minHeight: '4px' }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 text-center truncate w-full">
                        {new Date(r._id).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Demand Forecast */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" /> Top Items (Last {days} days)
            </h2>
            {forecast.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No forecast data</div>
            ) : (
              <div className="space-y-3">
                {forecast.map((item, i) => {
                  const maxQty = forecast[0]?.totalQuantity || 1;
                  const pct = (item.totalQuantity / maxQty) * 100;
                  return (
                    <div key={item._id}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs w-5">#{i + 1}</span>
                          <span className="font-medium text-gray-800">{item.itemName}</span>
                        </div>
                        <span className="text-gray-500 text-xs">{item.totalQuantity} sold</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-orange-400 h-2 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Canteen Breakdown */}
        {isSuperAdmin && analytics?.canteenStats?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-6">
            <h2 className="font-semibold text-gray-900 mb-4">Canteen Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 text-xs border-b border-gray-100">
                    <th className="pb-3 font-medium">Canteen</th>
                    <th className="pb-3 font-medium">Total Orders</th>
                    <th className="pb-3 font-medium">Revenue</th>
                    <th className="pb-3 font-medium">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {analytics.canteenStats.map((stat) => {
                    const totalRev = analytics.overview.totalRevenue || 1;
                    const share = ((stat.revenue / totalRev) * 100).toFixed(1);
                    return (
                      <tr key={stat._id}>
                        <td className="py-3 font-medium text-gray-900">{stat.canteenName}</td>
                        <td className="py-3 text-gray-600">{stat.totalOrders}</td>
                        <td className="py-3 text-gray-600">₹{stat.revenue.toLocaleString()}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-100 rounded-full h-1.5">
                              <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${share}%` }} />
                            </div>
                            <span className="text-xs text-gray-500">{share}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
