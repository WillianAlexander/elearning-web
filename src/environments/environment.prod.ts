export const environment = {
  production: true,
  staging: false,
  devMode: false,
  apiUrl: 'https://api-lms.spayzly.pro/api/v1',
  azure: {
    clientId: 'f0c9e043-990e-4213-b740-ae078665f8c3',
    authority: 'https://login.microsoftonline.com/1c82b496-37c3-4c4b-97ca-77aa4a47ab2f',
    redirectUri: 'https://elearning.spayzly.pro/auth/callback',
    scopes: ['openid', 'profile', 'email', 'User.Read'],
  },
};
