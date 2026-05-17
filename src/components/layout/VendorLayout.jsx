import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, LogOut, Menu, X, ChevronRight, Store, TrendingUp } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api';

const navItems = [
  { path: '/vendor', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/vendor/products', icon: Package, label: 'My Products' },
  { path: '/vendor/orders', icon: ShoppingBag, label: 'My Orders' },
];

export default function VendorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/vendors/me/profile')
      .then(({ data }) => setVendor(data))
      .catch(() => navigate('/become-vendor'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path, end) => end ? location.pathname === path : location.pathname.startsWith(path);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const Sidebar = ({ mobile = false }) => (
    <div className={`relative flex flex-col h-full ${mobile ? 'w-72' : collapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800/60`}>
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-br from-brand-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="relative flex items-center gap-3 px-4 py-5 border-b border-slate-800/60">
        <div className="w-9 h-9 bg-gradient-to-br from-brand-500 via-orange-400 to-amber-400 rounded-xl flex items-center justify-center shrink-0 shadow-glow">
          <Store className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        {(!collapsed || mobile) && (
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-white text-sm leading-none truncate">{vendor?.storeName || 'My Store'}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">Vendor Panel</p>
          </div>
        )}
        {!mobile && (
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
            <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="relative flex-1 px-3 py-5 space-y-1">
        {(!collapsed || mobile) && (
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Menu</p>
        )}
        {navItems.map(({ path, icon: Icon, label, end }) => {
          const active = isActive(path, end);
          return (
            <Link key={path} to={path} onClick={() => setMobileOpen(false)}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                active
                  ? 'bg-gradient-to-r from-brand-500 to-orange-500 text-white shadow-lg shadow-brand-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}>
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />}
              <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-slate-500 group-hover:text-brand-400'} transition-colors`} />
              {(!collapsed || mobile) && <span className="text-sm font-medium">{label}</span>}
            </Link>
          );
        })}

        {(!collapsed || mobile) && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Store</p>
            </div>
            {vendor && (
              <Link to={`/vendors/${vendor._id}`} target="_blank"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all">
                <TrendingUp className="w-5 h-5 text-slate-500" />
                <span className="text-sm font-medium">View My Store</span>
              </Link>
            )}
          </>
        )}
      </nav>

      {/* User */}
      <div className="relative p-3 border-t border-slate-800/60">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-amber-400 flex items-center justify-center text-white text-sm font-bold shrink-0 ring-2 ring-slate-800">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          {(!collapsed || mobile) && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <button onClick={handleLogout} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="hidden md:flex"><Sidebar /></div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10"><Sidebar mobile /></div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/70 px-6 py-3.5 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-semibold text-gray-900 text-[15px]">
                {navItems.find(n => isActive(n.path, n.end))?.label || 'Vendor Panel'}
              </h1>
              <p className="text-xs text-gray-400">{vendor?.storeName}</p>
            </div>
          </div>
          <Link to="/" className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-brand-600 px-3 py-2 rounded-lg hover:bg-brand-50 transition-all">
            View Store <span aria-hidden>→</span>
          </Link>
        </header>
        <main className="flex-1 overflow-y-auto p-6"><Outlet /></main>
      </div>
    </div>
  );
}
