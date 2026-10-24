import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  AlertCircle,
  FileText,
  RotateCw,
  ArrowLeft,
  XCircle,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { api } from '../api';

export default function TrackOrderPage({ initialOrderId = '', onBack }) {
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialOrderId) {
      handleLookup(initialOrderId);
    }
  }, [initialOrderId]);

  const handleLookup = async (idToSearch) => {
    const cleanId = (idToSearch || orderIdInput).trim();
    if (!cleanId) {
      setError('Please enter your Order ID');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await api.getOrderStatus(cleanId);
      setOrderData(data);
    } catch (err) {
      setError(err.message || `No order found with ID "${cleanId}". Please double-check.`);
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStepProgress = (status) => {
    if (status === 'new') return 1;
    if (status === 'ready') return 2;
    if (status === 'printed') return 3;
    return 0; // cancelled
  };

  const currentStep = orderData ? getStepProgress(orderData.status) : 0;
  const isCancelled = orderData?.status === 'cancelled';

  return (
    <div className="max-w-md mx-auto px-4 py-5 pb-16">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-purple-600 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Printing</span>
      </button>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Track Your Print Order</h1>
        <p className="text-xs text-slate-500 mt-1">
          Enter your Order ID to check live printing progress
        </p>
      </div>

      {/* Search Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLookup();
        }}
        className="mb-6"
      >
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="e.g. SX-8492"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value.toUpperCase())}
              className="w-full pl-10 pr-3 min-h-[48px] text-sm uppercase font-mono font-bold bg-white border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="min-h-[48px] px-5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30 transition-all active:scale-[0.98]"
          >
            {loading ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <span>Track</span>
            )}
          </button>
        </div>
      </form>

      {/* Error alert */}
      {error && (
        <div className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs sm:text-sm flex items-start gap-2 shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Order Status Display */}
      {orderData && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-5 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Order ID
              </span>
              <span className="font-mono text-xl font-black text-slate-900">
                #{orderData.order_id}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={orderData.status} />
              <button
                onClick={() => handleLookup()}
                className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Refresh Status"
              >
                <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Stepper Timeline (if not cancelled) */}
          {!isCancelled ? (
            <div className="py-2">
              <div className="relative flex justify-between">
                {/* Connecting Line */}
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0">
                  <div
                    className="h-full bg-purple-600 transition-all duration-500"
                    style={{
                      width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
                    }}
                  ></div>
                </div>

                {/* Step 1 */}
                <div className="flex flex-col items-center relative z-10 w-20 text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      currentStep >= 1
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-4 ring-purple-100'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    1
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 mt-1.5">Submitted</span>
                  <span className="text-[10px] text-slate-400">In Queue</span>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center relative z-10 w-20 text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      currentStep >= 2
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-4 ring-purple-100'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    2
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 mt-1.5">Printing</span>
                  <span className="text-[10px] text-slate-400">Epson L3250</span>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center relative z-10 w-20 text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      currentStep >= 3
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-4 ring-emerald-100'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    3
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 mt-1.5">Printed</span>
                  <span className="text-[10px] text-slate-400">Ready</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <XCircle className="w-5 h-5 shrink-0" />
              <span>This order has been cancelled. Please speak with the shopkeeper.</span>
            </div>
          )}

          {/* Waiting Message Note */}
          <div className="bg-purple-50 p-3.5 rounded-2xl border border-purple-100 text-xs text-purple-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div className="font-medium leading-relaxed">
              {orderData.estimated_waiting_message}
            </div>
          </div>

          {/* Details list */}
          <div className="text-xs space-y-2 text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div className="flex justify-between">
              <span>File:</span>
              <span className="font-medium text-slate-900 truncate max-w-[180px]">
                {orderData.original_filename}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Mode & Paper:</span>
              <span className="font-medium text-slate-900">
                {orderData.print_type === 'color' ? 'Color' : 'Black & White'} • {orderData.paper_size}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Pages × Copies:</span>
              <span className="font-medium text-slate-900">
                {orderData.page_count} pg × {orderData.copies}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
              <span>Total Payable:</span>
              <span className="text-purple-700 text-sm">₹{orderData.total_price.toFixed(2)} (Cash)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
