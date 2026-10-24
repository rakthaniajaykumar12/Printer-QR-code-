import React, { useState } from 'react';
import {
  Download,
  Printer,
  CheckCircle,
  XCircle,
  Phone,
  MessageCircle,
  FileText,
  Clock,
  IndianRupee,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { getAuthToken } from '../api';

export default function OrderCard({ order, onStatusChange, onDelete }) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' +
             d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.order_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/owner/orders/${order.order_id}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to download file. It may have expired or been deleted.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = order.original_filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    } finally {
      setDownloading(false);
    }
  };

  const isNew = order.status === 'new';
  const isReady = order.status === 'ready';
  const isPrinted = order.status === 'printed';
  const isCancelled = order.status === 'cancelled';

  // Format phone number for WhatsApp
  const cleanPhone = order.customer_phone ? order.customer_phone.replace(/\D/g, '') : '';
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}` : null;

  return (
    <div
      className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border transition-all ${
        isNew
          ? 'border-purple-300 ring-2 ring-purple-100 shadow-purple-100/50'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Header: Order ID + Status Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-base sm:text-lg font-black tracking-tight text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl">
            #{order.order_id}
          </span>
          <button
            onClick={handleCopyId}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Copy Order ID"
            aria-label="Copy Order ID"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} size="sm" />
        </div>
      </div>

      {/* Body: Customer Details & File Info */}
      <div className="py-3 space-y-2.5">
        {/* Customer Name & Phone */}
        <div className="flex flex-wrap items-center justify-between gap-1 text-sm">
          <div className="font-semibold text-slate-800">
            {order.customer_name ? order.customer_name : <span className="text-slate-400 italic">Walk-in Customer</span>}
          </div>

          {order.customer_phone && (
            <div className="flex items-center gap-1.5">
              <a
                href={`tel:${order.customer_phone}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors"
                title="Call customer"
              >
                <Phone className="w-3 h-3 text-slate-500" />
                <span>{order.customer_phone}</span>
              </a>

              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 p-1.5 rounded-lg transition-colors"
                  title="Chat on WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Uploaded File Row */}
        <div className="flex items-center gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <FileText className="w-4 h-4 text-purple-600 shrink-0" />
          <span className="font-medium text-slate-800 truncate flex-1" title={order.original_filename}>
            {order.original_filename}
          </span>
          <span className="text-slate-400 font-mono shrink-0">
            {formatFileSize(order.file_size_bytes)}
          </span>
        </div>

        {/* Print Configuration Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Mode</span>
            <span
              className={`font-bold ${
                order.print_type === 'color' ? 'text-purple-600 font-extrabold' : 'text-slate-700'
              }`}
            >
              {order.print_type === 'color' ? '🎨 Color' : '⬛ Black & White'}
            </span>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Paper</span>
            <span className="font-bold text-slate-700">{order.paper_size}</span>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Pages × Copies</span>
            <span className="font-bold text-slate-700">
              {order.page_count} pg × {order.copies} {order.copies > 1 ? 'copies' : 'copy'}
            </span>
          </div>

          <div className="bg-purple-50 p-2 rounded-xl text-center border border-purple-100">
            <span className="text-purple-600 block text-[10px] uppercase font-semibold">Cash Total</span>
            <span className="font-extrabold text-sm text-purple-900">₹{order.total_price.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes from customer */}
        {order.notes && (
          <div className="text-xs bg-amber-50 text-amber-900 p-2.5 rounded-xl border border-amber-200">
            <span className="font-semibold">Customer Note:</span> {order.notes}
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(order.created_at)}
          </span>
          {order.is_file_deleted && (
            <span className="text-rose-500 font-medium">File expired & deleted</span>
          )}
        </div>
      </div>

      {/* Action Footer for Android Owner Screen */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
        {/* Download File Button */}
        <button
          onClick={handleDownload}
          disabled={downloading || order.is_file_deleted}
          className="flex-1 min-h-[44px] bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Downloading...' : 'Download File'}</span>
        </button>

        {/* Mark Ready */}
        {isNew && (
          <button
            onClick={() => onStatusChange(order.order_id, 'ready')}
            className="min-h-[44px] px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
            title="Mark as Ready to Print"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Ready to Print</span>
          </button>
        )}

        {/* Mark as Printed */}
        {!isPrinted && !isCancelled && (
          <button
            onClick={() => onStatusChange(order.order_id, 'printed')}
            className="flex-1 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/30 transition-all active:scale-[0.98]"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark as Printed</span>
          </button>
        )}

        {/* Cancel Order */}
        {!isPrinted && !isCancelled && (
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to cancel order #${order.order_id}?`)) {
                onStatusChange(order.order_id, 'cancelled');
              }
            }}
            className="min-h-[44px] px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-semibold text-xs rounded-xl flex items-center justify-center transition-colors"
            title="Cancel Order"
          >
            <XCircle className="w-4 h-4" />
            <span className="sr-only">Cancel</span>
          </button>
        )}

        {/* Delete (for completed/cancelled orders to tidy dashboard) */}
        {(isPrinted || isCancelled) && (
          <button
            onClick={() => {
              if (window.confirm(`Delete order #${order.order_id} record permanently?`)) {
                onDelete(order.order_id);
              }
            }}
            className="min-h-[44px] px-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl flex items-center justify-center transition-colors"
            title="Delete Record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
