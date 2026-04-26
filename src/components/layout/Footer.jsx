import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Mail, Twitter, Instagram, Github, Heart, ArrowRight, MapPin, Phone, Zap, Shield, Truck, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const SHOP_LINKS = [['All Products', '/products'], ['Electronics', '/products?category=Electronics'], ['Clothing', '/products?category=Clothing'], ['Sports', '/products?category=Sports'], ['Home & Living', '/products?category=Home']];
const ACCOUNT_LINKS = [['My Orders', '/orders'], ['Wishlist', '/wishlist'], ['Profile', '/profile'], ['Shopping Cart', '/cart']];
const SUPPORT_LINKS = [['FAQ', '#'], ['Shipping Info', '#'], ['Returns & Refunds', '#'], ['Contact Us', '#'], ['Size Guide', '#']];

const FEATURES = [
  { icon: Truck, label: 'Free Shipping', sublabel: 'Orders over $100', color: 'text-blue-400' },
  { icon: Shield, label: 'Secure Payments', sublabel: '256-bit SSL', color: 'text-green-400' },
  { icon: RotateCcw, label: '30-Day Returns', sublabel: 'No questions asked', color: 'text-purple-400' },
  { icon: Zap, label: 'Fast Delivery', sublabel: '1-2 business days', color: 'text-amber-400' },
];

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Thanks for subscribing!', { icon: '🎉' });
    setEmail('');
  };

  return (
    <footer className="relative mt-20 overflow-hidden">
      {/* Feature strip */}
      <div className="bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, label, sublabel, color }) => (
              <div key={label} className="flex items-center gap-3 group">
                <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${color} group-hover:bg-white/10 transition-colors shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{label}</p>
                  <p className="text-gray-500 text-xs">{sublabel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="bg-dark-900 text-gray-400">
        {/* Gradient top line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

            {/* Brand column */}
            <div className="md:col-span-4">
              <Link to="/" className="flex items-center gap-2.5 mb-5 group w-fit">
                <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-orange-400 rounded-xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                  <Package className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="font-display font-bold text-xl text-white">
                  Hive<span className="text-gradient">Market</span>
                </span>
              </Link>

              <p className="text-sm leading-relaxed mb-6 text-gray-400 max-w-xs">
                Premium products, exceptional service. Discover thousands of curated items with AI-powered shopping assistance and fast delivery.
              </p>

              {/* Newsletter */}
              <div className="mb-6">
                <p className="text-white text-sm font-semibold mb-2">Stay in the loop</p>
                <form onSubmit={handleNewsletter} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 bg-dark-700 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                  <button type="submit"
                    className="btn-primary px-3 py-2 text-sm rounded-xl shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
                <p className="text-xs text-gray-600 mt-1.5">No spam, unsubscribe anytime.</p>
              </div>

              {/* Socials */}
              <div className="flex items-center gap-2">
                {[
                  [Twitter, 'Twitter', 'hover:bg-sky-500/20 hover:text-sky-400'],
                  [Instagram, 'Instagram', 'hover:bg-pink-500/20 hover:text-pink-400'],
                  [Github, 'GitHub', 'hover:bg-gray-500/20 hover:text-gray-300'],
                  [Mail, 'Email', 'hover:bg-brand-500/20 hover:text-brand-400'],
                ].map(([Icon, label, hoverClass]) => (
                  <a key={label} href="#" title={label}
                    className={`p-2.5 rounded-xl bg-dark-700 text-gray-400 transition-all duration-200 ${hoverClass}`}>
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
              {[
                { title: 'Shop', links: SHOP_LINKS },
                { title: 'Account', links: ACCOUNT_LINKS },
                { title: 'Support', links: SUPPORT_LINKS },
              ].map((col) => (
                <div key={col.title}>
                  <h4 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-gradient-to-b from-brand-500 to-orange-400 rounded-full inline-block" />
                    {col.title}
                  </h4>
                  <ul className="space-y-2.5">
                    {col.links.map(([label, path]) => (
                      <li key={label}>
                        <Link to={path} className="footer-link">{label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              © 2025 HiveMarket. All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              Made with <Heart className="w-3 h-3 text-red-400 fill-red-400 mx-0.5" /> by HiveMarket Team
            </div>
            <div className="flex items-center gap-4">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link) => (
                <a key={link} href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">{link}</a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
