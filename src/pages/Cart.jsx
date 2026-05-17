import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Copy, Check, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import useCartStore from '../store/cartStore';
import { formatPKR, USD_TO_PKR } from '../utils/currency';

function CopyCode({ code }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`Copied "${code}"!`, { icon: '📋' });
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy}
      className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-all">
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateItem, removeItem, clearCart, getTotal } = useCartStore();

  const subtotal = getTotal();
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;

  const handleUpdate = async (itemId, newQty) => {
    if (newQty < 1) {
      await removeItem(itemId);
      toast.success('Item removed');
    } else {
      await updateItem(itemId, newQty);
    }
  };

  if (items.length === 0) return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center animate-fade-in px-4">
        <div className="relative inline-block mb-6">
          <div className="w-28 h-28 bg-gradient-to-br from-brand-50 to-orange-50 rounded-3xl flex items-center justify-center shadow-inner border border-brand-100/60 mx-auto">
            <ShoppingBag className="w-14 h-14 text-brand-200" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl shadow-card flex items-center justify-center border border-gray-100">
            <span className="text-lg">🛒</span>
          </div>
        </div>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">You haven't added anything yet. Find something you love and it'll show up here.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/products" className="btn-primary px-8 py-3 rounded-2xl shadow-glow">Browse Products</Link>
          <Link to="/stores" className="btn-secondary px-8 py-3 rounded-2xl">Visit Stores</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-sm text-gray-400 mt-0.5">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
          </div>
          <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600 transition-colors flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" /> Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item._id} className="card p-4 group hover:shadow-card-hover transition-all duration-300">
                <div className="flex items-center gap-4">
                  {/* Image */}
                  <Link to={`/products/${item.product?._id}`} className="shrink-0">
                    <div className="relative">
                      <img src={item.product?.thumbnail || 'https://via.placeholder.com/80'}
                        alt={item.product?.name}
                        className="w-20 h-20 object-cover rounded-xl shadow-sm group-hover:shadow-md transition-shadow" />
                      <div className="absolute inset-0 rounded-xl ring-1 ring-black/5" />
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.product?._id}`}
                      className="font-semibold text-gray-900 hover:text-brand-600 transition-colors line-clamp-2 text-sm leading-snug block mb-1">
                      {item.product?.name}
                    </Link>
                    {item.variant && (
                      <span className="inline-block text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg mb-1.5">{item.variant}</span>
                    )}
                    <p className="text-brand-600 font-bold text-sm">{formatPKR(item.product?.price)}</p>
                  </div>

                  {/* Quantity + Remove */}
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    {/* Quantity control */}
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                      <button onClick={() => handleUpdate(item._id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors text-gray-500">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm text-gray-900">{item.quantity}</span>
                      <button onClick={() => handleUpdate(item._id, item.quantity + 1)}
                        disabled={item.quantity >= item.product?.stock}
                        className="w-8 h-8 flex items-center justify-center hover:bg-green-50 hover:text-green-600 transition-colors text-gray-500 disabled:opacity-40">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    {/* Line total + remove */}
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">{formatPKR(item.product?.price * item.quantity)}</p>
                      <button onClick={() => removeItem(item._id).then(() => toast.success('Removed'))}
                        className="text-gray-300 hover:text-red-400 transition-colors mt-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-500" /> Order Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>{formatPKR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : formatPKR(shipping)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (5%)</span>
                  <span>{formatPKR(tax)}</span>
                </div>
              </div>

              <div className="my-4 border-t border-gray-100" />

              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gradient">{formatPKR(total)}</span>
              </div>

              {shipping > 0 && (
                <p className="text-xs text-brand-600 bg-brand-50 rounded-xl p-2.5 flex items-center gap-2 mb-4 border border-brand-100">
                  <Tag className="w-3.5 h-3.5 shrink-0" />
                  Add {formatPKR(100 - subtotal)} more for free delivery!
                </p>
              )}

              <button onClick={() => navigate('/checkout')}
                className="btn-primary w-full py-3.5 text-base rounded-2xl shadow-glow">
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </button>
              <Link to="/products" className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-3">
                ← Continue Shopping
              </Link>
            </div>

            {/* Promo codes */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-1 text-sm flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-brand-500" /> Promo Codes
              </h3>
              <p className="text-xs text-gray-400 mb-3">Enter at checkout for discounts</p>
              <div className="space-y-2">
                {[
                  ['SAVE10', '10% off your order', 'bg-blue-50 border-blue-100 text-blue-700'],
                  ['SAVE20', '20% off your order', 'bg-purple-50 border-purple-100 text-purple-700'],
                  ['FREESHIP', 'Free shipping', 'bg-green-50 border-green-100 text-green-700'],
                ].map(([code, desc, cls]) => (
                  <div key={code} className={`flex items-center justify-between p-2.5 border rounded-xl transition-all group ${cls}`}>
                    <div>
                      <code className="text-xs font-mono font-bold">{code}</code>
                      <p className="text-[11px] opacity-75 mt-0.5">{desc}</p>
                    </div>
                    <CopyCode code={code} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
