import React, { useState, useEffect, useRef } from 'react';
import {
  Printer,
  RotateCw,
  Search,
  Filter,
  IndianRupee,
  Calendar,
  Layers,
  Settings as SettingsIcon,
  QrCode,
  Bell,
  Sparkles,
  Info,
  ChevronDown,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import OrderCard from '../components/OrderCard';
import SettingsModal from '../components/SettingsModal';
import QrCodeModal from '../components/QrCodeModal';
import { api } from '../api';

// Web Audio API soft chime for new order arrival notification
function playNewOrderChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Arpeggio chime notes
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Audio context may require user interaction first
  }
}

export default function OwnerDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    today_orders_count: 0,
    today_cash_sales: 0,
    pending_orders_count: 0,
    ready_orders_count: 0,
    printed_orders_count: 0,
    cancelled_orders_count: 0,
    total_orders_all_time: 0,
  });

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'new' | 'ready' | 'printed' | 'cancelled'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWorkflowHelp, setShowWorkflowHelp] = useState(false);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  // New order banner alert
  const [newOrderNotice, setNewOrderNotice] = useState(null);
  const lastOrderCountRef = useRef(null);

  useEffect(() => {
    fetchOrdersAndStats(true);

    // Auto-poll every 12 seconds for live orders
    const interval = setInterval(() => {
      fetchOrdersAndStats(false);
    }, 12000);

    return () => clearInterval(interval);
  }, [activeTab, searchQuery]);

  const fetchOrdersAndStats = async (showLoadingState = false) => {
    if (showLoadingState) setLoading(true);
    try {
      const [ordersData, statsData] = await Promise.all([
        api.getOrders({
          status: activeTab,
          search: searchQuery.trim(),
        }),
        api.getStats(),
      ]);

      // Detect if brand new orders arrived compared to last poll
      if (
        lastOrderCountRef.current !== null &&
        statsData.pending_orders_count > lastOrderCountRef.current
      ) {
        playNewOrderChime();
        setNewOrderNotice(`New print order received! (${statsData.pending_orders_count} pending)`);
        setTimeout(() => setNewOrderNotice(null), 5000);
      }
      lastOrderCountRef.current = statsData.pending_orders_count;

      setOrders(ordersData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      if (showLoadingState) setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      fetchOrdersAndStats(false);
    } catch (err) {
      alert(err.message || 'Error updating order status');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await api.deleteOrder(orderId);
      fetchOrdersAndStats(false);
    } catch (err) {
      alert(err.message || 'Error deleting order');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 pb-20">
      {/* Top Banner Notice for New Order Arrival */}
      {newOrderNotice && (
        <div className="mb-4 p-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 animate-bounce text-purple-200" />
            <span>{newOrderNotice}</span>
          </div>
          <button
            onClick={() => setActiveTab('new')}
            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold"
          >
            View Queue
          </button>
        </div>
      )}

      {/* Owner Header & Actions */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Print Queue
            </h1>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Epson EcoTank L3250 Wi-Fi Shop</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Shop QR Button */}
          <button
            onClick={() => setIsQrOpen(true)}
            className="min-h-[42px] px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Display / Download Shop QR"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">Shop QR</span>
          </button>

          {/* Pricing Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="min-h-[42px] p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center transition-colors"
            title="Settings & Pricing"
            aria-label="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => fetchOrdersAndStats(true)}
            disabled={loading}
            className="min-h-[42px] px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            title="Refresh Order List"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards (Designed for Android Phone View) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-5">
        {/* Today's Orders */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Today Orders
          </p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
            {stats.today_orders_count}
          </p>
          <span className="text-[10px] text-slate-400">Total: {stats.total_orders_all_time}</span>
        </div>

        {/* Estimated Cash */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Today Cash
          </p>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">
            ₹{stats.today_cash_sales.toFixed(0)}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Counter sales</span>
        </div>

        {/* New / Pending Orders in Queue */}
        <div
          onClick={() => setActiveTab('new')}
          className={`p-3.5 sm:p-4 rounded-2xl border cursor-pointer text-center transition-all ${
            stats.pending_orders_count > 0
              ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-100'
              : 'bg-white border-slate-200'
          }`}
        >
          <p className="text-[10px] sm:text-xs font-semibold text-purple-700 uppercase tracking-wider">
            New In Queue
          </p>
          <p className="text-xl sm:text-2xl font-black text-purple-900 mt-0.5">
            {stats.pending_orders_count}
          </p>
          <span className="text-[10px] text-purple-600 font-medium">Ready: {stats.ready_orders_count}</span>
        </div>
      </div>

      {/* Collapsible Manual Printing Workflow Helper Banner */}
      <div className="mb-5 bg-gradient-to-r from-slate-900 to-[#1c2541] text-white rounded-2xl p-4 shadow-md border border-slate-800">
        <div
          onClick={() => setShowWorkflowHelp(!showWorkflowHelp)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-200">
            <Printer className="w-4 h-4 text-purple-400" />
            <span>Android + Epson L3250 Printing Workflow</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${
              showWorkflowHelp ? 'rotate-180' : ''
            }`}
          />
        </div>

        {showWorkflowHelp && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300 space-y-2 leading-relaxed animate-in fade-in duration-200">
            <p className="text-slate-400">
              When a customer submits a print job:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 pl-1">
              <li>Tap <strong className="text-white">Download File</strong> on the order card.</li>
              <li>Open downloaded file in <strong className="text-purple-300">Epson Smart Panel</strong> or <strong className="text-purple-300">Epson iPrint</strong> app on this phone.</li>
              <li>Select your <strong className="text-white">Epson EcoTank L3250</strong> over the shop Wi-Fi / Jio AirFiber.</li>
              <li>Verify Paper size (A4), Color mode, & Copies, then tap <strong className="text-white">Print</strong>.</li>
              <li>Return to this dashboard and tap <strong className="text-emerald-400">Mark as Printed</strong>, then collect cash at counter!</li>
            </ol>
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search Order ID (e.g. SX-8492), customer name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 min-h-[46px] text-xs sm:text-sm bg-white border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none text-xs">
        {[
          { key: 'all', label: 'All Orders', count: stats.total_orders_all_time },
          { key: 'new', label: 'New', count: stats.pending_orders_count, highlight: stats.pending_orders_count > 0 },
          { key: 'ready', label: 'Ready', count: stats.ready_orders_count },
          { key: 'printed', label: 'Printed', count: stats.printed_orders_count },
          { key: 'cancelled', label: 'Cancelled', count: stats.cancelled_orders_count },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === tab.key
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : tab.highlight
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3.5">
        {loading && orders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <RotateCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
            <span>Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
            <Printer className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No orders found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery
                ? 'No orders match your search query.'
                : activeTab === 'new'
                ? 'Great job! The new order queue is clear.'
                : 'Customer orders submitted through the QR portal will appear here.'}
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.order_id}
              order={order}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteOrder}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsUpdated={() => fetchOrdersAndStats(false)}
      />

      <QrCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
      />
    </div>
  );
}
