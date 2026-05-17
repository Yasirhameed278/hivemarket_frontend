import React, { useEffect, useState } from 'react';
import { Store, CheckCircle, XCircle, Clock, Search, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import { formatPKR } from '../../utils/currency';

const STATUS_STYLES = {
  pending:   'bg-yellow-100 text-yellow-700',
  approved:  'bg-green-100 text-green-700',
  suspended: 'bg-red-100 text-red-700',
};

const STATUS_ICON = {
  pending:   Clock,
  approved:  CheckCircle,
  suspended: XCircle,
};

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/vendors');
      setVendors(data.vendors || data);
    } catch { toast.error('Failed to load vendors'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVendors(); }, []);

  const handleStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.put(`/admin/vendors/${id}/status`, { status });
      toast.success(`Vendor ${status}`);
      setVendors(vs => vs.map(v => v._id === id ? { ...v, status } : v));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setUpdating(null); }
  };

  const handleCommission = async (id, rate) => {
    const parsed = parseFloat(rate);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) return toast.error('Enter a valid rate 0–100');
    setUpdating(id);
    try {
      await api.put(`/admin/vendors/${id}/status`, { commissionRate: parsed });
      toast.success('Commission rate updated');
      setVendors(vs => vs.map(v => v._id === id ? { ...v, commissionRate: parsed } : v));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setUpdating(null); }
  };

  const filtered = vendors.filter(v => {
    const matchSearch = v.storeName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pending   = vendors.filter(v => v.status === 'pending').length;
  const approved  = vendors.filter(v => v.status === 'approved').length;
  const suspended = vendors.filter(v => v.status === 'suspended').length;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-display font-bold text-gray-900">Vendors</h2>
        <p className="text-sm text-gray-400 mt-0.5">Manage marketplace sellers</p>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'All', value: 'all', count: vendors.length, color: 'bg-gray-100 text-gray-700' },
          { label: 'Pending', value: 'pending', count: pending, color: 'bg-yellow-100 text-yellow-700' },
          { label: 'Approved', value: 'approved', count: approved, color: 'bg-green-100 text-green-700' },
          { label: 'Suspended', value: 'suspended', count: suspended, color: 'bg-red-100 text-red-700' },
        ].map(({ label, value, count, color }) => (
          <button key={value} onClick={() => setStatusFilter(value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              statusFilter === value ? color + ' ring-2 ring-current/30' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}>
            {label} <span className="ml-1 opacity-70">{count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search store names..." className="input pl-9 text-sm" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Store className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No vendors found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Store</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Commission %</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Earnings</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Sales</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(v => {
                  const Icon = STATUS_ICON[v.status] || Clock;
                  return (
                    <tr key={v._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {v.logo ? (
                            <img src={v.logo} alt={v.storeName} className="w-9 h-9 rounded-xl object-cover bg-gray-100 shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-orange-400 flex items-center justify-center shrink-0">
                              <Store className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{v.storeName}</p>
                            <p className="text-xs text-gray-400 truncate">{v.ownerEmail || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[v.status] || 'bg-gray-100 text-gray-600'}`}>
                          <Icon className="w-3 h-3" />
                          {v.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <CommissionInput
                          value={v.commissionRate ?? 10}
                          disabled={updating === v._id}
                          onSave={(rate) => handleCommission(v._id, rate)}
                        />
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-900">
                        {formatPKR(v.totalEarnings || 0)}
                      </td>
                      <td className="px-5 py-4 text-gray-500">{v.totalSales || 0}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 justify-end">
                          {v.status !== 'approved' && (
                            <button
                              onClick={() => handleStatus(v._id, 'approved')}
                              disabled={updating === v._id}
                              className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors disabled:opacity-40">
                              Approve
                            </button>
                          )}
                          {v.status !== 'suspended' && (
                            <button
                              onClick={() => handleStatus(v._id, 'suspended')}
                              disabled={updating === v._id}
                              className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-40">
                              Suspend
                            </button>
                          )}
                          {v.status !== 'pending' && (
                            <button
                              onClick={() => handleStatus(v._id, 'pending')}
                              disabled={updating === v._id}
                              className="px-3 py-1.5 text-xs font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg transition-colors disabled:opacity-40">
                              Reset
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function CommissionInput({ value, disabled, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const commit = () => {
    setEditing(false);
    if (parseFloat(draft) !== value) onSave(draft);
  };

  if (editing) {
    return (
      <input
        autoFocus
        type="number" min="0" max="100" step="0.5"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
        className="w-20 px-2 py-1 border border-brand-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
      />
    );
  }

  return (
    <button onClick={() => { setDraft(String(value)); setEditing(true); }} disabled={disabled}
      className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors disabled:opacity-40">
      {value}%
      <ChevronDown className="w-3 h-3 opacity-50" />
    </button>
  );
}
