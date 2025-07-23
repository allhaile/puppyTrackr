import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PuppyTrackr',
  description: 'Track your puppy\'s daily care activities and milestones',
  generator: 'Next.js',
  manifest: '/manifest.json',
  keywords: ['puppy', 'pet care', 'tracking', 'milestones', 'progressive web app'],
  authors: [
    {
      name: 'PuppyTrackr Team',
    },
  ],
  icons: {
    icon: '/icon-192x192.svg',
    apple: '/icon-192x192.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  minimumScale: 1,
  initialScale: 1,
  width: 'device-width',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.svg" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}
