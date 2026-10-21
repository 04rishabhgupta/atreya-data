/**
 * Atreya Facial Screening Kiosk - Google Apps Script Backend
 * 
 * Provides automated handling for:
 * 1. Creating/connecting to the Google Sheet and root Google Drive folder (setup)
 * 2. Receiving patient screening submissions (doPost)
 * 3. Storing captured front/left/right face images into Drive folders
 * 4. Appending row records into Google Sheets
 */

const SPREADSHEET_NAME = 'Atreya Facial Screening Records';
const ROOT_FOLDER_NAME = 'Atreya Screening Submissions';

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
 * Run this function ONCE in the Apps Script editor to authorize
 * and automatically initialize the Google Sheet & Drive folder.
 */
function setup() {
  const props = PropertiesService.getScriptProperties();

  // 1. Get or create root Drive folder
  let rootFolder;
  const folders = DriveApp.getFoldersByName(ROOT_FOLDER_NAME);
  if (folders.hasNext()) {
    rootFolder = folders.next();
  } else {
    rootFolder = DriveApp.createFolder(ROOT_FOLDER_NAME);
  }
  props.setProperty('ROOT_FOLDER_ID', rootFolder.getId());

  // 2. Get or create Spreadsheet
  let spreadsheet;
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  if (files.hasNext()) {
    const file = files.next();
    spreadsheet = SpreadsheetApp.openById(file.getId());
  } else {
    spreadsheet = SpreadsheetApp.create(SPREADSHEET_NAME);
    // Move spreadsheet into the root folder
    const file = DriveApp.getFileById(spreadsheet.getId());
    rootFolder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
  }
  props.setProperty('SPREADSHEET_ID', spreadsheet.getId());

  // 3. Initialize sheet headers
  let sheet = spreadsheet.getSheetByName('Screening Records');
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Screening Records', 0);
  }

  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setValues([HEADERS]);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#0d9488');
  headerRange.setFontColor('#ffffff');
  sheet.setFrozenRows(1);

  Logger.log('Setup successfully completed!');
  Logger.log('Spreadsheet ID: ' + spreadsheet.getId());
  Logger.log('Spreadsheet URL: ' + spreadsheet.getUrl());
  Logger.log('Root Folder URL: ' + rootFolder.getUrl());

  return {
    spreadsheetUrl: spreadsheet.getUrl(),
    folderUrl: rootFolder.getUrl()
  };
}

/**
 * Handle incoming POST requests from the Screening Kiosk
 */
function doPost(e) {
  try {
    const props = PropertiesService.getScriptProperties();
    let rootFolderId = props.getProperty('ROOT_FOLDER_ID');
    let spreadsheetId = props.getProperty('SPREADSHEET_ID');

    if (!rootFolderId || !spreadsheetId) {
      setup();
      rootFolderId = props.getProperty('ROOT_FOLDER_ID');
      spreadsheetId = props.getProperty('SPREADSHEET_ID');
    }

    const payload = JSON.parse(e.postData.contents);
    const formData = payload.formData || {};
    const images = payload.images || {};
    const consent = payload.consent || {};

    const rootFolder = DriveApp.getFolderById(rootFolderId);
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    let sheet = spreadsheet.getSheetByName('Screening Records') || spreadsheet.getActiveSheet();

    // Create session patient folder
    const patientName = (formData.patientName || 'Anonymous').replace(/[^a-zA-Z0-9]/g, '_');
    const timestampStr = formData.timestamp || new Date().toISOString();
    const dateFormatted = Utilities.formatDate(new Date(timestampStr), 'GMT', 'yyyy-MM-dd_HH-mm');
    const patientFolder = rootFolder.createFolder('Screening_' + patientName + '_' + dateFormatted);

    // Save images (front, left, right)
    let frontLink = 'N/A';
    let leftLink = 'N/A';
    let rightLink = 'N/A';

    if (images.front) {
      frontLink = saveImage(patientFolder, 'front.jpg', images.front);
    }
    if (images.left) {
      leftLink = saveImage(patientFolder, 'left.jpg', images.left);
    }
    if (images.right) {
      rightLink = saveImage(patientFolder, 'right.jpg', images.right);
    }

    // Append row
    const row = [
      formData.timestamp || new Date().toISOString(),
      formData.patientName || '',
      formData.age || '',
      formData.gender || '',
      formData.heightCm || '',
      formData.weightKg || '',
      formData.diabeticCategory || '',
      formData.hba1c || 'N/A',
      formData.fbs || 'N/A',
      formData.rbs || 'N/A',
      formData.takingMedicine || '',
      formData.medicineDetails || 'N/A',
      frontLink,
      leftLink,
      rightLink,
      formData.remarks || 'N/A',
      patientFolder.getUrl(),
      consent.consentGiven ? 'Yes' : 'No',
      consent.consentTimestamp || '',
      consent.consentVersion || 'v1'
    ];

    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      driveFolderUrl: patientFolder.getUrl(),
      spreadsheetUrl: spreadsheet.getUrl()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Helper: Save base64/dataURL image into Google Drive
 */
function saveImage(folder, filename, base64Data) {
  try {
    let cleanBase64 = base64Data;
    let contentType = 'image/jpeg';

    if (base64Data.indexOf('base64,') > -1) {
      const parts = base64Data.split('base64,');
      cleanBase64 = parts[1];
      const mimeMatch = parts[0].match(/:(.*?);/);
      if (mimeMatch && mimeMatch[1]) {
        contentType = mimeMatch[1];
      }
    }

    const decoded = Utilities.base64Decode(cleanBase64);
    const blob = Utilities.newBlob(decoded, contentType, filename);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (err) {
    Logger.log('Error saving image ' + filename + ': ' + err);
    return 'Error: ' + err.message;
  }
}

/**
 * Health check GET
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'healthy',
    service: 'Atreya Facial Screening Kiosk Backend'
  })).setMimeType(ContentService.MimeType.JSON);
}
