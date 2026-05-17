import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Tag, ToggleLeft, ToggleRight, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import { formatPKR } from '../../utils/currency';

const EMPTY_FORM = {
  code: '',
  type: 'percent',
  value: '',
  minOrder: '',
  usageLimit: '',
  expiresAt: '',
  isActive: true,
};

const TYPE_LABELS = { percent: '% Percent', flat: 'Flat PKR', freeship: 'Free Shipping' };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // coupon id being edited
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/coupons');
      setCoupons(data.coupons || []);
    } catch {
      toast.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (coupon) => {
    setEditing(coupon._id);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value === 0 && coupon.type === 'freeship' ? '' : String(coupon.value),
      minOrder: coupon.minOrder ? String(coupon.minOrder) : '',
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : '',
      isActive: coupon.isActive,
    });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) return toast.error('Code is required');
    if (form.type !== 'freeship' && (!form.value || Number(form.value) <= 0))
      return toast.error('Value must be greater than 0');

    setSaving(true);
    const payload = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: form.type === 'freeship' ? 0 : Number(form.value),
      minOrder: Number(form.minOrder) || 0,
      usageLimit: Number(form.usageLimit) || 0,
      expiresAt: form.expiresAt || null,
      isActive: form.isActive,
    };

    try {
      if (editing) {
        await api.put(`/coupons/${editing}`, payload);
        toast.success('Coupon updated');
      } else {
        await api.post('/coupons', payload);
        toast.success('Coupon created');
      }
      closeForm();
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await api.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      toast.success(coupon.isActive ? 'Coupon disabled' : 'Coupon enabled');
      fetchCoupons();
    } catch {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    setDeleting(id);
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const isExpired = (expiresAt) => expiresAt && new Date(expiresAt) < new Date();

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-900">Coupon Codes</h2>
          <p className="text-sm text-gray-500 mt-0.5">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
          <Plus className="w-4 h-4" /> New Coupon
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">Loading...</div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Tag className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No coupons yet</p>
            <p className="text-xs mt-1">Create your first coupon to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Code</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Type</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Discount</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Min Order</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Usage</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Expires</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-lg text-xs tracking-wider">
                        {c.code}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{TYPE_LABELS[c.type]}</td>
                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {c.type === 'freeship' ? '—' : c.type === 'percent' ? `${c.value}%` : formatPKR(c.value)}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {c.minOrder > 0 ? formatPKR(c.minOrder) : '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {c.usedCount}/{c.usageLimit === 0 ? '∞' : c.usageLimit}
                    </td>
                    <td className="px-5 py-4">
                      {c.expiresAt ? (
                        <span className={isExpired(c.expiresAt) ? 'text-red-500 font-medium' : 'text-gray-600'}>
                          {new Date(c.expiresAt).toLocaleDateString()}
                          {isExpired(c.expiresAt) && ' (expired)'}
                        </span>
                      ) : (
                        <span className="text-gray-400">Never</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleToggleActive(c)} className="flex items-center gap-1.5 text-xs font-medium transition-colors">
                        {c.isActive ? (
                          <><ToggleRight className="w-5 h-5 text-green-500" /><span className="text-green-600">Active</span></>
                        ) : (
                          <><ToggleLeft className="w-5 h-5 text-gray-400" /><span className="text-gray-400">Inactive</span></>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c._id, c.code)}
                          disabled={deleting === c._id}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-gray-900 text-lg">
                {editing ? 'Edit Coupon' : 'New Coupon'}
              </h3>
              <button onClick={closeForm} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Code</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. SUMMER20"
                  className="input font-mono uppercase"
                  disabled={!!editing}
                />
              </div>

              <div>
                <label className="label">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm(p => ({ ...p, type: e.target.value }))}
                  className="input"
                >
                  <option value="percent">Percent (%) off subtotal</option>
                  <option value="flat">Flat PKR off subtotal</option>
                  <option value="freeship">Free Shipping</option>
                </select>
              </div>

              {form.type !== 'freeship' && (
                <div>
                  <label className="label">{form.type === 'percent' ? 'Percent (%)' : 'Amount (PKR)'}</label>
                  <input
                    type="number"
                    min="0"
                    value={form.value}
                    onChange={(e) => setForm(p => ({ ...p, value: e.target.value }))}
                    placeholder={form.type === 'percent' ? '10' : '500'}
                    className="input"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Min Order (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minOrder}
                    onChange={(e) => setForm(p => ({ ...p, minOrder: e.target.value }))}
                    placeholder="0 = no minimum"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Usage Limit</label>
                  <input
                    type="number"
                    min="0"
                    value={form.usageLimit}
                    onChange={(e) => setForm(p => ({ ...p, usageLimit: e.target.value }))}
                    placeholder="0 = unlimited"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="label">Expiry Date (optional)</label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                  className="input"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  {form.isActive
                    ? <ToggleRight className="w-6 h-6 text-green-500" />
                    : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  {form.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeForm} className="btn-secondary flex-1 py-2.5">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2 disabled:opacity-40">
                  <Check className="w-4 h-4" />
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
