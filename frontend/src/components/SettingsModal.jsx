import React, { useState, useEffect } from 'react';
import { X, Settings as SettingsIcon, Save, KeyRound, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../api';

export default function SettingsModal({ isOpen, onClose, onSettingsUpdated }) {
  const [activeTab, setActiveTab] = useState('pricing'); // 'pricing' | 'password' | 'retention'
  const [rates, setRates] = useState({
    shop_name: 'Smart Xerox',
    shop_tagline: 'Fast Mobile Printing',
    rate_bw: 2.0,
    rate_color: 10.0,
    file_retention_hours: 24,
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    try {
      const data = await api.getSettings();
      setRates(data);
    } catch (err) {
      setErrorMsg('Failed to load settings');
    }
  };

  if (!isOpen) return null;

  const handleSaveRates = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.updateSettings({
        shop_name: rates.shop_name,
        shop_tagline: rates.shop_tagline,
        rate_bw: parseFloat(rates.rate_bw),
        rate_color: parseFloat(rates.rate_color),
        file_retention_hours: parseInt(rates.file_retention_hours),
      });
      setSuccessMsg('Shop settings updated successfully!');
      if (onSettingsUpdated) onSettingsUpdated();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Error updating settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setErrorMsg('New passwords do not match');
      return;
    }
    if (passwordForm.new_password.length < 6) {
      setErrorMsg('New password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.changePassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      });
      setSuccessMsg('Password changed successfully!');
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupNow = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.triggerCleanup();
      setSuccessMsg(res.message || 'Old customer files cleaned up!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Error cleaning files');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Owner Settings</h3>
            <p className="text-xs text-slate-500">Configure rates, passwords & shop info</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
          <button
            onClick={() => {
              setActiveTab('pricing');
              setErrorMsg('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'pricing' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Prices & Shop
          </button>
          <button
            onClick={() => {
              setActiveTab('password');
              setErrorMsg('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'password' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => {
              setActiveTab('retention');
              setErrorMsg('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'retention' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            File Retention
          </button>
        </div>

        {/* Alert Messages */}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab 1: Pricing & Shop */}
        {activeTab === 'pricing' && (
          <form onSubmit={handleSaveRates} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shop Display Name
              </label>
              <input
                type="text"
                required
                value={rates.shop_name}
                onChange={(e) => setRates({ ...rates, shop_name: e.target.value })}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tagline / Subtitle
              </label>
              <input
                type="text"
                value={rates.shop_tagline}
                onChange={(e) => setRates({ ...rates, shop_tagline: e.target.value })}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  B&W Rate (₹/page)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">₹</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={rates.rate_bw}
                    onChange={(e) => setRates({ ...rates, rate_bw: e.target.value })}
                    className="w-full pl-7 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Color Rate (₹/page)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">₹</span>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={rates.rate_color}
                    onChange={(e) => setRates({ ...rates, rate_color: e.target.value })}
                    className="w-full pl-7 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] mt-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 transition-all active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Pricing & Settings'}</span>
            </button>
          </form>
        )}

        {/* Tab 2: Password */}
        {activeTab === 'password' && (
          <form onSubmit={handleUpdatePassword} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={passwordForm.old_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password (min 6 chars)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Updating...' : 'Update Password'}</span>
            </button>
          </form>
        )}

        {/* Tab 3: File Retention */}
        {activeTab === 'retention' && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
              Customer privacy protection: Files are stored privately and automatically deleted after the configured retention period.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Auto-Delete Files After (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={rates.file_retention_hours}
                onChange={(e) => setRates({ ...rates, file_retention_hours: e.target.value })}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">Recommended: 24 hours (1 day)</p>
            </div>

            <button
              type="button"
              onClick={handleSaveRates}
              className="w-full min-h-[44px] bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Retention Setting</span>
            </button>

            <div className="pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={handleCleanupNow}
                disabled={loading}
                className="w-full min-h-[44px] bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Trigger Expired Files Cleanup Now</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
