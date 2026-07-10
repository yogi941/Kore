import { useState, useEffect } from 'react';
import { ShoppingBag, Users, TrendingUp, IndianRupee } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Loader from '../../components/common/Loader';
import { getPlatformAnalytics } from '../../api/adminApi';
import useAuth from '../../hooks/useAuth';
import { getCanteenOrders } from '../../api/orderApi';

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (isSuperAdmin) {
          const { data } = await getPlatformAnalytics();
          setAnalytics(data.data);
        }
        const ordersRes = await getCanteenOrders({ limit: 5 });
        setRecentOrders(ordersRes.data.data.orders || []);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [isSuperAdmin]);

  const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-blue-100 text-blue-700',
    preparing: 'bg-purple-100 text-purple-700',
    ready: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-600',
  };

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar /><Loader /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.name}</p>
        </div>

        {isSuperAdmin && analytics && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Students" value={analytics.overview.totalStudents.toLocaleString()}
                icon={Users} color="bg-blue-500" />
              <StatCard label="Total Orders" value={analytics.overview.totalOrders.toLocaleString()}
                icon={ShoppingBag} color="bg-orange-500" sub={`${analytics.overview.todayOrders} today`} />
              <StatCard label="Revenue" value={`₹${(analytics.overview.totalRevenue || 0).toLocaleString()}`}
                icon={IndianRupee} color="bg-green-500" />
              <StatCard label="Completion Rate" value={`${analytics.overview.completionRate}%`}
                icon={TrendingUp} color="bg-purple-500" />
            </div>

            {/* Canteen Stats Table */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-4">Canteen Performance</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 text-xs border-b border-gray-100">
                      <th className="pb-3 font-medium">Canteen</th>
                      <th className="pb-3 font-medium">Total Orders</th>
                      <th className="pb-3 font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {analytics.canteenStats?.map((stat) => (
                      <tr key={stat._id}>
                        <td className="py-3 font-medium text-gray-900">{stat.canteenName}</td>
                        <td className="py-3 text-gray-600">{stat.totalOrders}</td>
                        <td className="py-3 text-gray-600">₹{stat.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <a href="/admin/orders" className="text-sm text-orange-500 hover:underline">View all</a>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-center py-10 text-gray-400 text-sm">No orders yet today</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 text-xs border-b border-gray-100">
                    <th className="pb-3 font-medium">Order #</th>
                    <th className="pb-3 font-medium">Student</th>
                    <th className="pb-3 font-medium">Items</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 font-medium text-gray-900">{order.orderNumber}</td>
                      <td className="py-3 text-gray-600">{order.student?.name}</td>
                      <td className="py-3 text-gray-500">{order.items.length} item(s)</td>
                      <td className="py-3 font-medium">₹{order.totalAmount}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
