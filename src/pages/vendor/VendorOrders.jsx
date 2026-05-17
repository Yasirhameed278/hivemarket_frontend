import React, { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
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

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/vendors/me/orders')
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-display font-bold text-gray-900">My Orders</h2>
        <p className="text-sm text-gray-400 mt-0.5">Orders containing your products</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <ShoppingBag className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No orders yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map(order => {
              const orderRevenue = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
              return (
                <div key={order._id} className="p-5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">#{order.orderNumber}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                      <span className="text-sm font-bold text-gray-900">{formatPKR(orderRevenue)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover bg-gray-100 shrink-0" />
                        <span className="flex-1 text-gray-700 line-clamp-1">{item.name}</span>
                        <span className="text-gray-400 shrink-0">×{item.quantity}</span>
                        <span className="font-medium text-gray-900 shrink-0">{formatPKR(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
