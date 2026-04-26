import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Package, Users, ShoppingBag, DollarSign, TrendingUp, ArrowUpRight,
  AlertTriangle, Eye, ChevronRight, Layers
} from 'lucide-react';
import api from '../../api';
import { PageLoader } from '../../components/ui/Loader';
import { formatPKR } from '../../utils/currency';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

const STATUS_COLOR = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/orders/stats'),
    ]).then(([adminRes, orderRes]) => {
      setStats({ ...adminRes.data, ...orderRes.data });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  // Build a fixed 6-month window so the chart always shows a proper trend line,
  // even when there's only one or two months of real data.
  const buildMonthlyChart = () => {
    const buckets = new Map();
    (stats?.monthlyData || []).forEach((d) => {
      const key = `${d._id.year}-${d._id.month}`;
      buckets.set(key, { revenue: Math.round(d.revenue || 0), orders: d.orders || 0 });
    });
    const now = new Date();
    const out = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const data = buckets.get(key) || { revenue: 0, orders: 0 };
      out.push({
        month: MONTH_NAMES[date.getMonth()],
        revenue: data.revenue,
        orders: data.orders,
      });
    }
    return out;
  };
  const monthlyChart = buildMonthlyChart();

  const categoryChart = stats?.categoryStats?.map(c => ({
    name: c._id || 'Other',
    value: c.count,
  })) || [];

  const statCards = [
    { label: 'Total Revenue', value: formatPKR(stats?.totalRevenue || 0), icon: DollarSign, color: 'from-brand-500 to-orange-400', change: '+12.5%' },
    { label: 'Total Orders', value: (stats?.totalOrders || 0).toLocaleString(), icon: ShoppingBag, color: 'from-blue-500 to-indigo-500', change: '+8.2%' },
    { label: 'Active Products', value: (stats?.totalProducts || 0).toLocaleString(), icon: Package, color: 'from-emerald-500 to-teal-500', change: '+3.1%' },
    { label: 'Total Users', value: (stats?.totalUsers || 0).toLocaleString(), icon: Users, color: 'from-purple-500 to-violet-500', change: '+15.3%' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-500 text-sm">Welcome back! Here's what's happening.</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary gap-2 text-sm">
          <Package className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, change }) => (
          <div key={label} className="card p-5 overflow-hidden relative group hover:shadow-card-hover transition-all">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-5 rounded-full -translate-y-6 translate-x-6`} />
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" /> {change}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-900">Revenue & Orders</h3>
              <p className="text-xs text-gray-400">Last 6 months</p>
            </div>
            <Link to="/admin/orders" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyChart} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={5} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', fontSize: '12px', padding: '10px 14px' }}
                cursor={{ stroke: '#e5e7eb', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} fill="url(#revGradient)" name="Revenue (PKR)" activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} />
              <Area type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={2.5} fill="url(#orderGradient)" name="Orders" activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-900">By Category</h3>
              <p className="text-xs text-gray-400">Product distribution</p>
            </div>
          </div>
          {categoryChart.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categoryChart} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                    {categoryChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {categoryChart.slice(0, 5).map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600 truncate max-w-[100px]">{c.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{c.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-gray-400 text-sm">No products yet</div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {(stats?.recentOrders || []).length === 0 && (
              <p className="text-sm text-gray-400 py-4 text-center">No orders yet</p>
            )}
            {(stats?.recentOrders || []).map((order) => (
              <Link key={order._id} to={`/admin/orders`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{order.user?.name || 'Customer'}</p>
                  <p className="text-xs text-gray-400 font-mono">{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{formatPKR(order.totalPrice)}</p>
                  <span className={`badge text-[10px] ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Low stock alert */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-gray-900">Low Stock Alert</h3>
            </div>
            <Link to="/admin/products" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
              Manage <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {(stats?.lowStockProducts || []).length === 0 && (
              <p className="text-sm text-gray-400 py-4 text-center">All products well stocked ✓</p>
            )}
            {(stats?.lowStockProducts || []).map((product) => (
              <Link key={product._id} to={`/admin/products/${product._id}/edit`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <img src={product.thumbnail} alt={product.name}
                  className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                  onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80'} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-400">{formatPKR(product.price)}</p>
                </div>
                <span className={`badge text-xs font-bold ${product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Top products bar chart */}
      {(stats?.topProducts || []).length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-900">Top Selling Products</h3>
              <p className="text-xs text-gray-400">By units sold</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.topProducts.map(p => ({ name: p.name.slice(0, 20), sold: p.soldCount }))}
              margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} angle={-20} textAnchor="end" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px' }} />
              <Bar dataKey="sold" fill="#f97316" radius={[6, 6, 0, 0]} name="Units Sold" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
