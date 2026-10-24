import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Printer, ExternalLink, Check, Copy } from 'lucide-react';
import { getAuthToken } from '../api';

export default function QrCodeModal({ isOpen, onClose, shopName = 'Smart Xerox' }) {
  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const [customUrl, setCustomUrl] = useState(currentHost);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(customUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = () => {
    const token = getAuthToken();
    const downloadUrl = `/api/owner/settings/qr-code?url=${encodeURIComponent(customUrl)}`;
    
    // Create an authenticated download or direct link
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${shopName.replace(/\s+/g, '_')}_QR_Card.png`;
    
    // In case user is logged in as owner, fetch with auth header
    if (token) {
      fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.blob())
      .then(blob => {
        const objectUrl = URL.createObjectURL(blob);
        link.href = objectUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      })
      .catch(() => {
        // Fallback direct click
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    } else {
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Printer className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{shopName} QR Code</h3>
          <p className="text-xs text-slate-500">Scan with phone camera to order printouts</p>
        </div>

        {/* QR Code Graphic Box */}
        <div className="bg-slate-50 border-2 border-purple-200 rounded-2xl p-5 flex flex-col items-center justify-center shadow-inner mb-4">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
            <QRCodeSVG
              value={customUrl}
              size={180}
              level="H"
              includeMargin={false}
            />
          </div>
          <span className="text-[11px] font-semibold text-purple-900 tracking-wider mt-3 uppercase">
            Epson EcoTank L3250 Ready
          </span>
        </div>

        {/* URL Box & Copy */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Website URL Encoded:
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 text-xs bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center text-xs"
              title="Copy Link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Download Printable Card */}
        <button
          onClick={handleDownloadImage}
          className="w-full min-h-[48px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 transition-all active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span>Download Printable Shop Card</span>
        </button>

        <p className="text-[11px] text-center text-slate-400 mt-2.5">
          Tip: Print this card on your Epson L3250 and stick it near the shop counter!
        </p>
      </div>
    </div>
  );
}
