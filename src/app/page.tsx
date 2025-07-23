'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { HeartIcon } from '@heroicons/react/24/outline'

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  const [showInstallButton, setShowInstallButton] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstallButton(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex justify-center mb-8">
            <HeartIcon className="h-16 w-16 text-blue-600" />
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            PuppyTrackr
          </h1>
          
          <p className="text-xl text-gray-600 mb-12">
            Track your puppy&apos;s daily care activities, milestones, and growth journey. 
            Perfect for multi-caregiver households and keeping everyone in sync.
          </p>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Daily Timeline</h3>
              <p className="text-gray-600">Log feeding, walks, naps, medications, grooming, and training activities.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Multi-Caregiver</h3>
              <p className="text-gray-600">Track who did what and when, perfect for families and shared care.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Growth Milestones</h3>
              <p className="text-gray-600">Record weight, photos, and special moments in your puppy&apos;s journey.</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              href="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Sign In
            </Link>
          </div>

          {/* PWA Install Button */}
          {showInstallButton && (
            <div className="bg-white p-4 rounded-lg shadow-md border border-blue-200 inline-block">
              <p className="text-sm text-gray-600 mb-3">
                Install PuppyTrackr for the best experience!
              </p>
              <button
                onClick={handleInstall}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Install App
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
