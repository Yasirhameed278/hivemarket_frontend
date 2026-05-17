import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle, ShoppingBag } from 'lucide-react';
import api from '../api';
import { PageLoader } from '../components/ui/Loader';
import { formatPKR } from '../utils/currency';

const STATUS_CONFIG = {
  pending:    { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending' },
  confirmed:  { color: 'bg-blue-100 text-blue-700', icon: CheckCircle, label: 'Confirmed' },
  processing: { color: 'bg-purple-100 text-purple-700', icon: Package, label: 'Processing' },
  shipped:    { color: 'bg-indigo-100 text-indigo-700', icon: Truck, label: 'Shipped' },
  delivered:  { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Delivered' },
  cancelled:  { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Cancelled' },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my').then(({ data }) => setOrders(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-brand-50 to-orange-50 rounded-3xl flex items-center justify-center shadow-inner border border-brand-100/50">
                <ShoppingBag className="w-11 h-11 text-brand-300" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-brand-500 to-orange-400 rounded-full flex items-center justify-center shadow-glow">
                <span className="text-white text-[10px] font-bold">0</span>
              </div>
            </div>
            <h3 className="font-display text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-400 text-sm mb-8 max-w-xs">You haven't placed any orders. Explore our products and find something you love!</p>
            <Link to="/products" className="btn-primary px-8 py-3 rounded-2xl shadow-glow">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const StatusIcon = cfg.icon;
              return (
                <Link key={order._id} to={`/orders/${order._id}`}
                  className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-card-hover transition-all group">
                  {/* Order thumbnail grid */}
                  <div className="flex -space-x-3">
                    {order.items.slice(0, 3).map((item, i) => (
                      <img key={i} src={item.image} alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover border-2 border-white ring-1 ring-gray-100" />
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-14 h-14 rounded-xl bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-500">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-mono text-sm font-bold text-gray-700">{order.orderNumber}</span>
                      <span className={`badge text-xs ${cfg.color} flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />{cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      &nbsp;·&nbsp;{order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                    <span className="font-bold text-gray-900">{formatPKR(order.totalPrice)}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
