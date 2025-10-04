const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

let tokenClient;

export const initializeGoogleAuth = () => {
  return new Promise((resolve) => {
    if (typeof google !== 'undefined') {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: '', // Will be set during sign-in
      });
      resolve();
    } else {
      window.addEventListener('load', () => {
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: '', // Will be set during sign-in
        });
        resolve();
      });
    }
  });
};

export const signInWithGoogle = () => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Google Auth not initialized'));
      return;
    }

    tokenClient.callback = async (response) => {
      if (response.error !== undefined) {
        reject(new Error(response.error));
        return;
      }

      try {
        const userInfo = await fetchUserInfo(response.access_token);
        const user = {
          accessToken: response.access_token,
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture
        };
        
        localStorage.setItem('scholarly_user', JSON.stringify(user));
        resolve(user);
      } catch (error) {
        reject(error);
      }
    };

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

export const signOut = () => {
  localStorage.removeItem('scholarly_user');
  const user = getCurrentUser();
  if (user?.accessToken) {
    google.accounts.oauth2.revoke(user.accessToken);
  }
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('scholarly_user');
  return userStr ? JSON.parse(userStr) : null;
};

const fetchUserInfo = async (accessToken) => {
  const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }
  return response.json();
};