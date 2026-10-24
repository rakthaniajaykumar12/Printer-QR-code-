import React from 'react';
import { Printer, Search, ShieldCheck, LogOut, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ currentView, setView, onOpenQr, shopName = 'Smart Xerox' }) {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#0b132b] text-white shadow-md border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo & Shop Title */}
        <button
          onClick={() => setView('order')}
          className="flex items-center gap-2.5 text-left focus:outline-none group py-2"
          aria-label="Go to Print Order page"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-md shadow-purple-900/50 group-hover:scale-105 transition-transform">
            <Printer className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              {shopName}
              <span className="hidden xs:inline-block px-1.5 py-0.2 text-[10px] bg-purple-500/30 text-purple-200 border border-purple-400/30 rounded font-normal">
                L3250
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">QR Express Printing</p>
          </div>
        </button>

        {/* Navigation Action Buttons */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          {/* Track Order */}
          <button
            onClick={() => setView('track')}
            className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${
              currentView === 'track'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Search className="w-4 h-4 text-purple-300" />
            <span className="hidden sm:inline">Track</span> Status
          </button>

          {/* QR Code Quick View button */}
          {onOpenQr && (
            <button
              onClick={onOpenQr}
              title="Show Shop QR Code"
              className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center justify-center transition-colors"
              aria-label="Shop QR Code"
            >
              <QrCode className="w-5 h-5 text-purple-300" />
            </button>
          )}

          {/* Owner Dashboard / Login */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setView('dashboard')}
                className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'bg-purple-950/60 text-purple-200 border border-purple-800/50 hover:bg-purple-900/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  setView('order');
                }}
                title="Logout"
                className="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-xl flex items-center justify-center transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setView('login')}
              className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${
                currentView === 'login'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Owner</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
