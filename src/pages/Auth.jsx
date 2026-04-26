import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Package, ArrowLeft, CheckCircle, Star, ShoppingBag, Zap, Truck, Shield, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import useWishlistStore from '../store/wishlistStore';

const PERKS = [
  [Truck,        'Free delivery on orders over Rs. 28,000', 'text-orange-200'],
  [Star,         'Exclusive member deals & early access',    'text-amber-200'],
  [RotateCcw,    'Easy 30-day returns, no questions asked',  'text-orange-100'],
  [Shield,       'Secure checkout & buyer protection',       'text-amber-100'],
];

const INPUT_CLS = "w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 caret-gray-900 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 focus:bg-white transition-all text-sm";

function InputField({ label, type, value, onChange, placeholder, required, rightSlot }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={INPUT_CLS + (rightSlot ? ' pr-11' : '')}
        />
        {rightSlot && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>}
      </div>
    </div>
  );
}

function AuthLayout({ children, title, subtitle, isRegister }) {
  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* ── Left: brand gradient panel ── */}
      <div
        className="hidden lg:flex lg:w-[44%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #1c0700 0%, #7c2d12 28%, #c2410c 58%, #ea6c10 80%, #f97316 100%)' }}
      >
        {/* decorative blobs */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-orange-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-24 w-80 h-80 bg-red-900/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-300/10 rounded-full blur-3xl pointer-events-none" />
        {/* grid texture overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.4) 39px,rgba(255,255,255,0.4) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.4) 39px,rgba(255,255,255,0.4) 40px)' }} />

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group w-fit relative z-10">
          <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
            <Package className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white tracking-tight">HiveMarket</span>
        </Link>

        {/* Main copy */}
        <div className="relative z-10">
          <div className="flex gap-1.5 mb-7">
            {[1,2,3].map(i => <div key={i} className={`h-1 rounded-full bg-white ${i===1?'w-8':'w-3'} opacity-60`} />)}
          </div>
          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            {isRegister ? 'Join Pakistan\'s favourite marketplace' : 'Good to see you again!'}
          </h2>
          <p className="text-orange-100/75 text-base leading-relaxed mb-10">
            {isRegister
              ? 'Create your free account and get exclusive deals delivered to your door.'
              : 'Sign in to track orders, manage your wishlist, and shop faster.'}
          </p>
          <div className="space-y-4">
            {PERKS.map(([Icon, text, color]) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className="text-orange-50/85 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-orange-200/40 text-xs relative z-10">© 2025 HiveMarket · Delivering across Pakistan 🇵🇰</p>
      </div>

      {/* ── Right: clean white form panel ── */}
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-orange-50/30 flex flex-col items-center justify-center p-6 sm:p-10">
        {/* Mobile logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-orange-400 rounded-xl flex items-center justify-center shadow-glow">
            <Package className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-gray-900">
            Hive<span className="text-brand-500">Market</span>
          </span>
        </Link>

        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
            {/* Brand icon accent */}
            <div className="w-11 h-11 bg-gradient-to-br from-brand-500 to-orange-400 rounded-2xl flex items-center justify-center mb-5 shadow-glow">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">{title}</h2>
            <p className="text-gray-400 text-sm mb-7">{subtitle}</p>
            {children}
          </div>

          <Link to="/" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mt-5 justify-center group">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { fetchWishlist } = useWishlistStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      await Promise.all([fetchCart(), fetchWishlist()]);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      navigate(data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Welcome back!" subtitle="Sign in to your HiveMarket account" isRegister={false}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Email address"
          type="email"
          value={form.email}
          onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
          placeholder="you@example.com"
          required
        />
        <InputField
          label="Password"
          type={showPw ? 'text' : 'password'}
          value={form.password}
          onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
          placeholder="Your password"
          required
          rightSlot={
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="text-gray-400 hover:text-gray-600 transition-colors">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        <button type="submit" disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-orange-400 hover:from-brand-600 hover:to-orange-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 active:scale-[0.99] shadow-glow flex items-center justify-center gap-2 mt-2">
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Signing in...</>
          ) : 'Sign In'}
        </button>
      </form>

      <div className="mt-5 pt-5 border-t border-gray-100">
        <p className="text-center text-sm text-gray-500">
          No account?{' '}
          <Link to="/register" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
            Sign up free
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { fetchWishlist } = useWishlistStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const data = await register(form.name, form.email, form.password);
      await Promise.all([fetchCart(), fetchWishlist()]);
      toast.success(`Welcome, ${data.user.name.split(' ')[0]}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const pwStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-green-500'];

  return (
    <AuthLayout title="Create account" subtitle="Join HiveMarket today — it's free" isRegister>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="Full Name" type="text" value={form.name}
          onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
          placeholder="Your Name" required />
        <InputField label="Email address" type="email" value={form.email}
          onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
          placeholder="you@example.com" required />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
              className={INPUT_CLS + ' pr-11'}
              placeholder="Min. 6 characters"
              required
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {form.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 flex gap-1">
                {[1, 2, 3].map((l) => (
                  <div key={l} className={`h-1 flex-1 rounded-full transition-all duration-300 ${pwStrength >= l ? strengthColor[pwStrength] : 'bg-gray-200'}`} />
                ))}
              </div>
              <span className={`text-xs font-medium ${pwStrength === 1 ? 'text-red-500' : pwStrength === 2 ? 'text-amber-500' : 'text-green-600'}`}>
                {strengthLabel[pwStrength]}
              </span>
            </div>
          )}
        </div>

        <InputField
          label="Confirm Password"
          type="password"
          value={form.confirm}
          onChange={(e) => setForm(p => ({ ...p, confirm: e.target.value }))}
          placeholder="Repeat password"
          required
          rightSlot={form.confirm && (
            <CheckCircle className={`w-4 h-4 ${form.confirm === form.password ? 'text-green-500' : 'text-red-400'}`} />
          )}
        />

        <button type="submit" disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-orange-400 hover:from-brand-600 hover:to-orange-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 active:scale-[0.99] shadow-glow flex items-center justify-center gap-2 mt-2">
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating account...</>
          ) : 'Create Account'}
        </button>
      </form>

      <div className="mt-5 pt-5 border-t border-gray-100">
        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Login;
