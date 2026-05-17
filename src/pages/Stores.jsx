import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, Search, Star, Package, ShieldCheck, ArrowRight, TrendingUp } from 'lucide-react';
import api from '../api';
import { formatPKR } from '../utils/currency';

function StoreCard({ vendor }) {
  return (
    <Link to={`/vendors/${vendor._id}`}
      className="group bg-white rounded-2xl border border-gray-200 hover:border-brand-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col">
      {/* Banner */}
      <div className="h-24 bg-gradient-to-br from-brand-500/10 via-orange-400/10 to-amber-400/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(249,115,22,0.4) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/5 to-orange-500/10" />
      </div>

      {/* Logo — overlaps banner */}
      <div className="px-5 -mt-8 mb-3">
        {vendor.logo ? (
          <img src={vendor.logo} alt={vendor.storeName}
            className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-md" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-orange-400 flex items-center justify-center border-4 border-white shadow-md">
            <Store className="w-7 h-7 text-white" />
          </div>
        )}
      </div>

      <div className="px-5 pb-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-bold text-gray-900 text-base group-hover:text-brand-600 transition-colors leading-tight">
            {vendor.storeName}
          </h3>
          <ShieldCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
        </div>

        {vendor.description && (
          <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2 flex-1">
            {vendor.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Package className="w-3.5 h-3.5" /> {vendor.productCount || 0} products
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> {vendor.totalSales || 0} sales
            </span>
          </div>
          <span className="text-xs font-semibold text-brand-600 flex items-center gap-1 group-hover:gap-2 transition-all">
            Visit <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Stores() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get('/vendors?limit=50')
      .then(({ data }) => setVendors(data.vendors || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = vendors.filter(v =>
    v.storeName.toLowerCase().includes(search.toLowerCase()) ||
    (v.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Hero header */}
      <div className="relative bg-gradient-to-r from-dark-900 via-dark-800 to-dark-700 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(249,115,22,0.8) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-0.5 bg-brand-500 rounded-full" />
            <p className="text-brand-400 text-xs font-semibold uppercase tracking-widest">Marketplace</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
                Our Sellers
              </h1>
              <p className="text-gray-400 max-w-md">
                {vendors.length} verified store{vendors.length !== 1 ? 's' : ''} — browse and shop directly from trusted sellers across Pakistan
              </p>
            </div>
            <Link to="/become-vendor"
              className="btn-primary px-5 py-3 text-sm shrink-0 flex items-center gap-2 shadow-glow">
              <Store className="w-4 h-4" /> Sell on HiveMarket
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search stores..."
            className="input pl-10 text-sm"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-24 bg-gray-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Store className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-base font-medium">
              {search ? `No stores matching "${search}"` : 'No stores yet'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="mt-3 text-sm text-brand-500 hover:underline">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(v => <StoreCard key={v._id} vendor={v} />)}
          </div>
        )}
      </div>
    </div>
  );
}
