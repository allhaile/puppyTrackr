# 🐶 PuppyTrackr

A **professional, cloud-backed React app** for tracking your puppy's daily activities, meals, potty breaks, and more! Now with **real user authentication**, **multi-device sync**, and **family sharing**.

## ✨ Features

### 🔐 **New: Authentication & Cloud Sync**
- **📱 Phone Authentication** - Sign in with SMS verification codes
- **📧 Email Authentication** - Alternative login with email OTP
- **☁️ Cloud Storage** - All data synced across devices via Supabase
- **👨‍👩‍👧‍👦 Family Sharing** - Multiple users can track the same puppy
- **🎭 User Profiles** - Real profiles with avatars and display names
- **🔒 Secure Data** - Row Level Security protects your information

### 📱 **Core Features**
- **Mobile-First Design** - Optimized for phones and tablets
- **🏠 Daily Dashboard** - Beautiful overview of today's activities
- **📊 Activity Tracking** - Log meals, potty breaks, sleep, medicine, training, and notes
- **📈 Statistics** - Visual cards showing daily meal count, potty breaks, nap time, and energy level
- **📋 History View** - Browse past activities organized by date
- **⚙️ Settings** - Customize puppy name, manage family members, export data
- **📤 Data Export** - Export your data as JSON for backup

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- **Supabase account** (for authentication and data storage)

### Quick Setup

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/puppytrackr.git
cd puppytrackr-react
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up Supabase** (Important!):
   - Follow the detailed guide in `SUPABASE_SETUP.md`
   - Create `.env.local` with your Supabase credentials
   - Run the database schema in Supabase SQL editor

4. **Start the development server:**
```bash
npm run dev
```

5. **Open your browser** and visit `http://localhost:3000`
6. **Sign up/Sign in** using phone number or email

## 🔧 Configuration

### Environment Variables

Create `.env.local` in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Supabase Setup

**⚠️ Important**: This app requires Supabase for authentication and data storage. See `SUPABASE_SETUP.md` for complete setup instructions.

## 🛠️ Built With

- **React 18** - Modern React with hooks
- **Supabase** - Backend as a Service (auth, database, storage)
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons

## 📱 Usage

### First Time Setup

1. **Authentication**: Sign up with your phone number or email
2. **Verification**: Enter the code sent via SMS or email
3. **Profile**: Your profile is automatically created
4. **Puppy Setup**: Enter your puppy's name in settings

### Daily Usage

#### Logging Activities

1. Tap the **+** button in the bottom right
2. Select activity type (potty, meal, sleep, medicine, training, or note)
3. Add details and optional notes
4. Submit to log the activity

#### Family Sharing

1. Go to **Settings** tab
2. Share your puppy with family members
3. Each person signs up with their own account
4. Grant access to your puppy in settings
5. Everyone can now track activities with their real identity

#### Viewing History

- Use the **History** tab to browse past activities
- Activities are grouped by date for easy browsing
- Each entry shows the real user who logged it

### Multi-Device Usage

- **Sign in** on any device with the same phone/email
- **Your data syncs automatically** across all devices
- **Real-time updates** when family members add entries

## 🔄 Migration from localStorage Version

If upgrading from the localStorage version:

1. **Export your old data** from Settings before updating
2. **Follow Supabase setup** instructions
3. **Manually re-enter** important historical data (or create migration script)
4. **New data** will be automatically synced to the cloud

## 🎨 Avatar System

- **User avatars**: Upload profile pictures via Supabase Storage
- **Puppy avatars**: Add photos of your puppy (coming soon)
- **Automatic fallbacks**: Colored initials if no avatar uploaded

## 🌐 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automatically

### Netlify

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables in Netlify dashboard

## 🔐 Security Features

- **Row Level Security (RLS)** - Users can only access their own data
- **Phone/Email verification** - Prevents unauthorized access
- **Secure API keys** - Anon key is safe for client-side use
- **HTTPS everywhere** - All communication encrypted

## 🎯 Project Structure

```
src/
├── components/           # React components
│   ├── AuthWrapper.jsx   # Authentication wrapper
│   ├── LoginScreen.jsx   # Phone/email login
│   ├── LoadingScreen.jsx # Auth loading state
│   ├── Header.jsx
│   ├── HomeView.jsx
│   ├── HistoryView.jsx
│   ├── SettingsView.jsx
│   ├── QuickAddForm.jsx
│   ├── UserSelector.jsx
│   └── BottomNavigation.jsx
├── hooks/               # Custom React hooks
│   ├── useAuth.js       # Authentication management
│   ├── useSupabaseData.js # Cloud data management
│   ├── useLocalStorage.js # Legacy local storage
│   └── usePuppyData.js  # Legacy data hook
├── lib/                 # Configuration
│   └── supabase.js      # Supabase client setup
├── utils/               # Utility functions
│   └── helpers.js
├── App.jsx              # Main app component
├── main.jsx             # App entry point
└── index.css            # Global styles
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Troubleshooting

### Common Issues

1. **Login not working**: Check Supabase credentials in `.env.local`
2. **SMS not received**: Verify phone format (+1XXXXXXXXXX)
3. **Data not syncing**: Check browser console for errors
4. **Blank screen**: Ensure Supabase project is properly configured

### Getting Help

- **Setup Issues**: See `SUPABASE_SETUP.md` for detailed instructions
- **Bugs**: Open an issue on GitHub
- **Questions**: Check existing issues or create a new one

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Backend by [Supabase](https://supabase.com/)
- UI inspiration from modern mobile apps
- Built with love for puppy parents everywhere! 🐕‍🦺

## 📧 Contact

If you have any questions or need help, please open an issue or contact [your-email@example.com](mailto:your-email@example.com).

---

**Made with ❤️ for puppy parents**

*Now with cloud sync, real authentication, and family sharing!* 