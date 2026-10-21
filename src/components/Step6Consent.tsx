import React, { useState } from 'react';
import { ConsentData } from '../types';
import { ShieldCheck, Lock, ArrowRight, XCircle, Check } from 'lucide-react';

interface Step6ConsentProps {
  consent: ConsentData;
  onUpdateConsent: (consent: ConsentData) => void;
  onSubmit: () => void;
  onDecline: () => void;
  onBack: () => void;
}

export const Step6Consent: React.FC<Step6ConsentProps> = ({
  consent,
  onUpdateConsent,
  onSubmit,
  onDecline,
  onBack
}) => {
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(false);

  const handleCheckboxChange = (checked: boolean) => {
    onUpdateConsent({
      ...consent,
      consentGiven: checked,
      consentTimestamp: checked ? new Date().toISOString() : ''
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl border border-teal-100 shadow-xl p-8 md:p-12">
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200 rounded-full text-teal-800 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Step 6 of 7: Mandatory Consent</span>
          </div>
          <button
            onClick={onBack}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            ← Back to Review
          </button>
        </div>

        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Participant Consent & Privacy Authorization
        </h2>
        <p className="text-slate-600 text-base mb-6">
          Please read the following terms carefully. You must provide consent to complete the screening submission.
        </p>

        {/* Scrollable Consent Statement Box */}
        <div className="h-72 overflow-y-auto p-6 bg-slate-50 border border-slate-200 rounded-3xl mb-8 space-y-4 text-slate-700 text-sm leading-relaxed">
          <h3 className="font-bold text-slate-900 text-base">Atreya Facial Screening Programme — Terms of Participation</h3>
          
          <p>
            <strong>1. Purpose of Collection:</strong> Your facial images and health details are being collected exclusively for participation in the Atreya diabetes-related facial screening programme.
          </p>

          <p>
            <strong>2. Data Collected:</strong> Patient name, age, gender, height, weight, diabetic category, HbA1c, FBS, RBS, medicine details, remarks, session timestamp, consent metadata, and three multi-angle facial photographs.
          </p>

          <p>
            <strong>3. How Data Will Be Used:</strong> Form records will be securely appended to the organization's private Google Sheet, and facial photographs will be uploaded to a dedicated secure folder in the organization's Google Drive for screening-record management and program analysis.
          </p>

          <p>
            <strong>4. Voluntary Participation:</strong> Participation in this screening is entirely voluntary. You may choose not to proceed at any time. If you do not consent, no form data, health details, or facial images will be saved, uploaded, or shared.
          </p>

          <p>
            <strong>5. Withdrawal & Rights:</strong> You may contact the programme administrator to request review, update, or removal of your screening record, subject to applicable data-retention policies and legal requirements.
          </p>

          <p>
            <strong>6. Privacy & Medical Disclaimer:</strong> The organization will not sell your data, use it for advertising, or provide commercial distribution. <strong>This screening tool does not provide a definitive medical diagnosis or treatment advice.</strong> Always consult a qualified physician for healthcare decisions.
          </p>

          <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-1">
            <p><strong>Organization Name:</strong> {consent.orgName}</p>
            <p><strong>Programme Contact Email:</strong> {consent.contactEmail}</p>
            <p><strong>Privacy Policy:</strong> <a href={consent.privacyUrl} target="_blank" rel="noreferrer" className="text-teal-600 underline">{consent.privacyUrl}</a></p>
          </div>
        </div>

        {/* Mandatory Checkbox */}
        <div className="p-6 bg-teal-50/60 border-2 border-teal-200 rounded-3xl mb-8 flex items-start gap-4">
          <input
            type="checkbox"
            id="consentCheckbox"
            checked={consent.consentGiven}
            onChange={(e) => handleCheckboxChange(e.target.checked)}
            className="w-7 h-7 text-teal-600 rounded-lg border-teal-300 focus:ring-teal-500 shrink-0 mt-1 cursor-pointer"
          />
          <label htmlFor="consentCheckbox" className="text-slate-900 font-bold text-base cursor-pointer select-none leading-relaxed">
            I have read and understood the above information and I consent to the collection, storage, and use of my information and facial images for this screening programme. (Version: {consent.consentVersion})
          </label>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => setShowDeclineModal(true)}
            className="w-full h-20 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <XCircle className="w-6 h-6 text-rose-600" />
            <span>Decline and Exit</span>
          </button>

          <button
            onClick={onSubmit}
            disabled={!consent.consentGiven}
            className={`w-full h-20 font-bold text-lg rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all ${
              consent.consentGiven
                ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30 active:scale-[0.99]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Lock className="w-6 h-6" />
            <span>Submit and Upload Record</span>
          </button>
        </div>
      </div>

      {/* Decline Confirmation Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
              <XCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Screening Declined</h3>
            <p className="text-slate-600 text-sm mb-8 leading-relaxed">
              No information, health details, or facial images will be submitted or saved. All session data will now be cleared.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="w-full h-14 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition-all"
              >
                Return to Consent
              </button>
              <button
                onClick={onDecline}
                className="w-full h-14 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-2xl shadow-lg shadow-rose-600/30 transition-all"
              >
                Exit & Clear Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
