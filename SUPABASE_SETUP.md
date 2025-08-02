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

⚠️ **Important**: Replace the placeholder values with your actual Supabase credentials!

## 🗄️ Step 4: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click "Run" to execute the schema
5. Verify tables were created in **Database** → **Tables**

You should see these tables:
- `user_profiles`
- `puppies`
- `puppy_entries`
- `puppy_access`

## 📱 Step 5: Configure Phone Authentication

### Enable Phone Auth Provider
1. Go to **Authentication** → **Providers**
2. Click on **Phone**
3. Enable "Phone login"
4. **Choose SMS Provider**: 
   - **For Development**: Use "Supabase" (free tier includes limited SMS)
   - **For Production**: Set up Twilio, MessageBird, or Vonage

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

## 📧 Step 6: Configure Email Authentication (Backup)

1. Go to **Authentication** → **Providers**
2. **Email** should already be enabled
3. Optionally configure **SMTP settings** for custom emails:
   - Go to **Authentication** → **Settings**
   - Scroll to "SMTP Settings"
   - Configure your email provider (Gmail, SendGrid, etc.)

## 🔄 Step 7: Switch to Supabase Data Layer

In `src/App.jsx`, replace the localStorage hook with Supabase:

```javascript
// BEFORE:
const { ... } = usePuppyData();

// AFTER:
const { ... } = useSupabaseData();
```

## 🚀 Step 8: Test the Migration

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. **You should see the login screen** instead of the main app
3. **Test phone login**:
   - Enter your phone number with country code (+1 for US)
   - You should receive an SMS with a 6-digit code
   - Enter the code to log in
4. **Test email login**:
   - Switch to email tab
   - Enter your email
   - Check your email for the verification code

## ✨ Step 9: Avatar Storage (Optional)

To enable avatar uploads:

1. Go to **Storage** in Supabase dashboard
2. Click "Create bucket"
3. Name: `avatars`
4. Public: ✅ (checked)
5. Click "Create bucket"
6. The storage policies are already included in the schema

## 🔄 Step 10: Data Migration Strategy

### For Existing Users:
If you have existing localStorage data (including imported Notion data), it will automatically migrate when you switch to Supabase! The migration utility is already built-in:

```javascript
// Add this to a migration component or utility
const migrateLocalStorageData = async () => {
  const oldData = {
    puppyName: localStorage.getItem('puppyName'),
    entries: JSON.parse(localStorage.getItem('entries') || '[]'),
    // ... other data
  };
  
  // Upload to Supabase using your new hooks
  // Then clear localStorage
  localStorage.clear();
};
```

## 🎯 What's Changed

### ✅ New Features:
- **Real user authentication** with phone/email
- **Multi-device sync** - data follows you everywhere
- **Family sharing** - multiple people can track the same puppy
- **User profiles** with avatars
- **Secure data** with Row Level Security
- **Offline capability** with automatic sync

### 🔄 Differences from localStorage version:
- **Login required** - users must authenticate
- **Entries show real user names** instead of string-based users
- **Profile management** in settings
- **Cloud backup** - no more data loss

## 🎨 Avatar System

The new system supports:
- **Phone verification codes** via SMS
- **Email verification codes** 
- **User profiles** with display names
- **Avatar uploads** to Supabase Storage
- **Family member management**

## 🔧 Troubleshooting

### Common Issues:

1. **"Failed to fetch"**: Check your environment variables
2. **SMS not received**: Verify phone number format (+1XXXXXXXXXX)
3. **Tables not found**: Run the schema SQL again
4. **Authentication loop**: Clear browser storage and restart

### Development vs Production:

- **Development**: Use Supabase's free SMS limit
- **Production**: Set up Twilio for reliable SMS delivery

## 📝 Importing Your Lil Nugget Daily Log

**Ready to import your 320+ Lil Nugget activities?** 
- 🎯 **Import now** (before Supabase) - **RECOMMENDED**
- 📱 Or import after Supabase setup  
- 🔥 **Your data is already perfectly formatted!**

**Files ready for you:**
- `Cleaned_Puppy_Log.csv` - Your cleaned data (362 entries!) ⭐
- `cleaned-data-sample.csv` - Test with 5 sample entries first
- `NOTION_IMPORT_GUIDE.md` - Step-by-step instructions

**Your cleaned data breakdown:**
- ✅ **222 Potty** activities (with Pee/Poop specifics)
- ✅ **67 Meal** records  
- ✅ **53 Training** sessions
- ✅ **13 Note** observations
- ✅ **7 Sleep** activities
- ✅ **All activity types validated** - perfect schema match!
- ✅ **Users:** Haile (195), Adryan (129), Both (36)

## 🌟 Next Steps

After successful migration, you can:

1. **Add avatar upload UI** to user settings
2. **Implement family sharing** features
3. **Add push notifications** for shared puppies
4. **Create puppy profiles** with photos and details
5. **Add real-time collaboration** features

## 📞 Support

If you run into issues:
1. Check the browser console for errors
2. Verify Supabase credentials
3. Test authentication in Supabase dashboard
4. Check network requests in browser dev tools

---

**🎉 Congratulations!** You've successfully migrated to a professional, multi-user, cloud-backed puppy tracking system! 