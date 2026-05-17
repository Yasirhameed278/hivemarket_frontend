import React, { useState } from 'react';
import { User, Lock, Save, Mail, Phone, Camera, ShieldCheck, Calendar, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import useAuthStore from '../store/authStore';

export default function Profile() {
  const { user, updateProfile } = useAuthStore();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await updateProfile(form); toast.success('Profile updated!'); }
    catch { toast.error('Update failed'); }
    setSaving(false);
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      await api.put('/auth/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password updated!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Cover banner */}
      <div className="relative h-44 bg-gradient-to-r from-dark-900 via-dark-700 to-dark-800 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(249,115,22,0.9) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Avatar row — overlaps cover */}
        <div className="relative -mt-14 mb-6 flex items-end gap-5">
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-400 to-orange-500 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white shadow-xl">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-lg border-2 border-white flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <div className="pb-1">
            <h1 className="font-display text-xl font-bold text-gray-900 leading-tight">{user?.name}</h1>
            <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />{user?.email}
            </p>
          </div>
        </div>

        {/* Info pills */}
        <div className="flex flex-wrap gap-2.5 mb-6">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-gray-100 shadow-sm text-xs text-gray-500">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-medium text-gray-700">Verified Member</span>
          </div>
          {user?.phone && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-gray-100 shadow-sm text-xs text-gray-500">
              <Phone className="w-3.5 h-3.5 text-brand-500" />
              <span>{user.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-gray-100 shadow-sm text-xs text-gray-500 capitalize">
            <Calendar className="w-3.5 h-3.5 text-violet-500" />
            <span className="font-medium">{user?.role || 'customer'}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-2xl p-1 shadow-sm border border-gray-100 w-fit">
          {[['profile', User, 'Profile'], ['security', Lock, 'Security']].map(([t, Icon, l]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t
                  ? 'bg-gradient-to-r from-brand-500 to-orange-400 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}>
              <Icon className="w-4 h-4" />{l}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="card p-6 mb-10">
          {tab === 'profile' && (
            <form onSubmit={handleProfile} className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                  <User className="w-4.5 h-4.5 text-brand-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 text-sm">Personal Information</h2>
                  <p className="text-xs text-gray-400">Update your name and phone number</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="label flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400" /> Full Name
                  </label>
                  <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="input" placeholder="Your full name" />
                </div>
                <div>
                  <label className="label flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" /> Phone
                  </label>
                  <input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} className="input" placeholder="+92 300 0000000" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" /> Email Address
                  </label>
                  <input value={user?.email} className="input bg-gray-50 text-gray-400 cursor-not-allowed" disabled />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed. Contact support for help.</p>
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-primary px-6 shadow-glow">
                <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}
          {tab === 'security' && (
            <form onSubmit={handlePassword} className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                  <Lock className="w-4.5 h-4.5 text-red-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 text-sm">Change Password</h2>
                  <p className="text-xs text-gray-400">Use a strong password you don't use elsewhere</p>
                </div>
              </div>
              <div className="space-y-4 max-w-md">
                {[['currentPassword','Current Password'],['newPassword','New Password'],['confirmPassword','Confirm Password']].map(([f,l]) => (
                  <div key={f}>
                    <label className="label">{l}</label>
                    <input type="password" value={pwForm[f]} onChange={e => setPwForm(p => ({...p, [f]: e.target.value}))} className="input" required placeholder="••••••••" />
                  </div>
                ))}
                <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  Use at least 8 characters with a mix of letters and numbers.
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-primary mt-6 px-6">
                <Lock className="w-4 h-4" />{saving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
