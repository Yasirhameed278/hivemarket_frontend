import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import useAuthStore from '../store/authStore';

const PERKS = [
  'Reach thousands of customers on HiveMarket',
  'Manage your own products and inventory',
  'Track orders and earnings in your dashboard',
  'Only 10% platform commission — keep 90%',
  'Free to join — no monthly fees',
];

export default function BecomeVendor() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ storeName: '', description: '', logo: '', bankName: '', accountNumber: '' });

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/login'); return; }
    api.get('/vendors/me/profile')
      .then(({ data }) => setExisting(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.storeName.trim()) return toast.error('Store name is required');
    setSaving(true);
    try {
      await api.post('/vendors/apply', {
        storeName: form.storeName,
        description: form.description,
        logo: form.logo,
        bankDetails: { bankName: form.bankName, accountNumber: form.accountNumber },
      });
      toast.success('Application submitted! An admin will review it shortly.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Already applied / approved / suspended
  if (existing) {
    const configs = {
      pending:   { Icon: Clock,        bg: 'bg-amber-50 border-amber-200',  text: 'text-amber-700',  title: 'Application Under Review',    msg: 'Your vendor application is being reviewed. We\'ll notify you once it\'s approved.' },
      approved:  { Icon: CheckCircle,  bg: 'bg-green-50 border-green-200',  text: 'text-green-700',  title: 'You\'re an Approved Vendor!',  msg: 'Head to your dashboard to manage products and track your earnings.' },
      suspended: { Icon: XCircle,      bg: 'bg-red-50 border-red-200',      text: 'text-red-700',    title: 'Account Suspended',           msg: 'Your vendor account has been suspended. Contact support for assistance.' },
    };
    const cfg = configs[existing.status];
    const { Icon } = cfg;
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className={`card max-w-md w-full p-8 text-center border ${cfg.bg}`}>
          <Icon className={`w-12 h-12 mx-auto mb-4 ${cfg.text}`} />
          <h2 className={`text-xl font-display font-bold ${cfg.text} mb-2`}>{cfg.title}</h2>
          <p className="text-sm text-gray-500 mb-6">{cfg.msg}</p>
          {existing.status === 'approved' && (
            <Link to="/vendor" className="btn-primary w-full py-3">Go to Vendor Dashboard</Link>
          )}
          {existing.status !== 'approved' && (
            <Link to="/" className="btn-secondary w-full py-3">Back to Home</Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left — pitch */}
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Store className="w-3.5 h-3.5" /> Sell on HiveMarket
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
              Start your own<br />store today
            </h1>
            <p className="text-gray-500 text-base mb-8 leading-relaxed">
              Join our growing marketplace and reach thousands of customers. Set up your store in minutes — no upfront costs.
            </p>
            <ul className="space-y-3">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  {perk}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — form */}
          <div className="card p-7">
            <h2 className="font-display text-xl font-bold text-gray-900 mb-1">Apply to sell</h2>
            <p className="text-sm text-gray-400 mb-6">Fill in your store details. Applications are reviewed within 24 hours.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Store Name <span className="text-red-400">*</span></label>
                <input value={form.storeName} onChange={e => set('storeName', e.target.value)}
                  placeholder="e.g. Ali's Electronics" className="input" required />
              </div>

              <div>
                <label className="label">Store Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  rows={3} placeholder="Tell customers what you sell..." className="input resize-none" />
              </div>

              <div>
                <label className="label">Store Logo URL</label>
                <input value={form.logo} onChange={e => set('logo', e.target.value)}
                  placeholder="https://..." className="input" />
                <p className="text-xs text-gray-400 mt-1">Paste a direct image link (optional)</p>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Payout Details (optional)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Bank Name</label>
                    <input value={form.bankName} onChange={e => set('bankName', e.target.value)}
                      placeholder="e.g. HBL" className="input" />
                  </div>
                  <div>
                    <label className="label">Account Number</label>
                    <input value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)}
                      placeholder="PK..." className="input" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2 disabled:opacity-40">
                {saving ? 'Submitting...' : <><span>Submit Application</span><ChevronRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
