# PuppyTrackr 🐶

A comprehensive Progressive Web App (PWA) for tracking your puppy's daily care activities and milestones. Built with Next.js, TypeScript, Tailwind CSS, and Prisma.

## 🚀 Quick Start

**Test the app immediately:**
1. Follow the [Getting Started](#-getting-started) instructions below
2. Use these **test credentials**:
   - **Email**: `test@test.com`
   - **Password**: `password123`
3. For mobile testing, see [Mobile Testing & Access](#-mobile-testing--access)
4. For production deployment, see [Deploy to Vercel](#deploy-to-vercel-recommended)

## ✨ Features

- **Daily Timeline UI**: Log feeding, walks, naps, medications, grooming, and training activities
- **Multi-Caregiver Support**: Track who performed each activity with caregiver field
- **Milestones Tracking**: Record weight progress with interactive charts and milestone photos  
- **Progressive Web App**: Offline support, Add-to-Home-Screen, and mobile-optimized experience
- **Secure Authentication**: JWT-based auth with secure HTTP-only cookies
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Weight Charts**: Visual progress tracking with Chart.js
- **Database Persistence**: SQLite/PostgreSQL support via Prisma ORM

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT with bcryptjs
- **PWA**: next-pwa for service worker and offline support
- **Charts**: Chart.js with react-chartjs-2
- **Forms**: React Hook Form with Zod validation
- **Icons**: Heroicons

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd puppyTrackr
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"
   
   # Authentication (change these in production!)
   JWT_SECRET="your-super-secret-jwt-secret-change-this-in-production"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret-change-this-in-production"
   
   # File Upload
   UPLOAD_DIR="./public/uploads"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📱 Mobile Testing & Access

### Local Network Access

To test the app on your phone while developing:

1. **Update dev script** (already configured):
   ```bash
   npm run dev  # Now runs with -H 0.0.0.0
   ```

2. **Find your local IP address**:
   ```bash
   # On macOS/Linux:
   ifconfig | grep "inet " | grep -v 127.0.0.1
   # Look for something like: inet 192.168.1.215
   ```

3. **Access from phone**:
   - Connect phone to same WiFi network
   - Open browser and go to: `http://YOUR_LOCAL_IP:3000`
   - Example: `http://192.168.1.215:3000`

### Global Access with ngrok

For testing from anywhere or sharing with others:

1. **Install ngrok**:
   ```bash
   # macOS with Homebrew:
   brew install ngrok
   
   # Or download from: https://ngrok.com/download
   ```

2. **Set up ngrok auth token**:
   ```bash
   ngrok config add-authtoken YOUR_TOKEN
   # Get token from: https://dashboard.ngrok.com/get-started/your-authtoken
   ```

3. **Start ngrok tunnel**:
   ```bash
   # In a new terminal window:
   ngrok http 3000
   ```

4. **Access your app**:
   - ngrok will display a public URL like: `https://abc123.ngrok-free.app`
   - Open this URL on any device, anywhere in the world
   - Click "Visit Site" if you see an ngrok warning page

5. **Install as PWA**:
   - **iPhone**: Safari → Share → "Add to Home Screen"
   - **Android**: Chrome → Menu → "Install App" or "Add to Home Screen"

### Test Credentials

Use these credentials for testing:
- **Email**: `test@test.com`
- **Password**: `password123`

## 📱 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

### Database Commands

- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply new migration
- `npx prisma db push` - Push schema changes without migration
- `npx prisma generate` - Regenerate Prisma client

### Project Structure

```
puppyTrackr/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── icon-192x192.png       # PWA icons
│   └── icon-512x512.png
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── care-logs/     # Care log CRUD
│   │   │   └── milestones/    # Milestone CRUD
│   │   ├── dashboard/         # Main timeline UI
│   │   ├── milestones/        # Charts & milestone management
│   │   ├── login/             # Authentication pages
│   │   └── register/
│   ├── components/            # Reusable components
│   │   └── Navigation.tsx
│   ├── lib/                   # Utilities & configurations
│   │   ├── auth.ts            # JWT & password utilities
│   │   ├── prisma.ts          # Database client
│   │   └── types.ts           # TypeScript definitions
│   └── middleware.ts          # Auth middleware
├── next.config.js             # Next.js + PWA config
└── tailwind.config.ts         # Tailwind CSS config
```

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
```

### Deploy to Vercel (Recommended)

1. **Prepare for deployment**
   ```bash
   # Test the production build locally first
   npm run build
   npm start
   ```

2. **Connect to GitHub** (Optional but recommended):
   - Push your code to a GitHub repository
   - This enables automatic deployments on code changes

3. **Deploy via GitHub (Recommended)**:
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Next.js project

4. **OR Deploy via CLI**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy from your project directory
   vercel
   
   # Follow the prompts:
   # - Link to existing project? [y/N] N
   # - What's your project's name? puppytrackr
   # - In which directory is your code located? ./
   ```

5. **Set up PostgreSQL Database**:

   **Option A: Vercel Postgres (Easiest)**
   ```bash
   # In your Vercel dashboard:
   # Go to Storage tab → Create Database → Postgres
   # Copy the POSTGRES_PRISMA_URL provided
   ```

   **Option B: External Provider (PlanetScale, Neon, etc.)**
   ```bash
   # Example for Neon.tech:
   # 1. Create account at neon.tech
   # 2. Create new project
   # 3. Copy connection string
   ```

6. **Configure Environment Variables**:
   
   In your Vercel project settings → Environment Variables, add:
   
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@host:5432/database"
   
   # Authentication (generate secure random strings!)
   JWT_SECRET="your-super-secure-jwt-secret-here-change-this"
   NEXTAUTH_SECRET="your-nextauth-secret-here-change-this"
   NEXTAUTH_URL="https://your-app-name.vercel.app"
   
   # Optional: File uploads
   UPLOAD_DIR="./public/uploads"
   ```

   **Generate secure secrets**:
   ```bash
   # Generate random secrets (run these locally):
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

7. **Run Database Migrations**:
   ```bash
   # After setting up DATABASE_URL in Vercel:
   npx prisma migrate deploy
   
   # Or if using Vercel CLI:
   vercel env pull .env.local  # Pull env vars locally
   npx prisma migrate deploy    # Run migrations
   ```

8. **Create Initial User** (Optional):
   ```bash
   # SSH into Vercel deployment or run locally with production DB:
   npx prisma studio
   # Or create user via register page on your deployed app
   ```

9. **Custom Domain** (Optional):
   ```bash
   # In Vercel dashboard:
   # Go to Settings → Domains
   # Add your custom domain (e.g., puppytrackr.com)
   ```

### Deployment Checklist

✅ **Before deploying:**
- [ ] Test `npm run build` locally
- [ ] Verify all environment variables are set
- [ ] Database is accessible and migrations run
- [ ] Test authentication flow
- [ ] PWA features work (manifest, service worker)

✅ **After deploying:**
- [ ] Visit your deployed app URL
- [ ] Test registration/login
- [ ] Test PWA installation on mobile
- [ ] Verify all features work in production

### Troubleshooting Deployment

**Build fails?**
```bash
# Check build locally first:
npm run build

# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Prisma client not generated
```

**Database connection issues?**
```bash
# Test connection string locally:
npx prisma db push

# Check:
# - DATABASE_URL format is correct
# - Database is accessible from Vercel's region
# - Connection limits not exceeded
```

**Authentication not working?**
- Ensure `JWT_SECRET` and `NEXTAUTH_SECRET` are set
- Verify `NEXTAUTH_URL` matches your deployed domain
- Check cookies are being set (use browser dev tools)

### Production URL

Your PuppyTrackr app will be available at:
- **Vercel URL**: `https://your-project-name.vercel.app`
- **Custom Domain**: `https://your-domain.com` (if configured)

### Alternative: Docker Deployment

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/puppytrackr
      - JWT_SECRET=your-secret-here
      - NEXTAUTH_SECRET=your-nextauth-secret-here
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=puppytrackr
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

Deploy with:
```bash
docker-compose up -d
```

## 📱 PWA Testing

### Test PWA Features

1. **Development Testing**
   ```bash
   npm run build
   npm start
   ```
   Navigate to `http://localhost:3000`

2. **Install Prompt**
   - Open in Chrome/Edge
   - Look for install prompt or "+" icon in address bar
   - Click "Install PuppyTrackr"

3. **Offline Support**
   - Install the app
   - Open DevTools → Network tab
   - Enable "Offline" mode
   - App should continue working with cached content

4. **Mobile Testing**
   - Use Chrome DevTools device emulation
   - Test touch interactions and responsive design
   - Verify manifest and service worker in Application tab

### PWA Audit

Run Lighthouse audit for PWA compliance:
1. Open Chrome DevTools
2. Navigate to "Lighthouse" tab
3. Select "Progressive Web App" category
4. Click "Generate report"

## 🔧 Configuration

### Database Options

**SQLite (Development)**
```env
DATABASE_URL="file:./dev.db"
```

**PostgreSQL (Production)**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/puppytrackr"
```

### PWA Customization

Edit `public/manifest.json` to customize:
- App name and description
- Theme colors
- App shortcuts
- Display mode

### Authentication

The app uses JWT tokens stored in HTTP-only cookies for security. Update `JWT_SECRET` in production with a strong random string.

## 🎯 Usage

1. **Registration**: Create account with email/password
2. **Dashboard**: Add daily care logs with activity type, caregiver, and notes
3. **Timeline Navigation**: Browse activities by date
4. **Milestones**: Record weight measurements and special moments
5. **Charts**: View puppy growth progress over time
6. **Multi-Caregiver**: Track which family member performed each activity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
- Ensure DATABASE_URL is correct
- Run `npx prisma generate` after schema changes
- Check database permissions

**PWA Not Installing**
- Ensure HTTPS in production (required for PWA)
- Check manifest.json syntax
- Verify service worker registration

**Build Failures**
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

## 🌟 Roadmap

- [ ] Photo upload functionality
- [ ] Email notifications for reminders
- [ ] Multiple puppy support
- [ ] Data export features
- [ ] Vaccination tracking
- [ ] Vet appointment scheduling

---

Built with ❤️ for puppy parents everywhere! 🐕
