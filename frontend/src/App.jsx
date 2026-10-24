import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import QrCodeModal from './components/QrCodeModal';
import CustomerOrderPage from './pages/CustomerOrderPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import TrackOrderPage from './pages/TrackOrderPage';
import OwnerLoginPage from './pages/OwnerLoginPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [currentView, setCurrentView] = useState('order'); // 'order' | 'success' | 'track' | 'login' | 'dashboard'
  const [recentOrder, setRecentOrder] = useState(null);
  const [trackOrderId, setTrackOrderId] = useState('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // If user navigated to dashboard but not authenticated, show login
  const renderCurrentView = () => {
    switch (currentView) {
      case 'order':
        return (
          <CustomerOrderPage
            onOrderSubmitted={(order) => {
              setRecentOrder(order);
              setCurrentView('success');
            }}
          />
        );

      case 'success':
        return (
          <OrderSuccessPage
            order={recentOrder}
            onTrackOrder={(orderId) => {
              setTrackOrderId(orderId);
              setCurrentView('track');
            }}
            onNewOrder={() => {
              setRecentOrder(null);
              setCurrentView('order');
            }}
          />
        );

      case 'track':
        return (
          <TrackOrderPage
            initialOrderId={trackOrderId}
            onBack={() => setCurrentView('order')}
          />
        );

      case 'login':
        return (
          <OwnerLoginPage
            onLoginSuccess={() => setCurrentView('dashboard')}
            onBack={() => setCurrentView('order')}
          />
        );

      case 'dashboard':
        if (!isAuthenticated && !loading) {
          return (
            <OwnerLoginPage
              onLoginSuccess={() => setCurrentView('dashboard')}
              onBack={() => setCurrentView('order')}
            />
          );
        }
        return <OwnerDashboardPage />;

      default:
        return (
          <CustomerOrderPage
            onOrderSubmitted={(order) => {
              setRecentOrder(order);
              setCurrentView('success');
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Sticky Mobile Navbar */}
      <Navbar
        currentView={currentView}
        setView={setCurrentView}
        onOpenQr={() => setIsQrModalOpen(true)}
        shopName="Smart Xerox"
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">{renderCurrentView()}</main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-4 text-center text-xs border-t border-slate-800">
        <div className="max-w-md mx-auto space-y-1">
          <p className="font-semibold text-slate-300">Smart Xerox Express Printing</p>
          <p className="text-[11px] text-slate-500">
            Powered by Epson EcoTank L3250 Wi-Fi • No online payments • Cash on pickup
          </p>
        </div>
      </footer>

      {/* Global Shop QR Modal */}
      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        shopName="Smart Xerox"
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
