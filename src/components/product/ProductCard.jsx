import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import useWishlistStore from '../../store/wishlistStore';
import { formatPKR } from '../../utils/currency';

export default function ProductCard({ product }) {
  const { isLoggedIn } = useAuthStore();
  const { addItem } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const [adding, setAdding] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const wishlisted = isWishlisted(product._id);
  const discount = product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isLoggedIn()) return toast.error('Please sign in to add to cart');
    if (product.stock === 0) return toast.error('Out of stock');
    setAdding(true);
    try {
      await addItem(product._id, 1);
      toast.success('Added to cart!', { icon: '🛒' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isLoggedIn()) return toast.error('Please sign in');
    try {
      const added = await toggle(product._id);
      toast.success(added ? 'Added to wishlist!' : 'Removed from wishlist', { icon: added ? '❤️' : '💔' });
    } catch {}
  };

  const ratingInt = Math.round(product.rating || 0);

  return (
    <Link to={`/products/${product._id}`}
      className="product-card-hover group card overflow-hidden hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1.5 block relative">

      {/* Image container */}
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: '1' }}>
        {!imageLoaded && <div className="absolute inset-0 skeleton" />}
        <img
          src={product.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
          alt={product.name}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'; setImageLoaded(true); }}
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="badge bg-red-500 text-white text-[10px] font-bold shadow-sm">
              -{discount}%
            </span>
          )}
          {product.isFeatured && (
            <span className="badge badge-featured text-[10px] shadow-sm">
              <Zap className="w-2.5 h-2.5 mr-0.5" />Featured
            </span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-gray-800 text-white text-[10px]">Sold Out</span>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <span className="badge bg-amber-500 text-white text-[10px]">Only {product.stock} left</span>
          )}
        </div>

        {/* Wishlist button */}
        <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
          <button onClick={handleWishlist}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-all duration-200 active:scale-90 ${
              wishlisted
                ? 'bg-red-500 text-white shadow-red-200'
                : 'bg-white text-gray-400 hover:text-red-500 hover:bg-red-50'
            }`}>
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Quick add bar */}
        <div className="absolute inset-x-0 bottom-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button onClick={handleAddToCart} disabled={adding || product.stock === 0}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 ${
              product.stock === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : adding
                  ? 'bg-brand-500 text-white'
                  : 'bg-dark-900 text-white hover:bg-brand-600 shadow-lg'
            }`}>
            <ShoppingCart className={`w-4 h-4 ${adding ? 'animate-pulse' : ''}`} />
            {adding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Quick Add'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] text-brand-500 font-semibold uppercase tracking-widest">{product.category}</p>
          {product.viewCount > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <Eye className="w-2.5 h-2.5" />
              {product.viewCount}
            </div>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-brand-600 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < ratingInt ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-100'}`} />
            ))}
          </div>
          <span className="text-[11px] text-gray-400 font-medium">
            {product.rating ? product.rating.toFixed(1) : '0'} ({product.numReviews || 0})
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-gray-900">{formatPKR(product.price)}</span>
            {discount > 0 && (
              <span className="text-xs text-gray-400 line-through">{formatPKR(product.comparePrice)}</span>
            )}
          </div>
          {product.brand && (
            <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100 font-medium">{product.brand}</span>
          )}
        </div>
      </div>

      {/* Bottom color accent on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500 to-orange-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-2xl" />
    </Link>
  );
}
