import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Loader2,
  KeyRound,
  Palette,
  PawPrint,
  Heart,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../api';

export default function OwnerLoginPage({ onLoginSuccess, onBack }) {
  const { login } = useAuth();

  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [favoriteColor, setFavoriteColor] = useState('');
  const [favoriteAnimal, setFavoriteAnimal] = useState('');
  const [favoritePerson, setFavoritePerson] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const clearMessages = () => {
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!username.trim() || !password) {
      setError('Please enter your username and password.');
      return;
    }

    setLoading(true);

    try {
      await login(username.trim(), password);
      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    clearMessages();

    if (
      !username.trim() ||
      !favoriteColor.trim() ||
      !favoriteAnimal.trim() ||
      !favoritePerson.trim() ||
      !newPassword
    ) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Your new password must contain at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('The new passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          favorite_color: favoriteColor.trim(),
          favorite_animal: favoriteAnimal.trim(),
          favorite_person: favoritePerson.trim(),
          new_password: newPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || 'Password reset failed. Check your answers.'
        );
      }

      setMessage('Password reset successfully! You can now log in.');
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFavoriteColor('');
      setFavoriteAnimal('');
      setFavoritePerson('');
      setMode('login');
    } catch (err) {
      setError(err.message || 'Unable to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full min-h-[48px] px-3 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500';

  const labelClass =
    'block text-xs font-semibold text-slate-700 mb-1.5';

  return (
    <div className="max-w-sm mx-auto px-4 py-8 pb-16 animate-in fade-in duration-200">
      <button
        type="button"
        onClick={mode === 'login' ? onBack : () => {
          setMode('login');
          clearMessages();
        }}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-purple-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>
          {mode === 'login' ? 'Back to Customer Portal' : 'Back to Login'}
        </span>
      </button>

      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-[#0b132b] to-[#1c2541] text-purple-400 flex items-center justify-center shadow-lg border border-slate-800">
          {mode === 'login' ? (
            <ShieldCheck className="w-8 h-8 text-purple-400" />
          ) : (
            <KeyRound className="w-8 h-8 text-purple-400" />
          )}
        </div>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {mode === 'login' ? 'Owner Login' : 'Forgot Password'}
        </h1>

        <p className="text-xs text-slate-500 mt-1">
          {mode === 'login'
            ? 'Access the Epson L3250 Print Queue Dashboard'
            : 'Verify your security answers to reset your password'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs sm:text-sm flex items-start gap-2 shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-xs sm:text-sm flex items-start gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      {mode === 'login' ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4"
        >
          <div>
            <label className={labelClass}>Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`${inputClass} pl-10 pr-3`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pl-10 pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={() => {
                setMode('forgot');
                clearMessages();
              }}
              className="text-xs font-semibold text-purple-600 hover:text-purple-800"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[50px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Open Dashboard</span>
            )}
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleForgotPassword}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4"
        >
          <div>
            <label className={labelClass}>Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>What is your favorite color?</label>
            <div className="relative">
              <Palette className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={favoriteColor}
                onChange={(e) => setFavoriteColor(e.target.value)}
                placeholder="Your favorite color"
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>What is your favorite animal?</label>
            <div className="relative">
              <PawPrint className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={favoriteAnimal}
                onChange={(e) => setFavoriteAnimal(e.target.value)}
                placeholder="Your favorite animal"
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Who is your favorite person?</label>
            <div className="relative">
              <Heart className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={favoritePerson}
                onChange={(e) => setFavoritePerson(e.target.value)}
                placeholder="Your favorite person"
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>New Password</label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Confirm New Password</label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[50px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Resetting Password...</span>
              </>
            ) : (
              <span>Reset Password</span>
            )}
          </button>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Password recovery works only after security answers have been
            registered for your owner account.
          </p>
        </form>
      )}
    </div>
  );
}
