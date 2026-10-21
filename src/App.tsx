import React, { useState } from 'react';
import { ScreeningStep, PatientFormData, CapturedImages, ConsentData } from './types';
import { getAccessToken, logoutGoogle } from './services/googleAuth';
import { submitScreeningRecord } from './services/googleWorkspace';
import { Navbar } from './components/Navbar';
import { StartOverModal } from './components/StartOverModal';
import { Step1Welcome } from './components/Step1Welcome';
import { Step2Instructions } from './components/Step2Instructions';
import { Step3FaceScan } from './components/Step3FaceScan';
import { Step4DetailsForm } from './components/Step4DetailsForm';
import { Step5Review } from './components/Step5Review';
import { Step6Consent } from './components/Step6Consent';
import { Step7Confirmation } from './components/Step7Confirmation';

const initialFormData: PatientFormData = {
  timestamp: new Date().toISOString(),
  patientName: '',
  age: '',
  gender: '',
  heightCm: '',
  weightKg: '',
  diabeticCategory: '',
  hba1c: '',
  fbs: '',
  rbs: '',
  takingMedicine: '',
  medicineDetails: '',
  remarks: ''
};

const initialImages: CapturedImages = {
  front: null,
  left: null,
  right: null,
  frontBlob: null,
  leftBlob: null,
  rightBlob: null
};

const initialConsent: ConsentData = {
  consentGiven: false,
  consentTimestamp: '',
  consentVersion: 'v1',
  orgName: 'Atreya Health & Wellness Programme',
  contactEmail: 'mohitsehrawat1315@gmail.com',
  privacyUrl: 'https://atreya.ai/privacy'
};

export default function App() {
  const [currentStep, setCurrentStep] = useState<ScreeningStep>('welcome');
  const [formData, setFormData] = useState<PatientFormData>(initialFormData);
  const [images, setImages] = useState<CapturedImages>(initialImages);
  const [consent, setConsent] = useState<ConsentData>(initialConsent);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [driveFolderUrl, setDriveFolderUrl] = useState<string | null>(null);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(null);

  const [showStartOverModal, setShowStartOverModal] = useState(false);

  const resetEverything = () => {
    setFormData({
      ...initialFormData,
      timestamp: new Date().toISOString()
    });
    setImages(initialImages);
    setConsent(initialConsent);
    setCurrentStep('welcome');
    setSubmissionError(null);
    setDriveFolderUrl(null);
    setSpreadsheetUrl(null);
    setShowStartOverModal(false);
  };

  const handleFinalSubmit = async () => {
    setCurrentStep('submitting');
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // Request Google Access Token via Google Identity Services popup
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Google authorization was cancelled or failed.');
      }

      const result = await submitScreeningRecord(formData, images, consent);
      setDriveFolderUrl(result.driveFolderUrl);
      setSpreadsheetUrl(result.spreadsheetUrl);
      setIsSubmitting(false);
      setCurrentStep('confirmation');
    } catch (err: any) {
      console.error('Submission error:', err);
      setSubmissionError(err.message || 'An error occurred during submission.');
      setIsSubmitting(false);
      setCurrentStep('consent'); // return to consent to retry
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-100 text-slate-900 font-sans flex flex-col">
      <Navbar
        currentStep={currentStep}
        onStartOver={() => setShowStartOverModal(true)}
      />

      <main className="flex-1 flex flex-col justify-center py-6">
        {currentStep === 'welcome' && (
          <Step1Welcome onStart={() => setCurrentStep('instructions')} />
        )}

        {currentStep === 'instructions' && (
          <Step2Instructions
            onContinue={() => setCurrentStep('scan')}
            onBack={() => setCurrentStep('welcome')}
          />
        )}

        {currentStep === 'scan' && (
          <Step3FaceScan
            images={images}
            onUpdateImages={(newImages) => setImages(newImages)}
            onContinue={() => setCurrentStep('details')}
            onBack={() => setCurrentStep('instructions')}
          />
        )}

        {currentStep === 'details' && (
          <Step4DetailsForm
            formData={formData}
            images={images}
            onUpdateFormData={(newData) => setFormData(newData)}
            onContinue={() => setCurrentStep('review')}
            onBack={() => setCurrentStep('scan')}
          />
        )}

        {currentStep === 'review' && (
          <Step5Review
            formData={formData}
            images={images}
            onEdit={() => setCurrentStep('details')}
            onContinue={() => setCurrentStep('consent')}
            onBack={() => setCurrentStep('details')}
          />
        )}

        {currentStep === 'consent' && (
          <Step6Consent
            consent={consent}
            onUpdateConsent={(newConsent) => setConsent(newConsent)}
            onSubmit={handleFinalSubmit}
            onDecline={resetEverything}
            onBack={() => setCurrentStep('review')}
          />
        )}

        {(currentStep === 'submitting' || currentStep === 'confirmation') && (
          <Step7Confirmation
            isSubmitting={isSubmitting}
            error={submissionError}
            driveFolderUrl={driveFolderUrl}
            spreadsheetUrl={spreadsheetUrl}
            onRetry={handleFinalSubmit}
            onNewScreening={resetEverything}
          />
        )}
      </main>

      <StartOverModal
        isOpen={showStartOverModal}
        onConfirm={resetEverything}
        onCancel={() => setShowStartOverModal(false)}
      />

      <footer className="w-full py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        Atreya Facial Screening Kiosk · Secure Preventive Health Programme · Powered by Google Sheets & Google Drive API
      </footer>
    </div>
  );
}
