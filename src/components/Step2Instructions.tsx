import React from 'react';
import { CheckCircle2, XCircle, Camera, ArrowRight, Sun, UserCheck, Eye } from 'lucide-react';

interface Step2InstructionsProps {
  onContinue: () => void;
  onBack: () => void;
}

export const Step2Instructions: React.FC<Step2InstructionsProps> = ({ onContinue, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl border border-teal-100 shadow-xl p-8 md:p-12">
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200 rounded-full text-teal-800 text-xs font-semibold">
            <Camera className="w-4 h-4 text-teal-600" />
            <span>Step 2 of 7</span>
          </div>
          <button
            onClick={onBack}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            ← Back to Welcome
          </button>
        </div>

        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Face Scan Preparation Guide
        </h2>
        <p className="text-slate-600 text-base mb-8">
          Follow these simple Do's and Don'ts to ensure a high-quality facial capture for your screening record.
        </p>

        {/* Dos and Don'ts Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* DOs */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-emerald-950">DO</h3>
            </div>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <span className="text-slate-700 text-sm font-medium">Sit in a well-lit area facing natural or soft light.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <span className="text-slate-700 text-sm font-medium">Remove glasses, masks, caps, or items covering the face.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <span className="text-slate-700 text-sm font-medium">Keep your face centered inside the on-screen oval guide.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <span className="text-slate-700 text-sm font-medium">Maintain a calm, neutral facial expression.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <span className="text-slate-700 text-sm font-medium">Hold still during the 3-second countdown capture.</span>
              </li>
            </ul>
          </div>

          {/* DONTs */}
          <div className="bg-rose-50/60 border border-rose-200 rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-md shadow-rose-600/20">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-rose-950">DON'T</h3>
            </div>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-rose-200 text-rose-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">✕</span>
                <span className="text-slate-700 text-sm font-medium">Do not scan in dim lighting or with harsh side shadows.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-rose-200 text-rose-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">✕</span>
                <span className="text-slate-700 text-sm font-medium">Do not use camera filters or beauty enhancement modes.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-rose-200 text-rose-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">✕</span>
                <span className="text-slate-700 text-sm font-medium">Do not move, smile, talk, or turn during capture.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-rose-200 text-rose-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">✕</span>
                <span className="text-slate-700 text-sm font-medium">Do not cover forehead, cheeks, or chin with hair or hands.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-rose-200 text-rose-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">✕</span>
                <span className="text-slate-700 text-sm font-medium">Do not submit blurry or out-of-focus images.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="w-full h-20 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xl rounded-2xl shadow-xl shadow-teal-600/30 flex items-center justify-center gap-3 transition-all active:scale-[0.99]"
        >
          <span>Continue to Camera Capture</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
