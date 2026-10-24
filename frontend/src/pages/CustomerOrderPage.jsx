import React, { useState, useEffect } from 'react';
import {
  Printer,
  Sparkles,
  FileText,
  Layers,
  FileCheck,
  Check,
  AlertCircle,
  HelpCircle,
  Phone,
  User,
  Send,
  Loader2,
} from 'lucide-react';
import FileUploader from '../components/FileUploader';
import PriceCalculator from '../components/PriceCalculator';
import { api } from '../api';

export default function CustomerOrderPage({ onOrderSubmitted }) {
  // Shop Config
  const [rates, setRates] = useState({
    rate_bw: 2.0,
    rate_color: 10.0,
    shop_name: 'Smart Xerox',
    shop_tagline: 'Fast Mobile Printing • Epson EcoTank L3250',
    max_file_size_mb: 15,
  });

  // Form State
  const [file, setFile] = useState(null);
  const [printType, setPrintType] = useState('bw'); // 'bw' | 'color'
  const [paperSize, setPaperSize] = useState('A4');
  const [copies, setCopies] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch live shop rates
    api
      .getPublicRates()
      .then((data) => setRates(data))
      .catch((err) => console.warn('Using default rates:', err));
  }, []);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setError('');

    // If PDF, we can default page count to 1 or if filename contains clues
    // For single images, default page count is 1
    if (selectedFile.type.startsWith('image/')) {
      setPageCount(1);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setPageCount(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a document or photo to print.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('print_type', printType);
      formData.append('paper_size', paperSize);
      formData.append('copies', copies.toString());
      formData.append('page_count', pageCount.toString());
      if (customerName.trim()) formData.append('customer_name', customerName.trim());
      if (customerPhone.trim()) formData.append('customer_phone', customerPhone.trim());
      if (notes.trim()) formData.append('notes', notes.trim());

      const orderResult = await api.submitOrder(formData);
      onOrderSubmitted(orderResult);
    } catch (err) {
      setError(err.message || 'Failed to submit print request. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-5 pb-16">
      {/* Hero Banner */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Epson EcoTank L3250 Wi-Fi Express</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Upload & Print
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {rates.shop_tagline || 'Upload your file, pick print options, and collect at counter.'}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-start gap-2.5 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 1: Upload File */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              Select Document or Photo
            </h2>
            <span className="text-xs text-slate-400">PDF / JPG / PNG</span>
          </div>

          <FileUploader
            selectedFile={file}
            onFileSelect={handleFileSelect}
            onClearFile={handleClearFile}
          />
        </div>

        {/* Step 2: Print Mode (B&W or Color) */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              Choose Print Mode
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Black & White */}
            <label
              className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                printType === 'bw'
                  ? 'border-purple-600 bg-purple-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <input
                type="radio"
                name="printType"
                value="bw"
                checked={printType === 'bw'}
                onChange={() => setPrintType('bw')}
                className="sr-only"
              />
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center mb-2 shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-slate-900">Black & White</span>
              <span className="text-xs font-semibold text-purple-700 mt-1">₹{rates.rate_bw}/page</span>
              {printType === 'bw' && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </label>

            {/* Color */}
            <label
              className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                printType === 'color'
                  ? 'border-purple-600 bg-purple-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <input
                type="radio"
                name="printType"
                value="color"
                checked={printType === 'color'}
                onChange={() => setPrintType('color')}
                className="sr-only"
              />
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 text-white flex items-center justify-center mb-2 shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-slate-900">Color Print</span>
              <span className="text-xs font-semibold text-purple-700 mt-1">₹{rates.rate_color}/page</span>
              {printType === 'color' && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Step 3: Paper Size, Pages & Copies */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              Paper Size, Pages & Copies
            </h2>
          </div>

          {/* Paper Size Radio Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Paper Size</label>
            <div className="grid grid-cols-4 gap-2">
              {['A4', 'A5', 'Legal', '4x6 Photo'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setPaperSize(size)}
                  className={`min-h-[44px] py-2 px-1 text-xs font-bold rounded-xl border-2 transition-all ${
                    paperSize === size
                      ? 'border-purple-600 bg-purple-600 text-white shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Steppers: Estimated Pages & Copies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* Pages in document */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <label htmlFor="pages-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Pages in Document
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPageCount(Math.max(1, pageCount - 1))}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-lg hover:bg-slate-100 flex items-center justify-center active:scale-95"
                  aria-label="Decrease pages"
                >
                  −
                </button>
                <input
                  id="pages-input"
                  type="number"
                  min="1"
                  max="500"
                  value={pageCount}
                  onChange={(e) => setPageCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 min-h-[44px] text-center font-bold text-base bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setPageCount(pageCount + 1)}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-lg hover:bg-slate-100 flex items-center justify-center active:scale-95"
                  aria-label="Increase pages"
                >
                  +
                </button>
              </div>
            </div>

            {/* Copies */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <label htmlFor="copies-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Number of Copies
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCopies(Math.max(1, copies - 1))}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-lg hover:bg-slate-100 flex items-center justify-center active:scale-95"
                  aria-label="Decrease copies"
                >
                  −
                </button>
                <input
                  id="copies-input"
                  type="number"
                  min="1"
                  max="100"
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 min-h-[44px] text-center font-bold text-base bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setCopies(copies + 1)}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-lg hover:bg-slate-100 flex items-center justify-center active:scale-95"
                  aria-label="Increase copies"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Optional Customer Details */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
                4
              </span>
              Customer Details (Optional)
            </h2>
            <span className="text-[11px] text-slate-400">Not required</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  autoComplete="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  autoComplete="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Printing Instructions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Only print page 2 and 3, or Double-sided"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Live Estimated Price Card */}
        <PriceCalculator
          printType={printType}
          paperSize={paperSize}
          copies={copies}
          pageCount={pageCount}
          rateBw={rates.rate_bw}
          rateColor={rates.rate_color}
        />

        {/* Large Submit Print Order Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[56px] py-4 px-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 disabled:opacity-60 text-white font-extrabold text-base sm:text-lg tracking-wide rounded-2xl shadow-xl shadow-purple-600/30 flex items-center justify-center gap-3 transition-all active:scale-[0.98] select-none"
        >
          {submitting ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Uploading & Submitting...</span>
            </>
          ) : (
            <>
              <Printer className="w-6 h-6 text-purple-200" />
              <span>SUBMIT PRINT ORDER</span>
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-500 pt-1">
          No online payment needed • Cash payable at the shop counter upon pickup
        </p>
      </form>
    </div>
  );
}
