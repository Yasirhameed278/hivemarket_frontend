import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Package, ShoppingBag, DollarSign, Clock, Percent } from 'lucide-react';
import api from '../../api';
import { formatPKR } from '../../utils/currency';

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

export default function VendorDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/vendors/me/stats'),
      api.get('/vendors/me/orders'),
    ]).then(([{ data: s }, { data: o }]) => {
      setStats(s);
      setRecentOrders(o.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const cards = [
    { label: 'Total Earnings', value: formatPKR(stats?.totalEarnings || 0), Icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Items Sold', value: stats?.totalItemsSold || 0, Icon: TrendingUp, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Active Products', value: stats?.activeProducts || 0, Icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Orders', value: stats?.pendingOrders || 0, Icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-display font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1.5">
          <Percent className="w-3.5 h-3.5" />
          Platform commission: {stats?.commissionRate || 10}% — you keep {100 - (stats?.commissionRate || 10)}%
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Recent Orders</h3>
          <Link to="/vendor/orders" className="text-xs text-brand-500 hover:text-brand-600 font-medium">View all →</Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No orders yet</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div key={order._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-400">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatPKR(order.items.reduce((s, i) => s + i.price * i.quantity, 0))}
                  </p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/vendor/products" className="card p-5 hover:shadow-card-hover transition-all hover:-translate-y-0.5 flex items-center gap-3">
          <Package className="w-5 h-5 text-brand-500" />
          <div>
            <p className="font-semibold text-gray-900 text-sm">Manage Products</p>
            <p className="text-xs text-gray-400">{stats?.totalProducts || 0} products</p>
          </div>
        </Link>
        <Link to="/vendor/orders" className="card p-5 hover:shadow-card-hover transition-all hover:-translate-y-0.5 flex items-center gap-3">
          <ShoppingBag className="w-5 h-5 text-brand-500" />
          <div>
            <p className="font-semibold text-gray-900 text-sm">View Orders</p>
            <p className="text-xs text-gray-400">{stats?.pendingOrders || 0} pending</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
