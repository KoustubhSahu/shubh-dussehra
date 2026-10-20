import React, { useState } from 'react';
import { Sparkles, RotateCcw, Copy, Check, Flame, Award } from 'lucide-react';
import { RAVANA_HEADS } from './RavanaEffigy.tsx';

interface CelebrationCardProps {
  onRebuild: () => void;
}

export const CelebrationCard: React.FC<CelebrationCardProps> = ({ onRebuild }) => {
  const [copied, setCopied] = useState(false);
  const [showVices, setShowVices] = useState(false);

  const greetingText = `✨ Shubh Dussehra! ✨\nOn this auspicious day of Vijayadashami, may the effigy of all negativity, ego, and obstacles burn away in the sacred fire. Wishing you and your loved ones victory, joy, wisdom, and endless prosperity! 🪔🏹`;

  const handleCopy = () => {
    navigator.clipboard.writeText(greetingText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto z-30 p-6 sm:p-8 rounded-2xl bg-slate-900/95 border border-amber-500/40 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-500">
      {/* Decorative top header glow */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Festive Emblem */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/30">
          <Award className="w-7 h-7" />
        </div>
      </div>

      {/* Main Celebratory Titles */}
      <div className="text-center space-y-2 mb-6">
        <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
          बुराई पर अच्छाई की विजय · Truth Always Triumphs
        </p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-orange-400 font-serif">
          Shubh Dussehra!
        </h2>
        <p className="text-base sm:text-lg text-amber-100 font-medium max-w-lg mx-auto">
          The 10-headed effigy of Ravana has been fully consumed in the sacred fire.
        </p>
      </div>

      {/* Symbolic Significance Card */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-500/20 text-sm text-slate-300 leading-relaxed mb-6">
        <p className="text-amber-200 font-medium mb-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          The Meaning of Vijayadashami
        </p>
        <p>
          Just as Lord Rama vanquished Ravana with the celestial arrow, today signifies conquering our inner demons. May all darkness, anger, and ego turn to ashes, making way for righteous path, joy, and spiritual light.
        </p>
      </div>

      {/* Interactive 10 Vices Breakdown Toggle */}
      <div className="mb-6">
        <button
          onClick={() => setShowVices(!showVices)}
          className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1.5 transition-colors"
        >
          <Flame className="w-3.5 h-3.5" />
          {showVices ? 'Hide 10 Vices of Ravana' : 'View the 10 Vices Conquered Today'}
        </button>

        {showVices && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 pt-3 border-t border-slate-800 animate-in fade-in duration-300">
            {RAVANA_HEADS.map((head) => (
              <div
                key={head.id}
                className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-center"
              >
                <span className="block text-[11px] text-amber-400 font-bold">{head.name}</span>
                <span className="block text-[10px] text-slate-400">{head.hindiName}</span>
                <span className="block text-[10px] text-slate-300 mt-0.5">{head.meaning}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons: Rebuild / Play Again & Copy Blessing */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onRebuild}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-sm hover:from-amber-400 hover:to-orange-400 transition-all shadow-md active:scale-95 whitespace-nowrap"
        >
          <RotateCcw className="w-4 h-4" />
          Rebuild & Burn Again
        </button>

        <button
          onClick={handleCopy}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-sm transition-all active:scale-95 whitespace-nowrap"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Greeting Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-amber-400" />
              <span>Copy Dussehra Blessing</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
