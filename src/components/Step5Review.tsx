import React from 'react';
import { PatientFormData, CapturedImages } from '../types';
import { CheckSquare, ArrowRight, Edit3, User, Calendar, Activity, HeartPulse } from 'lucide-react';

interface Step5ReviewProps {
  formData: PatientFormData;
  images: CapturedImages;
  onEdit: () => void;
  onContinue: () => void;
  onBack: () => void;
}

export const Step5Review: React.FC<Step5ReviewProps> = ({
  formData,
  images,
  onEdit,
  onContinue,
  onBack
}) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl border border-teal-100 shadow-xl p-8 md:p-12">
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200 rounded-full text-teal-800 text-xs font-semibold">
            <CheckSquare className="w-4 h-4 text-teal-600" />
            <span>Step 5 of 7: Review Details</span>
          </div>
          <button
            onClick={onBack}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            ← Back to Details Form
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Review Your Screening Information
            </h2>
            <p className="text-slate-600 text-base">
              Please verify all details and captured facial images before proceeding to consent.
            </p>
          </div>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-5 py-3 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-sm rounded-2xl border border-teal-200 transition-all active:scale-95 shrink-0"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Details</span>
          </button>
        </div>

        {/* Images Review Grid */}
        <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-3xl">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Captured Facial Photos</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="aspect-4/3 rounded-2xl overflow-hidden bg-slate-200 border-2 border-white shadow-md mb-2">
                <img src={images.front || ''} alt="Front View" className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-bold text-slate-700">Front View</span>
            </div>
            <div className="text-center">
              <div className="aspect-4/3 rounded-2xl overflow-hidden bg-slate-200 border-2 border-white shadow-md mb-2">
                <img src={images.left || ''} alt="Left View" className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-bold text-slate-700">Left View</span>
            </div>
            <div className="text-center">
              <div className="aspect-4/3 rounded-2xl overflow-hidden bg-slate-200 border-2 border-white shadow-md mb-2">
                <img src={images.right || ''} alt="Right View" className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-bold text-slate-700">Right View</span>
            </div>
          </div>
        </div>

        {/* Details Summary Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider border-b pb-2">Personal Information</h3>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Full Name:</span>
              <span className="font-bold text-slate-900">{formData.patientName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Age / Gender:</span>
              <span className="font-bold text-slate-900">{formData.age} yrs / {formData.gender}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Height / Weight:</span>
              <span className="font-bold text-slate-900">{formData.heightCm} cm / {formData.weightKg} kg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Timestamp:</span>
              <span className="font-mono text-xs font-bold text-slate-700">{new Date(formData.timestamp).toLocaleString()}</span>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider border-b pb-2">Health & Clinical Profile</h3>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Diabetic Category:</span>
              <span className="font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">{formData.diabeticCategory}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">HbA1c / FBS / RBS:</span>
              <span className="font-bold text-slate-900">{formData.hba1c || 'N/A'}% / {formData.fbs || 'N/A'} / {formData.rbs || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Taking Medicine?:</span>
              <span className="font-bold text-slate-900">{formData.takingMedicine} {formData.medicineDetails && `(${formData.medicineDetails})`}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Remarks:</span>
              <span className="font-medium text-slate-700 truncate max-w-[180px]">{formData.remarks || 'None'}</span>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="w-full h-20 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xl rounded-2xl shadow-xl shadow-teal-600/30 flex items-center justify-center gap-3 transition-all active:scale-[0.99]"
        >
          <span>Continue to Consent</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
