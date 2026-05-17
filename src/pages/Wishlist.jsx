import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import useWishlistStore from '../store/wishlistStore';
import ProductCard from '../components/product/ProductCard';

export default function Wishlist() {
  const { items, fetchWishlist } = useWishlistStore();
  useEffect(() => { fetchWishlist(); }, []);
  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <Heart className="w-6 h-6 text-red-400 fill-red-400" />Wishlist ({items.length})
        </h1>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl flex items-center justify-center border border-red-100/60 shadow-inner mx-auto">
                <Heart className="w-11 h-11 text-red-200" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-red-500 rounded-xl shadow-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">♡</span>
              </div>
            </div>
            <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Nothing saved yet</h3>
            <p className="text-gray-400 text-sm mb-8 max-w-xs">Browse products and tap the heart icon to save items you love for later.</p>
            <Link to="/products" className="btn-primary px-8 py-3 rounded-2xl shadow-glow">Discover Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {items.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
