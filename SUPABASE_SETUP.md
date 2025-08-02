# 🚀 Supabase Migration Setup Guide

This guide will help you migrate PuppyTrackr from localStorage to Supabase with phone/email authentication and real user profiles.

## 📋 Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Node.js 18+**: Already installed ✅
3. **Supabase CLI** (optional but recommended): `npm install -g supabase`

## 🛠️ Step 1: Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `puppytrackr` (or your preference)
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait 2-3 minutes for setup to complete

## 🔑 Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like `https://abcdefg.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## 📝 Step 3: Configure Environment Variables

Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Replace the placeholder values with your actual Supabase credentials!

## 🗄️ Step 4: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click "Run" to execute the schema
5. Verify tables were created in **Database** → **Tables**

You should see these tables:
- `user_profiles`
- `households`
- `household_members`
- `puppies`
- `puppy_entries`

## 📧 Step 5: Configure Email Authentication (IMPORTANT!)

### Fix the Magic Link Issue

By default, Supabase sends magic links instead of OTP codes. To fix this:

1. Go to **Authentication** → **Settings**
2. Scroll down to **"Auth Providers"** section
3. Find **"Enable email confirmations"**
4. **UNCHECK** the following options:
   - ✅ **Enable email confirmations** (keep this checked)
   - ❌ **Secure email change** (uncheck this)
   - ❌ **Enable email change confirmations** (uncheck this)

5. Scroll down to **"Email Templates"**
6. Click **"Confirm signup"**
7. **Replace the template** with this OTP-only version:

```html
<h2>Your verification code</h2>
<p>Your 6-digit verification code is: <strong>{{ .Token }}</strong></p>
<p>This code will expire in 60 minutes.</p>
<p>If you didn't request this, please ignore this email.</p>
```

8. **Disable the confirmation URL** by removing this line if it exists:
   ```html
   <p><a href="{{ .ConfirmationURL }}">Confirm your account</a></p>
   ```

9. Click **"Save"**

### Alternative: Configure OTP-Only Mode

If the above doesn't work, try this approach:

1. Go to **Authentication** → **Settings** 
2. Scroll to **"Auth Providers"**
3. Click **"Email"**
4. **Enable**: "Email OTP"
5. **Disable**: "Magic Link" (if the option exists)
6. Save changes

## 📱 Step 6: Configure Phone Authentication

### Enable Phone Auth Provider
1. Go to **Authentication** → **Providers**
2. Click on **Phone**
3. Enable "Phone login"
4. **Choose SMS Provider**: 
   - **For Development**: Use "Supabase" (free tier includes limited SMS)

### For Twilio Setup (Recommended for Production):
1. Sign up at [twilio.com](https://twilio.com)
2. Get your Account SID and Auth Token
3. In Supabase Phone settings:
   - **Provider**: Twilio
   - **Account SID**: Your Twilio Account SID
   - **Auth Token**: Your Twilio Auth Token
   - **From Number**: Your Twilio phone number

### Configure Phone Settings:
- **Confirm phone**: Enable this
- **Phone change**: Enable if you want users to change numbers
- **SMS OTP expiry**: 60 seconds (default)
- **SMS template**: Customize your OTP message

## 🔄 Step 7: Test the Authentication

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. **You should see the login screen** instead of the main app

3. **Test email login**:
   - Switch to email tab
   - Enter your email
   - **You should now receive a 6-digit code** instead of a magic link
   - Enter the code to log in

4. **Test phone login** (if configured):
   - Enter your phone number with country code (+1 for US)
   - You should receive an SMS with a 6-digit code
   - Enter the code to log in

## ✨ Step 8: Avatar Storage (Optional)

To enable avatar uploads:

1. Go to **Storage** in Supabase dashboard
2. Click "Create bucket"
3. Name: `avatars`
4. Public: ✅ (checked)
5. Click "Create bucket"
6. The storage policies are already included in the schema

## 🔄 Step 9: Data Migration Strategy

### For Existing Users:

If you have existing localStorage data, you can:

1. **Export from the old app** using the export feature
2. **Manually re-enter** critical data like dog profiles
3. **Import historical entries** using the CSV import feature (if available)

### New Users:

1. **Sign up** creates automatic household
2. **Add your first dog** using the dog selector
3. **Invite family members** using household invite links

## 🚨 Troubleshooting

### Still Getting Magic Links?

If you're still receiving magic links instead of OTP codes:

1. **Clear your browser cache** and try again
2. **Check Supabase logs**: Go to **Authentication** → **Logs** to see what's happening
3. **Try incognito mode** to test with fresh browser state
4. **Contact support**: Supabase Discord or GitHub issues

### Magic Link Not Working?

If you want to use the magic link you received:

1. **Copy the entire URL** from your email
2. **Paste it in your browser address bar**
3. It should automatically log you in

### Phone Auth Not Working?

1. **Check SMS provider setup** in Supabase dashboard
2. **Verify phone number format**: Must include country code (e.g., +15551234567)
3. **Check Supabase usage limits** - free tier has limited SMS

## 🎯 Ready to Go!

Once authentication is working:

1. **Create your household** (automatic on first login)
2. **Add your first dog** using the header dog selector  
3. **Share household invite link** with family members
4. **Start tracking** your dogs' activities together!

---

**Need help?** Check the troubleshooting section above or open an issue on GitHub. 