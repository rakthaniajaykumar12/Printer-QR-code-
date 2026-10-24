import React from 'react';
import { IndianRupee, Calculator, Info } from 'lucide-react';

export default function PriceCalculator({
  printType,
  paperSize,
  copies,
  pageCount,
  rateBw,
  rateColor,
}) {
  const currentRate = printType === 'color' ? rateColor : rateBw;
  const totalPrice = (Math.max(1, pageCount) * Math.max(1, copies) * currentRate).toFixed(2);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-[#1c2541] text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-purple-400" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-slate-300 uppercase">
            Estimated Price
          </span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
          Cash on Pickup
        </span>
      </div>

      {/* Breakdown Math */}
      <div className="grid grid-cols-3 gap-2 text-center py-2 bg-slate-800/40 rounded-xl mb-3 border border-slate-700/50">
        <div>
          <p className="text-[11px] text-slate-400 uppercase tracking-wider">Pages</p>
          <p className="text-base sm:text-lg font-bold text-white">{pageCount}</p>
        </div>
        <div className="border-x border-slate-700/60">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider">Copies</p>
          <p className="text-base sm:text-lg font-bold text-white">{copies}</p>
        </div>
        <div>
          <p className="text-[11px] text-slate-400 uppercase tracking-wider">Rate</p>
          <p className="text-base sm:text-lg font-bold text-purple-300">₹{currentRate}</p>
        </div>
      </div>

      {/* Total Amount */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-xs text-slate-400">Total Payable</p>
          <p className="text-[11px] text-slate-400">
            {printType === 'color' ? 'Color' : 'B&W'} • {paperSize}
          </p>
        </div>
        <div className="flex items-baseline gap-0.5 text-2xl sm:text-3xl font-extrabold text-white">
          <span className="text-purple-400 text-lg sm:text-xl font-medium">₹</span>
          <span>{totalPrice}</span>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-1.5 text-[11px] text-slate-400 bg-slate-800/60 p-2 rounded-lg">
        <Info className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
        <span>
          Page count will be verified by shopkeeper before printing. Pay in cash at the counter.
        </span>
      </div>
    </div>
  );
}
