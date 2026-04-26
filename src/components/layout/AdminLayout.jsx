import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Menu, X,
  LogOut, ChevronRight, Bell, Settings, TrendingUp, CheckCheck
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api';
import { formatPKR } from '../../utils/currency';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/admin/products', icon: Package, label: 'Products' },
  { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { path: '/admin/users', icon: Users, label: 'Users' },
];

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(true);
  const [nLoading, setNLoading] = useState(false);
  const bellRef = useRef(null);

  // Fetch recent orders as notifications when dropdown opens
  useEffect(() => {
    if (!showNotifications || notifications.length) return;
    setNLoading(true);
    api.get('/orders/admin/all?limit=6')
      .then(({ data }) => setNotifications(data.orders || []))
      .catch(() => {})
      .finally(() => setNLoading(false));
  }, [showNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setShowNotifications(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (path, end) => end ? location.pathname === path : location.pathname.startsWith(path);

  const Sidebar = ({ mobile = false }) => (
    <div className={`relative flex flex-col h-full ${mobile ? 'w-72' : collapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800/60`}>
      {/* subtle radial accent in top-left */}
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-br from-brand-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="relative flex items-center gap-3 px-4 py-5 border-b border-slate-800/60">
        <div className="w-9 h-9 bg-gradient-to-br from-brand-500 via-orange-400 to-amber-400 rounded-xl flex items-center justify-center shrink-0 shadow-glow">
          <TrendingUp className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
        </div>
        {(!collapsed || mobile) && (
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-white text-lg leading-none">HiveMarket</p>
            <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">Admin Panel</p>
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
      </nav>

      {/* User */}
      <div className="relative p-3 border-t border-slate-800/60 bg-slate-950/40">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 via-orange-400 to-amber-400 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md ring-2 ring-slate-800">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          {(!collapsed || mobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          )}
          {(!collapsed || mobile) && (
            <button onClick={handleLogout} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="relative bg-white/80 backdrop-blur-xl border-b border-gray-200/70 px-6 py-3.5 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-semibold text-gray-900 text-[15px]">
                {navItems.find(n => isActive(n.path, n.end))?.label || 'Admin Panel'}
              </h1>
              <p className="text-xs text-gray-400">HiveMarket Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" target="_blank" className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-brand-600 px-3 py-2 rounded-lg hover:bg-brand-50 transition-all">
              View Store
              <span aria-hidden>→</span>
            </Link>
            <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />
            <div className="relative" ref={bellRef}>
              <button
                onClick={() => { setShowNotifications(v => !v); setUnread(false); }}
                className="p-2 rounded-lg hover:bg-gray-100 relative transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-500" />
                {unread && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="font-semibold text-gray-800 text-sm">Recent Orders</span>
                    <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {nLoading ? (
                      <div className="flex items-center justify-center py-8 text-sm text-gray-400">Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div className="flex items-center justify-center py-8 text-sm text-gray-400">No recent orders</div>
                    ) : notifications.map(order => (
                      <Link
                        key={order._id}
                        to={`/admin/orders`}
                        onClick={() => setShowNotifications(false)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <ShoppingBag className="w-4 h-4 text-brand-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{order.user?.name || 'Guest'} · {formatPKR(order.totalPrice)}</p>
                        </div>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.status}
                        </span>
                      </Link>
                    ))}
                  </div>

                  <div className="px-4 py-3 border-t border-gray-100">
                    <Link to="/admin/orders" onClick={() => setShowNotifications(false)}
                      className="flex items-center justify-center gap-1.5 text-xs text-brand-500 hover:text-brand-600 font-medium">
                      <CheckCheck className="w-3.5 h-3.5" /> View all orders
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
