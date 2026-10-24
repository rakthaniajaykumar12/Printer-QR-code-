import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Copy,
  Check,
  Printer,
  Clock,
  IndianRupee,
  Search,
  PlusCircle,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function OrderSuccessPage({ order, onTrackOrder, onNewOrder }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignored if canvas-confetti unsupported
    }
  }, []);

  const handleCopy = () => {
    if (order?.order_id) {
      navigator.clipboard.writeText(order.order_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <p className="text-slate-500 mb-4">No order details found.</p>
        <button
          onClick={onNewOrder}
          className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold"
        >
          Submit a Print Order
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-16 animate-in fade-in zoom-in-95 duration-300">
      {/* Success Badge */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/20">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Print Order Submitted!
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Your file has been sent directly to the shop's print queue.
        </p>
      </div>

      {/* Prominent Order ID Card */}
      <div className="bg-gradient-to-br from-[#0b132b] to-[#1c2541] text-white rounded-3xl p-6 shadow-xl border border-slate-800 text-center mb-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl"></div>

        <p className="text-xs uppercase tracking-widest text-purple-300 font-semibold mb-1">
          Your Order ID
        </p>

        <div className="flex items-center justify-center gap-2 my-2">
          <span className="font-mono text-3xl sm:text-4xl font-black tracking-wider text-white">
            {order.order_id}
          </span>
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-purple-300 transition-colors"
            title="Copy Order ID"
            aria-label="Copy Order ID"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        <p className="text-xs text-slate-300">
          {copied ? 'Copied to clipboard!' : 'Show this ID at the shop counter'}
        </p>

        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">Total Payable:</span>
          <span className="text-lg font-extrabold text-purple-300">
            ₹{order.total_price.toFixed(2)} (Cash)
          </span>
        </div>
      </div>

      {/* Pickup Steps */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 mb-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-600" />
          Next Steps at the Shop
        </h3>

        <ol className="space-y-2.5 text-xs sm:text-sm text-slate-700">
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <span>Tell the shopkeeper your Order ID: <strong className="font-mono text-slate-900">#{order.order_id}</strong>.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <span>The shopkeeper prints your document using the Epson EcoTank L3250.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <span>Collect your crisp printouts and pay <strong className="text-slate-900">₹{order.total_price.toFixed(2)}</strong> in cash.</span>
          </li>
        </ol>
      </div>

      {/* Order Summary Details */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 mb-6 text-xs sm:text-sm space-y-2 text-slate-600">
        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
          Order Summary
        </h4>
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span>File Name:</span>
          <span className="font-medium text-slate-900 truncate max-w-[180px]">{order.original_filename}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span>Print Mode:</span>
          <span className="font-medium text-slate-900">{order.print_type === 'color' ? 'Color' : 'Black & White'}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span>Paper Size:</span>
          <span className="font-medium text-slate-900">{order.paper_size}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span>Pages × Copies:</span>
          <span className="font-medium text-slate-900">{order.page_count} pg × {order.copies}</span>
        </div>
        {order.customer_name && (
          <div className="flex justify-between py-1">
            <span>Customer:</span>
            <span className="font-medium text-slate-900">{order.customer_name}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => onTrackOrder(order.order_id)}
          className="w-full min-h-[50px] bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 transition-all active:scale-[0.98]"
        >
          <Search className="w-4 h-4" />
          <span>Track Order Status</span>
        </button>

        <button
          onClick={onNewOrder}
          className="w-full min-h-[50px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4 text-slate-500" />
          <span>Print Another Document</span>
        </button>
      </div>
    </div>
  );
}
