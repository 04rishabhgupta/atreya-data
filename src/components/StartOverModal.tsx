import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface StartOverModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const StartOverModal: React.FC<StartOverModalProps> = ({
  isOpen,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Start Over Screening?</h3>
        <p className="text-slate-600 text-sm mb-8 leading-relaxed">
          All captured facial images, patient details, and progress will be cleared and reset for a new session. This action cannot be undone.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onCancel}
            className="w-full h-14 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition-all active:scale-95 text-base"
          >
            Continue Screening
          </button>
          <button
            onClick={onConfirm}
            className="w-full h-14 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-2xl shadow-lg shadow-rose-600/30 transition-all active:scale-95 text-base"
          >
            Yes, Start Over
          </button>
        </div>
      </div>
    </div>
  );
};
