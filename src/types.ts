export type ScreeningStep = 
  | 'welcome' 
  | 'instructions' 
  | 'scan' 
  | 'details' 
  | 'review' 
  | 'consent' 
  | 'submitting' 
  | 'confirmation';

export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';

export type DiabeticCategory = 
  | 'Non-diabetic' 
  | 'Pre-diabetic' 
  | 'Type 1 Diabetes' 
  | 'Type 2 Diabetes' 
  | 'Gestational Diabetes' 
  | 'Unknown';

export interface PatientFormData {
  timestamp: string;
  patientName: string;
  age: string;
  gender: Gender | '';
  heightCm: string;
  weightKg: string;
  diabeticCategory: DiabeticCategory | '';
  hba1c: string;
  fbs: string;
  rbs: string;
  takingMedicine: 'Yes' | 'No' | '';
  medicineDetails: string;
  remarks: string;
}

export interface CapturedImages {
  front: string | null; // data url or blob url
  left: string | null;
  right: string | null;
  frontBlob?: Blob | null;
  leftBlob?: Blob | null;
  rightBlob?: Blob | null;
}

export interface ConsentData {
  consentGiven: boolean;
  consentTimestamp: string;
  consentVersion: string;
  orgName: string;
  contactEmail: string;
  privacyUrl: string;
}

export interface ScreeningSubmissionRecord {
  formData: PatientFormData;
  images: CapturedImages;
  consent: ConsentData;
  driveFolderLink?: string;
  spreadsheetRowId?: string;
}
