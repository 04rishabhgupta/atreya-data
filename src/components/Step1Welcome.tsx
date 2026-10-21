import React from 'react';
import { ArrowRight, ShieldCheck, HeartPulse, Sparkles, UserCheck, Stethoscope } from 'lucide-react';

interface Step1WelcomeProps {
  onStart: () => void;
}

export const Step1Welcome: React.FC<Step1WelcomeProps> = ({ onStart }) => {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-teal-100 shadow-xl p-6 sm:p-10 md:p-12 space-y-8">
        {/* 1. Startup Name: Atreya.ai */}
        <div className="flex items-center gap-4">
          <div className="bg-white border border-teal-100 p-2.5 rounded-2xl shadow-sm">
            <img
              src="/assets/aistudio/image_311deabc.png"
              alt="Atreya.ai logo"
              className="h-10 sm:h-12 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Atreya.ai</h2>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-teal-50 border border-teal-200/80 rounded-full text-teal-800 text-xs font-semibold mt-0.5">
              <Sparkles className="w-3 h-3 text-teal-600" />
              <span>Metabolic Health Screening</span>
            </div>
          </div>
        </div>

        {/* 2. Main Heading and Description */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Bridging Ancient Ayurvedic Science with Non-Contact AI
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Atreya.ai transforms everyday cameras into non-invasive physiological sensors. By evaluating facial biomarkers alongside metabolic vitals, we generate objective health signals to guide individual preventive care without clinical complexity.
          </p>
        </div>

        {/* 3. Why Do We Need Your Data? Section */}
        <section className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Why Do We Need Your Data?
              </h3>
              <p className="text-xs text-slate-500">
                A transparent overview of how your information supports this screening
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
                <HeartPulse className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Facial & Physiological Signals</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We capture non-invasive facial camera images to detect micro-variations in reflected light and facial biomarkers without requiring wearable sensors or finger clips.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Personalized Health Insights</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Optical signals are analyzed alongside your health parameters to uncover metabolic tendencies and wellness patterns specific to your unique constitution.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
                <UserCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Importance of Accurate Information</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Accurate user-reported vitals (such as age, height, weight, and glycemic markers) ensure the guidance is calibrated to your true physiological status rather than estimates.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
                <Stethoscope className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Targeted Preventive Care</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Your combined profile enables actionable Ayurvedic lifestyle adjustments, dietary suggestions, and habit recommendations to help maintain balanced metabolic wellness.
              </p>
            </div>
          </div>

          <div className="p-4 bg-amber-50/80 border border-amber-200/70 rounded-2xl text-xs text-amber-900 leading-relaxed">
            <span className="font-semibold">Notice:</span> This screening platform provides guidance and wellness insights, not medical diagnoses. All information is saved securely within your organization's Google Workspace (Google Drive & Sheets) for the screening programme.
          </div>
        </section>

        {/* Existing CTA Button - Preserved exactly */}
        <button
          onClick={onStart}
          className="w-full h-20 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xl rounded-2xl shadow-xl shadow-teal-600/30 flex items-center justify-center gap-3 transition-all active:scale-[0.99]"
        >
          <span>I Understand — Start Screening</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};


