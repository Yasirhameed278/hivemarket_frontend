import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RotateCcw, Star, Zap, TrendingUp, ChevronRight, Sparkles, Play, CheckCircle, Search } from 'lucide-react';
import api from '../api';
import ProductCard from '../components/product/ProductCard';
import { SkeletonCard } from '../components/ui/Loader';
import { formatPKR } from '../utils/currency';

const CATEGORIES = [
  { name: 'Electronics', emoji: '💻', color: 'from-blue-500 to-indigo-600', count: '120+ items',
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=500&h=500&fit=crop&auto=format' },
  { name: 'Clothing', emoji: '👕', color: 'from-pink-500 to-rose-600', count: '340+ items',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&h=500&fit=crop&auto=format' },
  { name: 'Sports', emoji: '🏏', color: 'from-green-500 to-emerald-600', count: '85+ items',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&h=500&fit=crop&auto=format' },
  { name: 'Home', emoji: '🏠', color: 'from-amber-500 to-orange-600', count: '200+ items',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format' },
  { name: 'Accessories', emoji: '👜', color: 'from-purple-500 to-violet-600', count: '95+ items',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&auto=format' },
];

const FEATURES = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders over Rs. 28,000', color: 'text-blue-600 bg-blue-50', border: 'border-blue-100' },
  { icon: Shield, title: 'Secure Payment', desc: '100% protected', color: 'text-green-600 bg-green-50', border: 'border-green-100' },
  { icon: RotateCcw, title: '30-Day Returns', desc: 'Hassle-free returns', color: 'text-purple-600 bg-purple-50', border: 'border-purple-100' },
  { icon: Zap, title: 'Cash on Delivery', desc: 'Available nationwide', color: 'text-amber-600 bg-amber-50', border: 'border-amber-100' },
];

const STATS = [['50K+', 'Products'], ['500K+', 'Customers'], ['4.9★', 'Avg. Rating'], ['99%', 'Satisfaction']];
const BRANDS = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG', 'Dell', 'Haier'];

function AnimatedStat({ value, label }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('featured');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, trendRes] = await Promise.all([
          api.get('/products?featured=true&limit=8'),
          api.get('/products?sort=popular&limit=8'),
        ]);
        setFeatured(featRes.data.products);
        setTrending(trendRes.data.products);
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const displayProducts = activeTab === 'featured' ? featured : trending;

  return (
    <div className="pt-16">
      {/* Aurora background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="aurora-blob-1 absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-orange-400/20 blur-[120px]" />
        <div className="aurora-blob-2 absolute -bottom-48 -left-48 w-[700px] h-[700px] rounded-full bg-violet-500/15 blur-[140px]" />
        <div className="aurora-blob-3 absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full bg-brand-500/10 blur-[100px]" />
        <div className="aurora-blob-4 absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-pink-400/10 blur-[100px]" />
      </div>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-dark-700 min-h-[88vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pakistan's Premium Online Store 🇵🇰</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-5">
              Shop the<br />
              <span className="text-gradient">Future</span>
              <br />of Retail.
            </h1>

            <p className="text-gray-400 text-lg leading-relaxed mb-7 max-w-md">
              Discover thousands of premium products. Fast nationwide delivery, easy returns, and Cash on Delivery available across Pakistan.
            </p>

            {/* ── Search bar — integrated into content flow ── */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-1.5 mb-7 shadow-lg">
              <Search className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchQuery && navigate(`/products?keyword=${searchQuery}`)}
                placeholder="Search mobiles, clothing, appliances..."
                className="flex-1 bg-transparent text-white placeholder-gray-400 text-sm outline-none py-1"
              />
              <button
                onClick={() => searchQuery && navigate(`/products?keyword=${searchQuery}`)}
                className="btn-primary px-5 py-2.5 rounded-xl text-sm shrink-0">
                Search
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link to="/products" className="btn-primary px-7 py-3.5 text-base rounded-2xl shadow-glow group">
                Shop Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/products?featured=true"
                className="btn px-7 py-3.5 text-base rounded-2xl border border-white/10 text-white hover:bg-white/10 backdrop-blur-sm gap-2">
                <Play className="w-4 h-4 text-brand-400" />
                View Featured
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-pink-400'].map((c, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-dark-800 ${c} flex items-center justify-center text-white text-xs font-bold`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {Array.from({ length: 5 }, (_, i) => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-xs text-gray-400">Trusted by 500K+ shoppers in Pakistan</p>
              </div>
            </div>
          </div>

          {/* Hero visual */}
          <div className="hidden lg:block animate-float">
            <div className="relative">
              <div className="w-80 h-80 mx-auto rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <img
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=600&fit=crop&auto=format"
                  alt="Shopping"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating card 1 */}
              <div className="absolute -left-14 top-10 glass-dark rounded-2xl p-3.5 shadow-xl animate-slide-up">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Today's Sales</p>
                    <p className="text-sm font-bold text-white">Rs. 34.9L</p>
                  </div>
                </div>
              </div>
              {/* Floating card 2 */}
              <div className="absolute -right-10 bottom-16 glass-dark rounded-2xl p-3 shadow-xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  {Array.from({ length: 5 }, (_, i) => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-xs text-gray-300 font-medium">Loved by 500K+ users</p>
              </div>
              {/* Floating card 3 */}
              <div className="absolute -right-6 top-8 glass-dark rounded-2xl p-3 shadow-xl animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <p className="text-xs text-gray-300 font-medium">Order Delivered! 🎉</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-white/5">
            {STATS.map(([val, label]) => (
              <AnimatedStat key={label} value={val} label={label} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-10 glass-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, color, border }) => (
            <div key={title}
              className={`flex items-center gap-3.5 p-4 rounded-2xl bg-white border ${border} shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{title}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-0.5 bg-brand-500 rounded-full" />
              <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest">Browse by</p>
            </div>
            <h2 className="section-title text-3xl">Shop Categories</h2>
          </div>
          <Link to="/products" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-500 transition-colors group">
            All categories
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat, i) => (
            <Link key={cat.name} to={`/products?category=${cat.name}`}
              style={{ animationDelay: `${i * 80}ms` }}
              className="category-card group relative overflow-hidden rounded-2xl aspect-square shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
              <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-25 group-hover:opacity-45 transition-opacity duration-300`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <div className="absolute top-3 left-3 w-9 h-9 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-lg">
                {cat.emoji}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="font-bold text-white text-sm">{cat.name}</p>
                <p className="text-[11px] text-white/70">{cat.count}</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-10 h-10 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Tabbed Products */}
      <section className="py-16 glass-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-8 h-0.5 bg-brand-500 rounded-full" />
                <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest">Discover</p>
              </div>
              <h2 className="section-title text-3xl">Our Products</h2>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {[['featured', 'Featured', Sparkles], ['trending', 'Trending', TrendingUp]].map(([tab, label, Icon]) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
            <Link to={activeTab === 'featured' ? '/products?featured=true' : '/products?sort=popular'}
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-500 transition-colors group">
              View all <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {loading
              ? Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)
              : displayProducts.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
          <div className="mt-8 text-center">
            <Link to={activeTab === 'featured' ? '/products?featured=true' : '/products?sort=popular'}
              className="btn-secondary px-8 py-3 text-sm inline-flex items-center gap-2">
              Browse All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-gray-400 uppercase tracking-widest mb-8">Available Brands</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {BRANDS.map((brand) => (
            <div key={brand}
              className="px-6 py-3 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-400 text-sm font-semibold hover:text-brand-600 hover:border-brand-200 hover:shadow-brand-50 hover:shadow-md transition-all duration-200 cursor-pointer">
              {brand}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-8">
        <div className="relative overflow-hidden rounded-3xl p-1 bg-gradient-to-r from-brand-500 via-orange-400 to-amber-500 animate-gradient-x">
          <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-r from-dark-900 to-dark-700 p-10 md:p-16">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl" />
              <div className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: 'radial-gradient(circle, rgba(249,115,22,0.8) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
            </div>
            <div className="relative flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-widest mb-4">
                  <Zap className="w-3 h-3" /> Limited Time Offer
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
                  Get <span className="text-gradient">20% Off</span> Your First Order
                </h2>
                <p className="text-gray-400 mb-6 max-w-md">
                  Use code <span className="font-mono font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-lg">SAVE20</span> at checkout. Valid on your entire first purchase.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <Link to="/products" className="btn-primary px-8 py-3.5 text-base rounded-2xl shadow-glow group">
                    Shop Now & Save <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/register" className="btn px-8 py-3.5 text-base rounded-2xl border border-white/15 text-white hover:bg-white/10">
                    Create Account
                  </Link>
                </div>
              </div>
              <div className="hidden md:flex flex-col gap-3 shrink-0">
                {[
                  ['Free delivery nationwide', 'text-blue-400'],
                  ['Cash on Delivery available', 'text-green-400'],
                  ['30-day hassle-free returns', 'text-purple-400'],
                ].map(([perk, color]) => (
                  <div key={perk} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <CheckCircle className={`w-4 h-4 ${color} shrink-0`} />
                    {perk}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
