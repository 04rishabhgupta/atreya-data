import config from '../../firebase-applet-config.json';

const CLIENT_ID = config.oAuthClientId || '885538172563-hme3clrnjlo7sfcmasuitcfl4v1ruit4.apps.googleusercontent.com';
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
].join(' ');

let accessToken: string | null = null;

export function requestGoogleAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const google = (window as any).google;
    if (!google || !google.accounts || !google.accounts.oauth2) {
      reject(new Error('Google Identity Services script not loaded yet. Please try again.'));
      return;
    }

    const client = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      hint: 'mohitsehrawat1315@gmail.com',
      callback: (response: any) => {
        if (response.error) {
          reject(new Error(response.error_description || response.error || 'Google OAuth failed'));
          return;
        }
        accessToken = response.access_token;
        if (accessToken) {
          resolve(accessToken);
        } else {
          reject(new Error('Failed to retrieve access token from Google.'));
        }
      }
    });

    client.requestAccessToken();
  });
}

export async function getAccessToken(): Promise<string | null> {
  if (accessToken) return accessToken;
  try {
    return await requestGoogleAccessToken();
  } catch (e) {
    console.error('Failed to get access token:', e);
    return null;
  }
}

export function logoutGoogle() {
  accessToken = null;
}
