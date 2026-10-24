import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, X, AlertCircle, Check } from 'lucide-react';

const MAX_MB = 15;
const MAX_BYTES = MAX_MB * 1024 * 1024;
const ALLOWED_EXTS = ['pdf', 'jpg', 'jpeg', 'png'];

export default function FileUploader({ selectedFile, onFileSelect, onClearFile }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileProcess = (file) => {
    setError('');

    if (!file) return;

    // Check file extension
    const ext = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      setError(`Invalid file type (.${ext}). Only PDF, JPG, JPEG, and PNG files are accepted.`);
      return;
    }

    // Check size limit (15 MB)
    if (file.size > MAX_BYTES) {
      setError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum limit is ${MAX_MB} MB.`);
      return;
    }

    if (file.size === 0) {
      setError('The selected file appears to be empty.');
      return;
    }

    // Set preview if image
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    onFileSelect(file);
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClearFile();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        id="print-file-upload"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        onChange={handleChange}
        className="hidden"
      />

      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 select-none ${
            dragActive
              ? 'border-purple-600 bg-purple-50/70 scale-[0.99]'
              : 'border-slate-300 hover:border-purple-400 bg-white hover:bg-slate-50/80 shadow-sm'
          }`}
        >
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600 shadow-inner">
            <UploadCloud className="w-7 h-7 animate-bounce" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
            Tap to Choose Document or Photo
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-3">
            Supports <span className="font-semibold text-purple-700">PDF, JPG, JPEG, PNG</span>
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
            <span>Maximum size: 15 MB</span>
          </div>
        </div>
      ) : (
        <div className="bg-white border-2 border-purple-200 rounded-2xl p-4 sm:p-5 shadow-sm relative">
          <div className="flex items-start gap-3.5">
            {/* File Icon / Image Thumbnail */}
            {previewUrl ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
                <FileText className="w-7 h-7" />
              </div>
            )}

            {/* File Info */}
            <div className="flex-1 min-w-0 pr-8">
              <div className="flex items-center gap-1.5 text-xs text-purple-700 font-semibold uppercase tracking-wider mb-0.5">
                <Check className="w-3.5 h-3.5" />
                <span>File Ready</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-800 truncate" title={selectedFile.name}>
                {selectedFile.name}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatFileSize(selectedFile.size)} • {selectedFile.name.split('.').pop().toUpperCase()}
              </p>
            </div>

            {/* Remove File Button */}
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors"
              title="Change file"
              aria-label="Remove selected file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2.5 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs sm:text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
