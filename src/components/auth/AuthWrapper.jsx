import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import LoadingScreen from '../ui/LoadingScreen'
import Icon from '../ui/Icon'

const AuthWrapper = ({ children }) => {
  const { isAuthenticated, loading, signInWithEmail, signInWithPhone, verifyOtp, error } = useAuth()
  const [authStep, setAuthStep] = useState('method') // 'method', 'email', 'phone', 'verify'
  const [contactInfo, setContactInfo] = useState('')
  const [otp, setOtp] = useState('')
  const [authMethod, setAuthMethod] = useState('')

  if (loading) {
    return <LoadingScreen message="Checking authentication..." />
  }

  if (isAuthenticated) {
    return children
  }

  const handleSendOTP = async () => {
    let result
    if (authMethod === 'email') {
      result = await signInWithEmail(contactInfo)
    } else {
      result = await signInWithPhone(contactInfo)
    }

    if (result.success) {
      setAuthStep('verify')
    }
  }

  const handleVerifyOTP = async () => {
    const result = await verifyOtp({
      [authMethod === 'email' ? 'email' : 'phone']: contactInfo,
      token: otp,
      type: authMethod === 'email' ? 'email' : 'sms'
    })

    if (result.success) {
      // User will be redirected automatically due to auth state change
    }
  }

  const AuthMethodSelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Welcome to PuppyTrackr</h2>
        <p className="text-muted-foreground">
          Track your puppy's activities and share with your family
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => {
            setAuthMethod('email')
            setAuthStep('email')
          }}
          className="w-full flex items-center justify-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <Icon name="mail" size={20} />
          <span>Continue with Email</span>
        </button>

        <button
          onClick={() => {
            setAuthMethod('phone')
            setAuthStep('phone')
          }}
          className="w-full flex items-center justify-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <Icon name="phone" size={20} />
          <span>Continue with Phone</span>
        </button>
      </div>

      <div className="text-xs text-muted-foreground text-center">
        <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
        <p className="mt-1">We'll send you a verification code to sign in.</p>
      </div>
    </motion.div>
  )

  const ContactForm = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">
          Enter your {authMethod === 'email' ? 'email' : 'phone number'}
        </h2>
        <p className="text-muted-foreground">
          We'll send you a verification code to sign in
        </p>
      </div>

              <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {authMethod === 'email' ? 'Email Address' : 'Phone Number'}
            </label>
            <input
              type={authMethod === 'email' ? 'email' : 'tel'}
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder={authMethod === 'email' ? 'your@email.com' : '+1 (555) 123-4567'}
              className="input w-full"
              autoFocus
            />
          </div>

          <div className="min-h-[60px]">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

        <div className="space-y-3">
          <button
            onClick={handleSendOTP}
            disabled={!contactInfo.trim()}
            className="w-full btn-primary disabled:opacity-50"
          >
            Send Verification Code
          </button>

          <button
            onClick={() => setAuthStep('method')}
            className="w-full btn-ghost"
          >
            Back
          </button>
        </div>
      </div>
    </motion.div>
  )

  const VerificationForm = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Enter verification code</h2>
        <p className="text-muted-foreground">
          We sent a code to {contactInfo}
        </p>
      </div>

              <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit code"
              className="input w-full text-center text-lg tracking-wider"
              maxLength={6}
              autoFocus
            />
          </div>

          <div className="min-h-[60px]">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

        <div className="space-y-3">
          <button
            onClick={handleVerifyOTP}
            disabled={otp.length < 6}
            className="w-full btn-primary disabled:opacity-50"
          >
            Verify & Sign In
          </button>

          <button
            onClick={handleSendOTP}
            className="w-full btn-ghost text-sm"
          >
            Resend Code
          </button>

          <button
            onClick={() => setAuthStep(authMethod)}
            className="w-full btn-ghost text-sm"
          >
            Change {authMethod === 'email' ? 'Email' : 'Phone Number'}
          </button>
        </div>
      </div>
    </motion.div>
  )

  const getCurrentForm = () => {
    switch (authStep) {
      case 'method':
        return <AuthMethodSelection />
      case 'email':
      case 'phone':
        return <ContactForm />
      case 'verify':
        return <VerificationForm />
      default:
        return <AuthMethodSelection />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      {/* Background watermark */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.06]"
        style={{
          backgroundImage: 'url(/puppyTrackr-icon.png)',
          backgroundPosition: 'center',
          backgroundSize: '200px',
          backgroundRepeat: 'repeat',
          zIndex: 0
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
              <Icon name="pet" className="text-white" size={32} />
            </div>
            <h1 className="text-xl font-bold">PuppyTrackr</h1>
          </div>

          <AnimatePresence mode="wait">
            {getCurrentForm()}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default AuthWrapper 