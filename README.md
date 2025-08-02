# PuppyTrackr - Multi-Dog Household Edition

A **professional, cloud-backed React app** for tracking multiple dogs in your household. Perfect for families with multiple dogs, dog sitters, and multi-generational homes. Now with **household-centric design**, **magic link invites**, and **seamless multi-dog switching**.

## The Story: Collective Care, Shared Responsibility

**PuppyTrackr was born from a simple truth**: when multiple people care for a dog, communication and coordination become essential for the dog's wellbeing.

Whether it's a family with children learning responsibility, grandparents helping with daily care, dog sitters maintaining routines, or roommates sharing pet duties - **every caregiver's observations matter**. A puppy's potty schedule, eating habits, energy levels, and behavioral patterns provide crucial insights that help ensure proper care.

**Good stewardship means everyone stays informed.** When Dad takes the dog out in the morning, Mom knows it happened. When the kids feed the dog after school, the dog sitter arriving that evening knows not to feed again. When Grandma notices the dog seems low-energy, the family can track if this is part of a pattern.

This isn't just about convenience - it's about **responsible pet ownership** in households where care is shared. Every logged activity becomes part of a complete picture that helps families make better decisions about their dog's health, training, and happiness.

## Features

### Multi-Dog Household Management
- **One Household, Multiple Dogs** - Track all your dogs in one place
- **Easy Dog Switching** - Quick toggle between your dogs' profiles
- **Magic Link Invites** - Share a simple link to invite family members
- **Family Collaboration** - Everyone can log activities with their own identity
- **No Complex Signups** - Family members join with just their email and name

### Authentication & Cloud Sync
- **Phone Authentication** - Sign in with SMS verification codes
- **Email Authentication** - Alternative login with email OTP
- **Cloud Storage** - All data synced across devices via Supabase
- **Secure Data** - Row Level Security protects your household information

### Core Tracking Features
- **Mobile-First Design** - Optimized for phones and tablets
- **Multi-Dog Dashboard** - Beautiful overview of all your dogs' activities
- **Activity Tracking** - Log meals, potty breaks, sleep, medicine, training, and grooming
- **Statistics** - Visual cards showing daily stats for each dog
- **History View** - Browse past activities organized by date and dog
- **Settings** - Manage household, dogs, family members, and export data

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- **Supabase account** (for authentication and data storage)

### Quick Setup

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/puppytrackr-react.git
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

## How Multi-Dog Households Work

### Setting Up Your Household

1. **Sign up** with your email or phone number
2. **Your household is automatically created** (e.g., "John's Household")
3. **Add your first dog** using the dog selector in the header
4. **Get your invite link** by clicking the household button

### Inviting Family Members

1. Click the **household button** in the top-right corner
2. **Copy your invite link** (looks like: `https://yourapp.com/join/abc123`)
3. **Share the link** via text, email, or any messaging app
4. Family members click the link, enter their name, and **automatically join**

### Using the App as a Family

- **Switch between dogs** using the dog selector in the header
- **Each person logs activities** with their own name attached
- **Real-time sync** means everyone sees updates immediately
- **All dogs' data** is accessible to all household members

## Why This Matters: Responsible Collective Care

### For Families
- **Children learn responsibility** by participating in care documentation
- **Parents coordinate** schedules and responsibilities seamlessly
- **Grandparents and extended family** stay informed about routines
- **Everyone contributes** to a complete picture of the dog's wellbeing

### For Dog Sitters & Caregivers
- **Maintain established routines** with complete visibility into normal patterns
- **Document any concerns** for owners to review later
- **Access emergency information** like vet contacts and medical history
- **Provide detailed reports** of care provided

### For Multi-Generational Homes
- **Bridge communication gaps** between different caregivers
- **Ensure consistency** in feeding, medication, and exercise schedules
- **Track health patterns** that might only be visible over time
- **Share the load** of responsible pet ownership

## Configuration

Create `.env.local` in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Supabase Setup

**Important**: This app requires Supabase for authentication and data storage. See `SUPABASE_SETUP.md` for complete setup instructions.

## Built With

- **React 18** - Modern React with hooks
- **Supabase** - Backend as a Service (auth, database, storage)
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons

## Usage

### Setting Up Your Household

1. **Sign up** with your phone number or email
2. **Verify** with the code sent via SMS or email
3. **Your household is created automatically**
4. **Add your first dog** from the header dog selector

### Daily Usage

#### Adding Dogs
1. Click the **dog selector** in the header
2. Select **"Add another dog"**
3. Fill in your dog's information (name, breed, birth date, vet info, etc.)
4. **Switch between dogs** using the header dropdown

#### Logging Activities
1. Tap the **+ button** in the bottom right
2. Select activity type (potty, meal, sleep, medicine, training, grooming, or note)
3. Add details, mood, energy level, and notes
4. Submit to log the activity for the currently selected dog

#### Family Collaboration
1. Go to **Settings** tab - **"Manage Household"**
2. **Share your invite link** with family members
3. Each person creates their own account via the invite link
4. **Everyone can track all dogs** with their own identity in the logs

#### Viewing Data
- Use the **Home** tab to see today's stats for the selected dog
- Use the **Analytics** tab for trends and insights
- Use the **History** tab to browse past activities
- **Switch dogs** anytime to see different data

### Managing Your Household

#### Adding/Removing Members
- **Household owners** can remove members from settings
- **Generate new invite codes** to refresh access
- **View all members** with their roles and join dates

#### Data Export
- Export **all household data** as JSON from settings
- Includes all dogs, activities, and member information
- Perfect for vet visits or backing up your data

## Deployment

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

## Security Features

- **Row Level Security (RLS)** - Users can only access their household data
- **Email/Phone verification** - Prevents unauthorized access
- **Secure invite codes** - Magic links expire and can be regenerated
- **HTTPS everywhere** - All communication encrypted

## Project Structure

```
src/
├── components/           # React components
│   ├── AuthWrapper.jsx   # Authentication wrapper
│   ├── LoginScreen.jsx   # Phone/email login
│   ├── LoadingScreen.jsx # Auth loading state
│   ├── Header.jsx        # Header with dog selector
│   ├── HomeView.jsx      # Multi-dog dashboard
│   ├── HistoryView.jsx   # Activity history
│   ├── SettingsView.jsx  # Household settings
│   ├── DogSelector.jsx   # Dog switching component
│   ├── DogForm.jsx       # Add/edit dog form
│   ├── HouseholdInvite.jsx # Invite management
│   ├── InviteHandler.jsx # Magic link handler
│   ├── QuickAddForm.jsx  # Activity logging
│   └── BottomNavigation.jsx
├── hooks/               # Custom React hooks
│   ├── useAuth.js       # Authentication management
│   ├── useHouseholdData.js # Household & multi-dog data
│   ├── useSupabaseData.js # Cloud data management
│   └── useDarkMode.js   # Theme management
├── lib/                 # Configuration
│   └── supabase.js      # Supabase client setup
├── utils/               # Utility functions
│   └── helpers.js
└── App.jsx              # Main app component
```

## Migration from Single-Dog Version

If upgrading from a single-dog version:

1. **Export your old data** before updating
2. **Follow Supabase setup** instructions in `SUPABASE_SETUP.md`
3. **Your first dog** will be created automatically from your old puppy data
4. **Invite family members** using the new household system
5. **Import historical data** manually or create a migration script

## What's New in Multi-Dog Edition

- **Household-centric data model** instead of individual users
- **Magic link invites** for easy family onboarding
- **Dog switching** in the header for multi-dog households
- **Enhanced dog profiles** with medical information
- **Real-time collaboration** with user attribution
- **Improved settings** for household management
- **Better mobile experience** with responsive design

## Perfect For

- **Multi-dog families** 
- **Multi-generational households**
- **Professional dog sitters**
- **Veterinary record keeping**
- **Behavioral tracking across multiple dogs**
- **Anyone who believes in shared responsibility for pet care**

---

**Ready to become better stewards together?** Set up your household and invite your family to join in caring for your dogs with the attention and coordination they deserve. 