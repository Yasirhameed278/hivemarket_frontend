import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store, Package, Star, MapPin, ShieldCheck } from 'lucide-react';
import api from '../api';
import { PageLoader } from '../components/ui/Loader';
import ProductCard from '../components/product/ProductCard';
import { formatPKR } from '../utils/currency';

export default function VendorStore() {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([
      api.get(`/vendors/${id}`),
      api.get(`/vendors/${id}/products`),
    ]).then(([{ data: v }, { data: p }]) => {
      setVendor(v);
      setProducts(p.products || []);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (!vendor) return (
    <div className="pt-24 min-h-screen flex items-center justify-center text-gray-500">
      Vendor not found.
    </div>
  );

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Store hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-6">
            {vendor.logo ? (
              <img src={vendor.logo} alt={vendor.storeName}
                className="w-20 h-20 rounded-2xl object-cover border border-gray-200 shadow-sm shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-orange-400 flex items-center justify-center shrink-0 shadow-sm">
                <Store className="w-9 h-9 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-2xl font-bold text-gray-900">{vendor.storeName}</h1>
                <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" title="Verified Vendor" />
              </div>
              {vendor.description && (
                <p className="text-gray-500 text-sm leading-relaxed max-w-xl">{vendor.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Package className="w-4 h-4" /> {products.length} product{products.length !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {vendor.totalSales || 0} sales
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="font-semibold text-gray-900 text-lg mb-6">
          Products by {vendor.storeName}
        </h2>
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Package className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">No products listed yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
