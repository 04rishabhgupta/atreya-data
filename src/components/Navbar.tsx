import React from 'react';
import { ScreeningStep } from '../types';
import { RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentStep: ScreeningStep;
  onStartOver: () => void;
}

const STEPS_ORDER: ScreeningStep[] = [
  'welcome',
  'instructions',
  'scan',
  'details',
  'review',
  'consent',
  'confirmation'
];

const STEP_LABELS: Record<ScreeningStep, string> = {
  welcome: 'About',
  instructions: 'Instructions',
  scan: 'Face Scan',
  details: 'Patient Details',
  review: 'Review',
  consent: 'Consent',
  submitting: 'Submitting',
  confirmation: 'Submitted'
};

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  onStartOver
}) => {
  const currentStepIndex = STEPS_ORDER.indexOf(currentStep === 'submitting' ? 'consent' : currentStep);

  return (
    <header className="w-full bg-white border-b border-teal-100 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand with Atreya AI Logo image optimized for white background */}
        <div className="flex items-center gap-3">
          <div className="h-12 flex items-center bg-white px-2 py-1 rounded-xl shadow-xs border border-slate-100">
            <img
              src="/assets/aistudio/image_311deabc.png"
              alt="atreya.ai logo"
              className="h-9 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Progress bar in middle (if not on welcome) */}
        {currentStep !== 'welcome' && currentStepIndex >= 0 && (
          <div className="hidden lg:flex items-center gap-2">
            {STEPS_ORDER.map((step, idx) => {
              const isActive = idx === currentStepIndex;
              const isPassed = idx < currentStepIndex;
              return (
                <div key={step} className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                        : isPassed
                        ? 'bg-teal-50 text-teal-800 border border-teal-200'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <span>{idx + 1}.</span>
                    <span>{STEP_LABELS[step]}</span>
                  </div>
                  {idx < STEPS_ORDER.length - 1 && (
                    <div className={`w-4 h-0.5 ${idx < currentStepIndex ? 'bg-teal-400' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Start Over Action */}
        <div className="flex items-center gap-4">
          {currentStep !== 'welcome' && currentStep !== 'confirmation' && (
            <button
              onClick={onStartOver}
              className="flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-all active:scale-95 min-h-[56px]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Start Over</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
