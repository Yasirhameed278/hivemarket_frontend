import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, User, Menu, X, Search, Package, LogOut, LayoutDashboard, ChevronDown, Sparkles, Bell } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import useWishlistStore from '../../store/wishlistStore';
import api from '../../api';
import { formatPKR } from '../../utils/currency';

const NAV_LINKS = [['/', 'Home'], ['/products', 'Products'], ['/products?category=Electronics', 'Electronics'], ['/products?category=Clothing', 'Fashion']];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, isLoggedIn } = useAuthStore();
  const { getCount } = useCartStore();
  const { items: wishlist } = useWishlistStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (q) => {
    setSearchQuery(q);
    clearTimeout(debounceRef.current);
    if (q.length < 2) return setSearchResults([]);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/chatbot/search?query=${q}`);
        setSearchResults(data);
      } catch {}
    }, 300);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartCount = getCount();
  const isActivePath = (path) => {
    if (path === '/') return location.pathname === '/';
    const currentFull = location.pathname + location.search;
    if (path.includes('?')) return currentFull === path;
    return location.pathname === path;
  };

  return (
    <>
      {/* Announcement banner */}
      {announcementVisible && (
        <div className="relative z-50 bg-gradient-to-r from-brand-600 via-orange-500 to-amber-500 text-white text-xs py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 overflow-hidden">
            <Sparkles className="w-3 h-3 shrink-0" />
            <div className="overflow-hidden">
              <span className="animate-ticker inline-block whitespace-nowrap">
                🎉 Free delivery on orders over Rs. 28,000 &nbsp;·&nbsp; Use code <strong>SAVE20</strong> for 20% off your first order &nbsp;·&nbsp; New arrivals every week! &nbsp;·&nbsp; 🇵🇰 Delivering across Pakistan &nbsp;·&nbsp; Cash on Delivery available &nbsp;·&nbsp; 🎉 Free delivery on orders over Rs. 28,000
              </span>
            </div>
            <button onClick={() => setAnnouncementVisible(false)}
              className="ml-3 shrink-0 p-0.5 rounded hover:bg-white/20 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      <nav className={`sticky top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.06),0_4px_24px_rgba(249,115,22,0.06)]'
          : 'bg-gradient-to-r from-orange-50 via-amber-50/60 to-orange-50/40 border-b border-orange-100/60'
      }`}>
        {/* Colored top accent line */}
        <div className="h-[3px] w-full bg-gradient-to-r from-brand-600 via-orange-400 to-amber-400" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="relative w-9 h-9 bg-gradient-to-br from-brand-500 to-orange-400 rounded-xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-200">
                <Package className="w-4.5 h-4.5 text-white" />
                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="font-display font-bold text-xl text-gray-900 tracking-tight">
                Hive<span className="text-gradient">Market</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map(([path, label]) => (
                <Link key={path} to={path}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActivePath(path)
                      ? 'text-brand-600 bg-brand-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
                  }`}>
                  {label}
                  {isActivePath(path) && (
                    <span className="absolute bottom-0.5 left-4 right-4 h-0.5 bg-gradient-to-r from-brand-500 to-orange-400 rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">

              {/* Search */}
              <div className="relative" ref={searchRef}>
                <button onClick={() => { setSearchOpen(!searchOpen); setSearchQuery(''); setSearchResults([]); }}
                  className={`p-2.5 rounded-xl transition-all duration-200 ${searchOpen ? 'bg-brand-50 text-brand-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>
                  <Search className="w-4.5 h-4.5" />
                </button>
                {searchOpen && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-down">
                    <div className="p-3 border-b border-gray-50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input autoFocus value={searchQuery} onChange={(e) => handleSearch(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter' && searchQuery) { navigate(`/products?keyword=${searchQuery}`); setSearchOpen(false); setSearchQuery(''); } }}
                          placeholder="Search products..." className="input pl-9 text-sm" />
                      </div>
                    </div>
                    {searchResults.length > 0 && (
                      <div className="max-h-72 overflow-y-auto">
                        <p className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Results</p>
                        {searchResults.map((p) => (
                          <Link key={p._id} to={`/products/${p._id}`}
                            onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-brand-50 transition-colors group">
                            <img src={p.thumbnail || 'https://via.placeholder.com/40'} alt={p.name}
                              className="w-11 h-11 object-cover rounded-xl border border-gray-100" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-brand-600 transition-colors">{p.name}</p>
                              <p className="text-xs text-brand-600 font-bold">{formatPKR(p.price)}</p>
                            </div>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-300 -rotate-90 shrink-0" />
                          </Link>
                        ))}
                        <div className="p-2 border-t border-gray-50">
                          <button onClick={() => { navigate(`/products?keyword=${searchQuery}`); setSearchOpen(false); }}
                            className="w-full py-2 text-xs text-brand-600 font-medium hover:bg-brand-50 rounded-lg transition-colors">
                            See all results for "{searchQuery}"
                          </button>
                        </div>
                      </div>
                    )}
                    {searchQuery.length >= 2 && searchResults.length === 0 && (
                      <div className="p-6 text-center text-gray-400 text-sm">No products found</div>
                    )}
                  </div>
                )}
              </div>

              {isLoggedIn() && (
                <>
                  <Link to="/wishlist"
                    className="relative p-2.5 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200">
                    <Heart className={`w-4.5 h-4.5 ${wishlist.length > 0 ? 'fill-red-400 text-red-400' : ''}`} />
                    {wishlist.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-scale-in">{wishlist.length > 9 ? '9+' : wishlist.length}</span>
                    )}
                  </Link>
                  <Link to="/cart"
                    className="relative p-2.5 rounded-xl text-gray-500 hover:text-brand-600 hover:bg-brand-50 transition-all duration-200">
                    <ShoppingCart className="w-4.5 h-4.5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-brand-500 to-orange-400 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-scale-in">{cartCount > 9 ? '9+' : cartCount}</span>
                    )}
                  </Link>
                </>
              )}

              {isLoggedIn() ? (
                <div className="relative ml-1">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl transition-all duration-200 ${userMenuOpen ? 'bg-gray-100' : 'hover:bg-gray-100'}`}>
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-orange-400 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-1.5 animate-slide-down z-50 overflow-hidden">
                      {/* User header */}
                      <div className="px-4 py-3 bg-gradient-to-r from-brand-50 to-orange-50 border-b border-orange-100 mb-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-orange-400 flex items-center justify-center text-white font-bold">
                            {user?.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      {[
                        ['/profile', <User className="w-4 h-4" />, 'Profile', 'text-blue-500 bg-blue-50'],
                        ['/orders', <Package className="w-4 h-4" />, 'My Orders', 'text-purple-500 bg-purple-50'],
                        ['/wishlist', <Heart className="w-4 h-4" />, 'Wishlist', 'text-red-500 bg-red-50'],
                        ...(isAdmin() ? [['/admin', <LayoutDashboard className="w-4 h-4" />, 'Admin Dashboard', 'text-brand-500 bg-brand-50']] : []),
                      ].map(([path, icon, label, iconColor]) => (
                        <Link key={path} to={path}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors mx-1.5 rounded-xl">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconColor}`}>{icon}</span>
                          {label}
                        </Link>
                      ))}

                      <div className="border-t border-gray-100 mt-1 pt-1 mx-1.5 mb-1">
                        <button onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                          <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50"><LogOut className="w-4 h-4" /></span>
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-1">
                  <Link to="/login" className="btn-ghost text-sm px-3 py-2 rounded-xl">Sign in</Link>
                  <Link to="/register" className="btn-primary text-sm px-4 py-2 rounded-xl">Sign up</Link>
                </div>
              )}

              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-colors ml-1">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 animate-slide-down shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map(([path, label]) => (
                <Link key={path} to={path}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActivePath(path) ? 'bg-brand-50 text-brand-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}>
                  {label}
                  {isActivePath(path) && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />}
                </Link>
              ))}
            </div>
            {!isLoggedIn() && (
              <div className="px-4 pb-4 flex gap-2">
                <Link to="/login" className="flex-1 btn-secondary text-center justify-center">Sign in</Link>
                <Link to="/register" className="flex-1 btn-primary text-center justify-center">Sign up</Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
