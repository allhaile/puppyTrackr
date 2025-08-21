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
- **Email OTP (magic link/code)** - Passwordless sign-in via Supabase
- **Cloud Storage** - All data synced across devices via Supabase
- **Secure Data** - Row Level Security protects your household information
- **Owner Controls** - Owner can manage members and roles

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
   - Create a new Supabase project
   - In Project Settings → API, copy your URL and anon key into a `.env.local` file
   - Open the SQL editor and run the contents of `supabase-schema.sql`
   - Confirm tables/functions exist: `households`, `household_members`, `puppies`, `puppy_entries`, and RPCs `join_household_by_invite`, `get_household_members`, `set_member_role`

4. **Create `.env.local` in your project root:**
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

5. **Start the development server:**
```bash
npm run dev
```

6. **Open your browser** and visit `http://localhost:3000`
7. **Sign in** using your email (OTP/magic code)

## Architecture

- **Frontend**: React 18 + Vite, React Router 7, Framer Motion, Tailwind CSS
- **State/Modules**:
  - Contexts: `AuthContext` (auth + household), `PetContext` (pets + activities), `ThemeContext`
  - Hooks: `useSupabaseAuth` (OTP auth + profile), `useHousehold` (memberships, members, dogs), `useActivities` (entries CRUD + derived stats)
  - Light Zustand stores for legacy/auxiliary state in `src/stores/`
- **Backend (Supabase/Postgres)**:
  - Tables: `user_profiles`, `households`, `household_members`, `puppies`, `puppy_entries`
  - RLS: scoped to `auth.uid()` and household memberships; explicit INSERT policies for `households`, `puppies`, and `puppy_entries`
  - RPC/Triggers: `handle_new_user` (auto profile + household), `join_household_by_invite`, `get_household_members` (safe membership read), `set_member_role`

## How Multi-Dog Households Work

### Setting Up Your Household

1. **Sign up** with your email
2. **Your household is automatically created** (e.g., "John's Household")
3. **Add your first dog** using the dog selector in the header
4. **Get your invite link** by clicking the household button

### Inviting Family Members

1. Click the **household button** in the top-right corner
2. **Copy your invite link** (looks like: `https://yourapp.com/join/abc123`)
3. **Share the link** via text, email, or any messaging app
4. Family members click the link and **automatically join** after sign-in

### Using the App as a Family

- **Switch between dogs** using the dog selector in the header
- **Each person logs activities** with their own name attached
- **Near real-time view** via optimistic updates; Realtime subscriptions planned for MVP
- **All dogs' data** is accessible to all household members

## Configuration

Create `.env.local` in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Supabase Setup

Run `supabase-schema.sql` in the Supabase SQL Editor to create tables, RLS policies, triggers, and RPCs. Ensure Realtime is enabled for the `public` schema (Database → Replication → Realtime) if you plan to use live updates.

## Built With

- **React 18** - Modern React with hooks
- **React Router 7** - File/component-based routing
- **Supabase** - Auth, Postgres, RPC, RLS
- **Vite** - Fast dev server and build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Zustand** - Lightweight state where needed

## Usage

### Setting Up Your Household

1. **Sign up** with your email
2. **Verify** with the code sent to your email
3. **Your household is created automatically**
4. **Add your first dog** from the header dog selector

### Daily Usage

#### Adding Dogs
1. Click the **dog selector** in the header
2. Select **"Add New Pet"**
3. Fill in your dog's information (name, breed, avatar)
4. **Switch between dogs** using the header dropdown

#### Logging Activities
1. Tap the **+ button** or use quick actions on the dashboard
2. Select activity type (potty, meal, sleep, medicine, training, grooming, play)
3. Add details and notes
4. Save to log the activity for the current dog

#### Family Collaboration
1. Go to **Settings → Household**
2. **Share your invite link** with family members
3. Each person signs in via email OTP
4. **Everyone can track all dogs** with their own identity in the logs

#### Viewing Data
- Use the **Home** tab for today's stats for the selected dog
- Use **Analytics** for trends (MVP simplified)
- **Switch dogs** anytime to see different data

### Managing Your Household

#### Adding/Removing Members
- **Household owners** can remove members and change roles
- **Generate new invite codes** to refresh access
- **View all members** with their roles and join dates

#### Data Export
- Export options planned for post-MVP

## Realtime Sync (MVP Path)

Current app uses optimistic updates after writes and periodic fetch. For true multi-user live sync:
- Enable Realtime for `public` schema and add replicas for tables: `puppy_entries`, `puppies`, `household_members`
- Subscribe in the client and merge changes into local state

Example subscription (to be implemented):
```js
import { supabase } from './lib/supabase'

const channel = supabase
  .channel('household-stream')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'puppy_entries', filter: `puppy_id=eq.${activeDogId}` }, payload => {
    // merge payload.new/payload.old into activities state
  })
  .subscribe()
```

## Project Structure

```
src/
├── App.jsx
├── main.jsx
├── contexts/
│   ├── AuthContext.jsx
│   ├── PetContext.jsx
│   └── ThemeContext.jsx
├── hooks/
│   ├── useSupabaseAuth.js
│   ├── useHousehold.js
│   └── useActivities.js
├── components/
│   ├── auth/
│   │   └── AuthWrapper.jsx
│   ├── household/
│   │   ├── HouseholdSetup.jsx
│   │   └── InviteHandler.jsx
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── BottomNav.jsx
│   │   ├── FloatingActionButton.jsx
│   │   └── Layout.jsx
│   └── ui/
│       ├── ErrorBoundary.jsx
│       ├── LoadingScreen.jsx
│       ├── Logo.jsx
│       └── Icon.jsx
├── pages/
│   ├── dashboard/
│   │   ├── Dashboard.jsx
│   │   ├── ActivityFeed.jsx
│   │   ├── QuickStats.jsx
│   │   ├── InsightsBanner.jsx
│   │   └── WeatherWidget.jsx
│   ├── logging/
│   │   └── ActivityLogging.jsx
│   ├── profile/
│   │   └── PetProfile.jsx
│   ├── analytics/
│   │   └── AnalyticsSimple.jsx
│   ├── care/
│   │   └── CareManagement.jsx
│   └── settings/
│       └── Settings.jsx
├── stores/
│   ├── activityStore.js
│   └── petStore.js
├── lib/
│   ├── supabase.js
│   └── dogBreeds.js
└── styles/
    └── globals.css
```

## Security Features

- **Row Level Security (RLS)** - Users can only access their household data
- **Email verification** - Passwordless OTP sign-in
- **Invite codes** - Owners can regenerate codes at any time
- **RPC layer** - `get_household_members` avoids recursive RLS issues; `set_member_role` enforces owner-only role changes

## Testing & To-Dos (MVP)

### Testing Strategy
- **Unit tests** (Vitest/Jest): hooks (`useSupabaseAuth`, `useHousehold`, `useActivities`) with mocked Supabase client
- **Integration tests**: auth → household setup → add dog → add activity flows
- **E2E tests** (Playwright/Cypress):
  - Two users in the same household
  - User A logs activity; User B sees update (with Realtime once implemented)
  - Invite acceptance flow via `/join/:code`

### To-Dos Before MVP
- [ ] Implement Supabase Realtime subscriptions for `puppy_entries`, `puppies`, and `household_members`
- [ ] Add optimistic UI rollback on write failures
- [ ] Write unit tests for core hooks
- [ ] Add E2E happy paths for two-user household scenario
- [ ] Add loading/empty states polish across pages
- [ ] Document environment setup and troubleshooting (ports, HMR)

---

**Ready to become better stewards together?** Set up your household and invite your family to join in caring for your dogs with the attention and coordination they deserve. 