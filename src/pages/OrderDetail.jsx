import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingBag, Settings, Truck, CheckCircle, XCircle,
  Clock, MapPin, ChevronLeft, RefreshCw, AlertCircle, Download,
} from 'lucide-react';
import api from '../api';
import { PageLoader } from '../components/ui/Loader';
import { formatPKR } from '../utils/currency';
import { generateInvoice } from '../utils/generateInvoice';

// ─── Config ──────────────────────────────────────────────────────────────────

const STEPS = [
  { key: 'confirmed',  label: 'Order Placed',  Icon: ShoppingBag },
  { key: 'processing', label: 'Processing',    Icon: Settings },
  { key: 'shipped',    label: 'Shipped',        Icon: Truck },
  { key: 'delivered',  label: 'Delivered',      Icon: CheckCircle },
];

const STATUS_CONFIG = {
  pending:    { color: 'text-yellow-700 bg-yellow-100',  label: 'Pending' },
  confirmed:  { color: 'text-blue-700 bg-blue-100',      label: 'Confirmed' },
  processing: { color: 'text-purple-700 bg-purple-100',  label: 'Processing' },
  shipped:    { color: 'text-indigo-700 bg-indigo-100',  label: 'Shipped' },
  delivered:  { color: 'text-green-700 bg-green-100',    label: 'Delivered' },
  cancelled:  { color: 'text-red-700 bg-red-100',        label: 'Cancelled' },
  refunded:   { color: 'text-gray-700 bg-gray-100',      label: 'Refunded' },
};

const EVENT_ICON = {
  confirmed:  { Icon: ShoppingBag, bg: 'bg-blue-100',   text: 'text-blue-600' },
  processing: { Icon: Settings,    bg: 'bg-purple-100',  text: 'text-purple-600' },
  shipped:    { Icon: Truck,       bg: 'bg-indigo-100',  text: 'text-indigo-600' },
  delivered:  { Icon: CheckCircle, bg: 'bg-green-100',   text: 'text-green-600' },
  cancelled:  { Icon: XCircle,     bg: 'bg-red-100',     text: 'text-red-500' },
  refunded:   { Icon: RefreshCw,   bg: 'bg-gray-100',    text: 'text-gray-500' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressStepper({ order }) {
  const currentStep = STEPS.findIndex(s => s.key === order.status);
  const isCancelled = ['cancelled', 'refunded'].includes(order.status);

  // Find the timestamp from trackingHistory for a given step key
  const stepTimestamp = (key) => {
    const event = order.trackingHistory?.find(e => e.status === key);
    return event ? new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;
  };

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <XCircle className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <p className="font-semibold text-red-700 text-sm">
            Order {order.status === 'refunded' ? 'Refunded' : 'Cancelled'}
          </p>
          <p className="text-xs text-red-400 mt-0.5">
            {stepTimestamp(order.status) || new Date(order.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-start justify-between">
      {/* Connecting track behind the steps */}
      <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 z-0">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-orange-400 transition-all duration-700"
          style={{ width: currentStep < 0 ? '0%' : `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        />
      </div>

      {STEPS.map((step, i) => {
        const done   = currentStep >= i;
        const active = currentStep === i;
        const ts     = stepTimestamp(step.key);
        const { Icon } = step;

        return (
          <div key={step.key} className="relative z-10 flex flex-col items-center gap-2 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
              done
                ? 'bg-gradient-to-br from-brand-500 to-orange-400 border-brand-500 text-white shadow-md shadow-brand-500/30'
                : 'bg-white border-gray-200 text-gray-300'
            } ${active ? 'ring-4 ring-brand-100 scale-110' : ''}`}>
              <Icon className="w-4 h-4" strokeWidth={active ? 2.5 : 2} />
            </div>
            <div className="text-center">
              <p className={`text-xs font-semibold ${done ? 'text-gray-800' : 'text-gray-400'}`}>
                {step.label}
              </p>
              {ts && (
                <p className="text-[10px] text-gray-400 mt-0.5">{ts}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TrackingTimeline({ events }) {
  if (!events?.length) return null;

  const sorted = [...events].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100" />

      <div className="space-y-0">
        {sorted.map((event, i) => {
          const cfg = EVENT_ICON[event.status] || EVENT_ICON.confirmed;
          const { Icon } = cfg;
          const isLatest = i === 0;

          return (
            <div key={event._id || i} className={`relative flex gap-4 pb-6 last:pb-0 ${isLatest ? 'animate-fade-in' : ''}`}>
              {/* Icon circle */}
              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                isLatest
                  ? 'bg-gradient-to-br from-brand-500 to-orange-400 shadow-md shadow-brand-500/25'
                  : `${cfg.bg}`
              }`}>
                <Icon className={`w-4 h-4 ${isLatest ? 'text-white' : cfg.text}`} strokeWidth={2} />
              </div>

              {/* Content */}
              <div className={`flex-1 pt-1.5 pb-4 ${!isLatest ? 'border-b border-gray-50' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold ${isLatest ? 'text-gray-900' : 'text-gray-700'}`}>
                        {event.description}
                      </p>
                      {isLatest && (
                        <span className="text-[10px] font-bold uppercase tracking-wide bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                          Latest
                        </span>
                      )}
                    </div>
                    {event.location && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />{event.location}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                    {new Date(event.timestamp).toLocaleString('en-US', {
                      month: 'short', day: 'numeric',
                      hour: 'numeric', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data)).finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await api.put(`/orders/${id}/cancel`);
      setOrder(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot cancel');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!order) return <div className="pt-20 text-center py-20 text-gray-400">Order not found</div>;

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/orders" className="btn-ghost p-2 rounded-xl">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-xl font-bold text-gray-900">{order.orderNumber}</h1>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
            </div>
            <p className="text-sm text-gray-400 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => generateInvoice(order)}
              className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
              <Download className="w-4 h-4" /> Invoice
            </button>
            {['pending', 'confirmed', 'processing'].includes(order.status) && (
              <button onClick={handleCancel} disabled={cancelling} className="btn-danger text-sm py-2 px-4">
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>

        {/* ── Tracking card ── */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900">Order Tracking</h2>
            {order.trackingNumber && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                <Truck className="w-3.5 h-3.5" />
                <span className="font-mono font-bold text-gray-700">{order.trackingNumber}</span>
              </div>
            )}
          </div>

          {/* Progress stepper */}
          <ProgressStepper order={order} />

          {/* Estimated delivery */}
          {order.estimatedDelivery && !['delivered', 'cancelled', 'refunded'].includes(order.status) && (
            <div className="mt-5 flex items-center gap-2 text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Estimated delivery:{' '}
                <span className="font-semibold text-amber-700">
                  {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { dateStyle: 'full' })}
                </span>
              </span>
            </div>
          )}

          {/* Divider + timeline */}
          {order.trackingHistory?.length > 0 && (
            <>
              <div className="border-t border-gray-100 my-6" />
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Activity</h3>
              <TrackingTimeline events={order.trackingHistory} />
            </>
          )}
        </div>

        {/* ── Items + details ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Items */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Items ({order.items.length})</h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-gray-50" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                    {item.variant && <p className="text-xs text-gray-400">{item.variant}</p>}
                    <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatPKR(item.price)}</p>
                  </div>
                  <p className="font-semibold text-sm text-gray-900">{formatPKR(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {/* Shipping address */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Shipping Address</h2>
              <div className="text-sm text-gray-600 space-y-0.5">
                <p className="font-medium text-gray-900">{order.shippingAddress?.name}</p>
                <p>{order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
                <p>{order.shippingAddress?.country}</p>
                {order.shippingAddress?.phone && <p className="text-gray-400">{order.shippingAddress.phone}</p>}
              </div>
            </div>

            {/* Price summary */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>{formatPKR(order.itemsPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={order.shippingPrice === 0 ? 'text-green-600' : ''}>
                    {order.shippingPrice === 0 ? 'Free' : formatPKR(order.shippingPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span><span>{formatPKR(order.taxPrice)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                    <span>-{formatPKR(order.discount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
                  <span>Total</span><span>{formatPKR(order.totalPrice)}</span>
                </div>
                <div className={`mt-1 text-xs flex items-center gap-1.5 ${order.isPaid ? 'text-green-600' : 'text-amber-600'}`}>
                  {order.isPaid
                    ? <><CheckCircle className="w-3.5 h-3.5" /> Paid {order.paidAt && `· ${new Date(order.paidAt).toLocaleDateString()}`}</>
                    : <><AlertCircle className="w-3.5 h-3.5" /> Payment on delivery</>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
