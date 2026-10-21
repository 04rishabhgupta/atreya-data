import React, { useState } from 'react';
import { PatientFormData, CapturedImages, Gender, DiabeticCategory } from '../types';
import { createSpeechRecognizer, isSpeechRecognitionSupported } from '../services/speech';
import { FileText, Mic, MicOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

interface Step4DetailsFormProps {
  formData: PatientFormData;
  images: CapturedImages;
  onUpdateFormData: (data: PatientFormData) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const Step4DetailsForm: React.FC<Step4DetailsFormProps> = ({
  formData,
  images,
  onUpdateFormData,
  onContinue,
  onBack
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [listeningField, setListeningField] = useState<string | null>(null);
  const speechSupported = isSpeechRecognitionSupported();

  const handleChange = (field: keyof PatientFormData, value: string) => {
    onUpdateFormData({
      ...formData,
      [field]: value
    });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const startVoiceInput = (field: keyof PatientFormData) => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. Please use keyboard input.');
      return;
    }

    if (listeningField === field) {
      setListeningField(null);
      return;
    }

    setListeningField(field);
    const recognizer = createSpeechRecognizer(
      (transcript) => {
        handleChange(field, transcript);
        setListeningField(null);
      },
      (err) => {
        console.error('Speech error:', err);
        setListeningField(null);
      },
      () => {
        setListeningField(null);
      }
    );

    if (recognizer) {
      recognizer.start();
    }
  };

  const validateAndContinue = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.patientName.trim()) newErrors.patientName = 'Patient Name is required.';
    if (!formData.age.trim() || isNaN(Number(formData.age))) newErrors.age = 'Valid age is required.';
    if (!formData.gender) newErrors.gender = 'Gender is required.';
    if (!formData.heightCm.trim() || isNaN(Number(formData.heightCm))) newErrors.heightCm = 'Height in cm is required.';
    if (!formData.weightKg.trim() || isNaN(Number(formData.weightKg))) newErrors.weightKg = 'Weight in kg is required.';
    if (!formData.diabeticCategory) newErrors.diabeticCategory = 'Diabetic category is required.';
    if (!formData.takingMedicine) newErrors.takingMedicine = 'Please indicate medicine usage.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onContinue();
  };

  const formattedLocalDate = new Date(formData.timestamp).toLocaleString();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl border border-teal-100 shadow-xl p-8 md:p-12">
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200 rounded-full text-teal-800 text-xs font-semibold">
            <FileText className="w-4 h-4 text-teal-600" />
            <span>Step 4 of 7: Patient Details</span>
          </div>
          <button
            onClick={onBack}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            ← Back to Face Scan
          </button>
        </div>

        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          Patient Details & Health Profile
        </h2>
        <p className="text-slate-600 text-base mb-8">
          Please provide the required details below. You can type or use speech input with the microphone button beside each field.
        </p>

        {/* Attached Photos Summary Bar */}
        <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-teal-700" />
            <span className="text-sm font-bold text-teal-900">3 Facial Scan Angles Attached:</span>
          </div>
          <div className="flex items-center gap-2">
            <img src={images.front || ''} alt="Front" className="w-10 h-10 rounded-lg object-cover border border-teal-300" />
            <img src={images.left || ''} alt="Left" className="w-10 h-10 rounded-lg object-cover border border-teal-300" />
            <img src={images.right || ''} alt="Right" className="w-10 h-10 rounded-lg object-cover border border-teal-300" />
          </div>
        </div>

        {/* Timestamp display */}
        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600">Screening Timestamp (ISO & Local):</span>
          <span className="text-sm font-mono font-bold text-slate-900">{formattedLocalDate}</span>
        </div>

        <div className="space-y-6">
          {/* Patient Name */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Patient Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={formData.patientName}
                onChange={(e) => handleChange('patientName', e.target.value)}
                placeholder="Enter full name"
                className={`w-full h-16 px-4 bg-slate-50 border rounded-2xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.patientName ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {speechSupported && (
                <button
                  type="button"
                  onClick={() => startVoiceInput('patientName')}
                  className={`absolute right-3 p-3 rounded-xl transition-all ${
                    listeningField === 'patientName' ? 'bg-rose-600 text-white animate-pulse' : 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                  }`}
                  title="Speak to input"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </div>
            {errors.patientName && <p className="text-xs text-rose-600 mt-1">{errors.patientName}</p>}
          </div>

          {/* Age & Gender */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Age (Years) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="e.g. 45"
                className={`w-full h-16 px-4 bg-slate-50 border rounded-2xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.age ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.age && <p className="text-xs text-rose-600 mt-1">{errors.age}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Gender <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value as Gender)}
                className={`w-full h-16 px-4 bg-slate-50 border rounded-2xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.gender ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300'
                }`}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              {errors.gender && <p className="text-xs text-rose-600 mt-1">{errors.gender}</p>}
            </div>
          </div>

          {/* Height & Weight */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Height (cm) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={formData.heightCm}
                onChange={(e) => handleChange('heightCm', e.target.value)}
                placeholder="e.g. 175"
                className={`w-full h-16 px-4 bg-slate-50 border rounded-2xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.heightCm ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.heightCm && <p className="text-xs text-rose-600 mt-1">{errors.heightCm}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Weight (kg) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={formData.weightKg}
                onChange={(e) => handleChange('weightKg', e.target.value)}
                placeholder="e.g. 70"
                className={`w-full h-16 px-4 bg-slate-50 border rounded-2xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.weightKg ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.weightKg && <p className="text-xs text-rose-600 mt-1">{errors.weightKg}</p>}
            </div>
          </div>

          {/* Diabetic Category */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Diabetic Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.diabeticCategory}
              onChange={(e) => handleChange('diabeticCategory', e.target.value as DiabeticCategory)}
              className={`w-full h-16 px-4 bg-slate-50 border rounded-2xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.diabeticCategory ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300'
              }`}
            >
              <option value="">Select diabetic category</option>
              <option value="Non-diabetic">Non-diabetic</option>
              <option value="Pre-diabetic">Pre-diabetic</option>
              <option value="Type 1 Diabetes">Type 1 Diabetes</option>
              <option value="Type 2 Diabetes">Type 2 Diabetes</option>
              <option value="Gestational Diabetes">Gestational Diabetes</option>
              <option value="Unknown">Unknown</option>
            </select>
            {errors.diabeticCategory && <p className="text-xs text-rose-600 mt-1">{errors.diabeticCategory}</p>}
          </div>

          {/* Blood Sugar Vitals (Optional) */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">HbA1c (%) <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="number"
                step="0.1"
                value={formData.hba1c}
                onChange={(e) => handleChange('hba1c', e.target.value)}
                placeholder="e.g. 6.2"
                className="w-full h-16 px-4 bg-slate-50 border border-slate-300 rounded-2xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">FBS (mg/dL) <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="number"
                value={formData.fbs}
                onChange={(e) => handleChange('fbs', e.target.value)}
                placeholder="e.g. 95"
                className="w-full h-16 px-4 bg-slate-50 border border-slate-300 rounded-2xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">RBS (mg/dL) <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="number"
                value={formData.rbs}
                onChange={(e) => handleChange('rbs', e.target.value)}
                placeholder="e.g. 140"
                className="w-full h-16 px-4 bg-slate-50 border border-slate-300 rounded-2xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Taking Medicine? */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Currently taking any medicine? <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => handleChange('takingMedicine', 'Yes')}
                className={`flex-1 h-16 rounded-2xl font-bold text-base border transition-all ${
                  formData.takingMedicine === 'Yes'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleChange('takingMedicine', 'No')}
                className={`flex-1 h-16 rounded-2xl font-bold text-base border transition-all ${
                  formData.takingMedicine === 'No'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                No
              </button>
            </div>
            {errors.takingMedicine && <p className="text-xs text-rose-600 mt-1">{errors.takingMedicine}</p>}

            {formData.takingMedicine === 'Yes' && (
              <div className="relative mt-4">
                <label className="block text-sm font-bold text-slate-900 mb-2">Medicine Details / Names</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={formData.medicineDetails}
                    onChange={(e) => handleChange('medicineDetails', e.target.value)}
                    placeholder="Enter medicine names and dosage"
                    className="w-full h-16 px-4 bg-slate-50 border border-slate-300 rounded-2xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={() => startVoiceInput('medicineDetails')}
                      className={`absolute right-3 p-3 rounded-xl transition-all ${
                        listeningField === 'medicineDetails' ? 'bg-rose-600 text-white animate-pulse' : 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                      }`}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Remarks <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <textarea
                value={formData.remarks}
                onChange={(e) => handleChange('remarks', e.target.value)}
                placeholder="Any additional notes or symptoms"
                rows={3}
                className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {speechSupported && (
                <button
                  type="button"
                  onClick={() => startVoiceInput('remarks')}
                  className={`absolute right-3 top-3 p-3 rounded-xl transition-all ${
                    listeningField === 'remarks' ? 'bg-rose-600 text-white animate-pulse' : 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={validateAndContinue}
          className="w-full h-20 mt-8 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xl rounded-2xl shadow-xl shadow-teal-600/30 flex items-center justify-center gap-3 transition-all active:scale-[0.99]"
        >
          <span>Continue to Review</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
