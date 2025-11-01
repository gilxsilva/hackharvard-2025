# Google Sign-In Deployment Issues - Troubleshooting Guide

## The Problem
After deployment, users can sign in with Google but get stuck on the loading page at:
`https://chrona-beta.vercel.app/launch?callbackUrl=%2Fdashboard`

## Root Causes
1. **Missing NEXTAUTH_URL**: NextAuth requires explicit URL configuration in production
2. **Google OAuth Redirect URI**: Must be configured for production domain
3. **Middleware redirect loops**: Can cause infinite redirects in production

## Solutions Applied

### 1. Fixed NextAuth Configuration
- Added explicit `redirect` callback to handle URLs properly
- Added error page configuration
- Improved JWT and session handling

### 2. Updated Middleware
- Better handling of callbackUrl parameter
- Prevents redirect loops
- Proper authentication checks

### 3. Enhanced Launch Page
- Better error handling and display
- Proper redirect logic with callbackUrl support
- Loading states improved

## Required Environment Variables for Vercel

In your Vercel dashboard, add these environment variables:

```bash
NEXTAUTH_URL=https://chrona-beta.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Edit your OAuth 2.0 Client ID
5. Add these Authorized redirect URIs:
   - `https://chrona-beta.vercel.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for development)

## Testing Steps

1. Deploy the updated code to Vercel
2. Set the environment variables in Vercel dashboard
3. Update Google OAuth redirect URIs
4. Test the sign-in flow
5. Check browser console for any remaining errors

## Additional Debugging

If issues persist, check:
1. Vercel function logs for errors
2. Browser console for JavaScript errors
3. Network tab for failed API calls
4. Ensure all environment variables are set correctly

## Common Issues

- **Redirect URI Mismatch**: Make sure Google OAuth URIs match exactly
- **NEXTAUTH_SECRET**: Generate a secure random string
- **Domain Configuration**: Ensure NEXTAUTH_URL matches your deployment URL