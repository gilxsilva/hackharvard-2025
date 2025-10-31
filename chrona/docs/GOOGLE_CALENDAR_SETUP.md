# Google Calendar Integration Setup Guide

## 🎯 Overview

This guide walks you through setting up the Google Calendar integration for Chrona. After completing these steps, users will be able to:

1. Upload a course syllabus (PDF/DOCX/TXT)
2. Have Gemini AI parse it into structured events
3. Review and edit events
4. Add all events to their Google Calendar with one click

---

## ✅ Prerequisites

Before you begin, ensure you have:

- A Google Cloud Platform account
- Access to the Google Cloud Console
- Admin access to this Next.js project

---

## 🔧 Step 1: Google Cloud Console Setup

### 1.1 Create/Select a Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your **Project ID** for later

### 1.2 Enable Google Calendar API

1. Navigate to **APIs & Services > Library**
2. Search for "Google Calendar API"
3. Click **Enable**

### 1.3 Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth Client ID**
3. If prompted, configure the OAuth consent screen first:
   - User Type: **External** (for public apps) or **Internal** (for workspace-only)
   - App name: **Chrona**
   - User support email: Your email
   - Developer contact: Your email

4. After consent screen setup, create OAuth Client ID:
   - Application type: **Web application**
   - Name: **Chrona Web Client**
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     https://yourdomain.com
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     https://yourdomain.com/api/auth/callback/google
     ```

5. Click **Create** and save your:
   - **Client ID**
   - **Client Secret**

### 1.4 Configure OAuth Consent Screen Scopes

1. Go to **APIs & Services > OAuth consent screen**
2. Click **Edit App**
3. In the "Scopes" section, click **Add or Remove Scopes**
4. Add these scopes:
   - `openid`
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/calendar.events`

5. Save and continue

### 1.5 Add Test Users (If Using External User Type)

If you selected "External" for user type and haven't published the app:

1. Go to **OAuth consent screen > Test users**
2. Add your Gmail address and any team members' emails
3. Only these users can sign in during development

---

## 🔐 Step 2: Environment Variables

Add these to your `.env.local` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here

# Gemini API (you already have this)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key_here
```

### Generate NextAuth Secret

Run this command to generate a random secret:

```bash
openssl rand -base64 32
```

Or use Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🚀 Step 3: Testing the Integration

### 3.1 Start Development Server

```bash
npm run dev
```

### 3.2 Test the Flow

1. Navigate to `http://localhost:3000/calendar`
2. Upload a sample syllabus PDF
3. Review the extracted events
4. Select your timezone
5. Click "Add to Google Calendar"
6. Sign in with Google when prompted
7. Grant permissions when asked
8. Verify events appear in your Google Calendar

---

## 🐛 Common Issues & Solutions

### Issue: "Access blocked: This app's request is invalid"

**Solution:** Check your OAuth consent screen configuration:
- Ensure all required fields are filled
- Verify scopes are correctly added
- Make sure redirect URIs match exactly (trailing slashes matter!)

### Issue: "redirect_uri_mismatch"

**Solution:**
1. Check that your `.env.local` has correct `NEXTAUTH_URL`
2. Verify redirect URI in Google Console matches: `{NEXTAUTH_URL}/api/auth/callback/google`
3. For production, add your production domain

### Issue: "invalid_grant" or Token Refresh Errors

**Solution:**
- This happens when users revoke access
- User needs to sign out and sign in again
- Check that `access_type: 'offline'` and `prompt: 'consent'` are set in NextAuth config

### Issue: Events not appearing in calendar

**Solution:**
1. Check browser console for errors
2. Verify the API response in Network tab
3. Check if timezone is correctly detected
4. Look for 403/401 errors (permission issues)

### Issue: "Quota exceeded" error

**Solution:**
- Google Calendar API has a quota of 10,000 requests/day
- For large deployments, request quota increase in Google Cloud Console
- The batch API helps reduce quota usage

---

## 📊 Monitoring & Quotas

### Check API Usage

1. Go to **APIs & Services > Dashboard**
2. Click on **Google Calendar API**
3. View traffic and quota usage

### Request Quota Increase

If you need more than 10,000 requests/day:

1. Go to **APIs & Services > Quotas**
2. Search for "Calendar API"
3. Select the quota you want to increase
4. Click **Edit Quotas** and submit a request

---

## 🔒 Security Best Practices

### 1. Never Commit Secrets

Ensure `.env.local` is in your `.gitignore`:

```
.env.local
.env.*.local
```

### 2. Use Environment Variables

Never hardcode API keys or secrets in your code.

### 3. Restrict API Keys

In Google Cloud Console:
1. Go to **APIs & Services > Credentials**
2. Click on your OAuth client
3. Set application restrictions and API restrictions

### 4. Implement Rate Limiting

The integration already includes:
- Exponential backoff for retries
- Batch processing (50 events per batch)
- Rate limiting delays between requests

---

## 📈 Production Deployment

### Before Deploying

1. **Publish OAuth Consent Screen:**
   - Go to OAuth consent screen in Google Console
   - Click **Publish App**
   - Submit for verification if needed

2. **Add Production Redirect URI:**
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

3. **Update Environment Variables:**
   ```env
   NEXTAUTH_URL=https://yourdomain.com
   ```

4. **Test with Multiple Users:**
   - Ensure permissions work for all users
   - Monitor API quota usage

---

## 🧪 Testing Checklist

Before going live, test these scenarios:

- [ ] User can upload PDF/DOCX/TXT syllabi
- [ ] Gemini correctly parses events
- [ ] Events have correct timezones
- [ ] User can edit events before syncing
- [ ] Sign-in flow works smoothly
- [ ] Permission grants are clear
- [ ] Events appear in Google Calendar
- [ ] Events have correct colors (exams=red, classes=blue, etc.)
- [ ] Reminders are set appropriately
- [ ] Token refresh works (test after 1 hour)
- [ ] Error messages are user-friendly
- [ ] Multiple syllabi can be uploaded in succession

---

## 🎓 Advanced Features

### Custom Calendar Selection

Currently, events are added to the user's primary calendar. To allow users to select a calendar:

1. Request `https://www.googleapis.com/auth/calendar.readonly` scope
2. Fetch user's calendar list:
   ```typescript
   const response = await fetch(
     'https://www.googleapis.com/calendar/v3/users/me/calendarList',
     {
       headers: { Authorization: `Bearer ${accessToken}` }
     }
   );
   ```
3. Let user choose a `calendarId` before syncing

### Recurring Events

The current implementation creates individual events. To create recurring events:

```typescript
{
  summary: "CS 101 Lecture",
  start: { dateTime: "2025-10-10T10:00:00-04:00" },
  end: { dateTime: "2025-10-10T11:00:00-04:00" },
  recurrence: [
    "RRULE:FREQ=WEEKLY;UNTIL=20251215T235959Z;BYDAY=MO,WE,FR"
  ]
}
```

### Event Deletion/Updates

To allow users to delete or update synced events, you need to:
1. Store event IDs returned from Google Calendar API
2. Implement delete/update endpoints
3. Use these endpoints:
   - Update: `PUT https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/{eventId}`
   - Delete: `DELETE https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/{eventId}`

---

## 📚 Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
- [OAuth 2.0 for Web Apps](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Event Colors Reference](https://developers.google.com/calendar/api/v3/reference/colors)

---

## 🆘 Support

If you encounter issues not covered here:

1. Check the browser console for errors
2. Review API logs in Google Cloud Console
3. Check NextAuth debug logs (set `debug: true` in NextAuth config)
4. Verify all scopes are granted in user's Google Account settings

---

## 🎉 You're Done!

Your Google Calendar integration is now ready. Users can seamlessly add syllabus events to their Google Calendar with AI-powered parsing!
