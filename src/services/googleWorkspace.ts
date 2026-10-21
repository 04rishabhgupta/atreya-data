import { PatientFormData, CapturedImages, ConsentData } from '../types';
import { getAccessToken } from './googleAuth';

const SPREADSHEET_NAME = 'Atreya Facial Screening Records';

const HEADERS = [
  'Timestamp',
  'Patient Name',
  'Age',
  'Gender',
  'Height (cm)',
  'Weight (kg)',
  'Diabetic Category',
  'HbA1c',
  'FBS',
  'RBS',
  'Currently taking any Medicine?',
  'Medicine Details',
  'Facial Image - Front',
  'Facial Image - Left',
  'Facial Image - Right',
  'Remarks',
  'Drive Folder Link',
  'Consent Given',
  'Consent Timestamp',
  'Consent Version'
];

/**
 * Find or create the Google Sheet named "Atreya Facial Screening Records"
 */
export async function getOrCreateSpreadsheet(accessToken: string): Promise<string> {
  // Search for existing spreadsheet
  const query = encodeURIComponent(`name = '${SPREADSHEET_NAME}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!searchRes.ok) {
    const errText = await searchRes.text();
    throw new Error(`Failed to search spreadsheet: ${searchRes.status} ${errText}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create new spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/spreadsheets/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: SPREADSHEET_NAME
      },
      sheets: [
        {
          properties: {
            title: 'Screening Records'
          }
        }
      ]
    })
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create spreadsheet: ${createRes.status} ${errText}`);
  }

  const spreadsheet = await createRes.json();
  const spreadsheetId = spreadsheet.spreadsheetId;

  // Initialize headers
  await appendValuesToSheet(accessToken, spreadsheetId, 'Screening Records!A1', [HEADERS]);

  return spreadsheetId;
}

async function appendValuesN(accessToken: string, spreadsheetId: string, range: string, values: any[][]) {
  const res = await fetch(`https://sheets.googleapis.com/spreadsheets/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to append to spreadsheet: ${res.status} ${errText}`);
  }
  return res.json();
}

async function appendValuesToSheet(accessToken: string, spreadsheetId: string, range: string, values: any[][]) {
  return appendValuesN(accessToken, spreadsheetId, range, values);
}

/**
 * Create a Google Drive folder for the patient session
 */
export async function createDriveFolder(accessToken: string, patientName: string, timestampStr: string): Promise<{ folderId: string; folderUrl: string }> {
  // Format timestamp for folder name: YYYY-MM-DD-HH-mm
  const sanitizedName = patientName.replace(/[^a-zA-Z0-9]/g, '_');
  const dateStr = new Date(timestampStr).toISOString().replace(/[:.]/g, '-').slice(0, 16);
  const folderTitle = `Atreya Screening - ${sanitizedName} - ${dateStr}`;

  const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderTitle,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create Google Drive folder: ${res.status} ${errText}`);
  }

  const folder = await res.json();
  return {
    folderId: folder.id,
    folderUrl: folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`
  };
}

/**
 * Upload an image blob to a specific Google Drive folder
 */
export async function uploadImageToDrive(
  accessToken: string,
  folderId: string,
  fileName: string,
  imageBlob: Blob
): Promise<string> {
  const metadata = {
    name: fileName,
    parents: [folderId]
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', imageBlob, fileName);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: form
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to upload image ${fileName}: ${res.status} ${errText}`);
  }

  const fileData = await res.json();
  return fileData.webViewLink || `https://drive.google.com/file/d/${fileData.id}/view`;
}

/**
 * Convert dataURL to Blob
 */
export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const match = arr[0].match(/:(.*?);/);
  const mime = match ? match[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Complete submission: create folder, upload 3 images, append row to Google Sheet
 */
export async function submitScreeningRecord(
  formData: PatientFormData,
  images: CapturedImages,
  consent: ConsentData
): Promise<{ driveFolderUrl: string; spreadsheetUrl: string }> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('Not authenticated with Google. Please sign in with Google.');
  }

  // 1. Get or create spreadsheet ID
  const spreadsheetId = await getOrCreateSpreadsheet(accessToken);

  // 2. Create Drive folder
  const { folderId, folderUrl } = await createDriveFolder(accessToken, formData.patientName, formData.timestamp);

  // 3. Upload images (front.jpg, left.jpg, right.jpg)
  let frontLink = '';
  let leftLink = '';
  let rightLink = '';

  if (images.front) {
    const frontBlob = images.frontBlob || dataURLtoBlob(images.front);
    frontLink = await uploadImageToDrive(accessToken, folderId, 'front.jpg', frontBlob);
  }

  if (images.left) {
    const leftBlob = images.leftBlob || dataURLtoBlob(images.left);
    leftLink = await uploadImageToDrive(accessToken, folderId, 'left.jpg', leftBlob);
  }

  if (images.right) {
    const rightBlob = images.rightBlob || dataURLtoBlob(images.right);
    rightLink = await uploadImageToDrive(accessToken, folderId, 'right.jpg', rightBlob);
  }

  // 4. Format row data according to exact headers:
  const rowValues = [
    [
      formData.timestamp,
      formData.patientName,
      formData.age,
      formData.gender,
      formData.heightCm,
      formData.weightKg,
      formData.diabeticCategory,
      formData.hba1c || 'N/A',
      formData.fbs || 'N/A',
      formData.rbs || 'N/A',
      formData.takingMedicine,
      formData.medicineDetails || 'N/A',
      frontLink || 'N/A',
      leftLink || 'N/A',
      rightLink || 'N/A',
      formData.remarks || 'N/A',
      folderUrl,
      consent.consentGiven ? 'Yes' : 'No',
      consent.consentTimestamp,
      consent.consentVersion
    ]
  ];

  await appendValuesToSheet(accessToken, spreadsheetId, 'Screening Records!A:T', rowValues);

  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return { driveFolderUrl: folderUrl, spreadsheetUrl };
}

