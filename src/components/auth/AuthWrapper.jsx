import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import LoadingScreen from '../ui/LoadingScreen'
import Icon from '../ui/Icon'

const AuthWrapper = ({ children }) => {
  const { isAuthenticated, loading, signInWithEmail, signInWithPhone, verifyOtp, error } = useAuth()
  const [authStep, setAuthStep] = useState('method') // 'method', 'email', 'phone', 'verify'
  const [contactInfo, setContactInfo] = useState('')
  const [authMethod, setAuthMethod] = useState('')
  const [localError, setLocalError] = useState('')
  
  // Use ref to prevent re-renders - store current value without triggering re-renders
  const inputRef = useRef(null)
  const contactInfoRef = useRef('')
  const otpRef = useRef('')
  const containerRef = useRef(null)

  // Prevent viewport jumping on mobile
  useEffect(() => {
    const handleViewportChange = () => {
      if (containerRef.current) {
        const vh = window.innerHeight * 0.01
        containerRef.current.style.setProperty('--vh', `${vh}px`)
      }
    }

    // Set initial height
    handleViewportChange()

    // Listen for viewport changes
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('orientationchange', handleViewportChange)

    // Prevent scrolling when keyboard appears
    const preventScroll = (e) => {
      if (e.target.tagName === 'INPUT') {
        e.preventDefault()
        e.target.scrollIntoView({ behavior: 'instant', block: 'center' })
      }
    }

    document.addEventListener('focusin', preventScroll)

    return () => {
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('orientationchange', handleViewportChange)
      document.removeEventListener('focusin', preventScroll)
    }
  }, [])

  // All hooks must be called before any early returns
  const handleInputChange = useCallback((e) => {
    // Store value in ref without triggering re-render
    contactInfoRef.current = e.target.value
    // Removed setHasInput to eliminate re-renders
  }, [])

  const handleOtpInputChange = useCallback((e) => {
    // Store in ref to prevent re-renders
    otpRef.current = e.target.value
  }, [])

  const handleSendOTPClick = useCallback(async () => {
    // Get current value from ref and update state only when needed
    const currentValue = contactInfoRef.current.trim()
    
    // Simple validation - show error if empty
    if (!currentValue) {
      setLocalError('Please enter your ' + (authMethod === 'email' ? 'email' : 'phone number'))
      return
    }
    
    setContactInfo(currentValue) // This will trigger ONE re-render
    
    setLocalError('') // Clear local error
    let result
    if (authMethod === 'email') {
      result = await signInWithEmail(currentValue)
    } else {
      result = await signInWithPhone(currentValue)
    }

    if (result.success) {
      setAuthStep('verify')
    } else {
      setLocalError(result.error || 'An error occurred')
    }
  }, [authMethod, signInWithEmail, signInWithPhone])

  const handleSendOTP = useCallback(async () => {
    setLocalError('') // Clear local error
    let result
    if (authMethod === 'email') {
      result = await signInWithEmail(contactInfo)
    } else {
      result = await signInWithPhone(contactInfo)
    }

    if (result.success) {
      setAuthStep('verify')
    } else {
      setLocalError(result.error || 'An error occurred')
    }
  }, [authMethod, contactInfo, signInWithEmail, signInWithPhone])

  const handleVerifyOTP = useCallback(async () => {
    const currentOtp = otpRef.current.trim()
    
    // Simple validation
    if (currentOtp.length < 6) {
      setLocalError('Please enter the complete 6-digit code')
      return
    }
    
    setLocalError('') // Clear local error
    const result = await verifyOtp({
      [authMethod === 'email' ? 'email' : 'phone']: contactInfo,
      token: currentOtp,
      type: authMethod === 'email' ? 'email' : 'sms'
    })

    if (result.success) {
      // User will be redirected automatically due to auth state change
    } else {
      setLocalError(result.error || 'Verification failed')
    }
  }, [authMethod, contactInfo, verifyOtp])

  // Early returns must come AFTER all hooks
  if (loading) {
    return <LoadingScreen message="Checking authentication..." />
  }

  if (isAuthenticated) {
    return children
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

  const ContactForm = React.memo(() => (
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
            ref={inputRef}
            key={`contact-input-${authMethod}`}
            type={authMethod === 'email' ? 'email' : 'tel'}
            defaultValue=""
            onChange={handleInputChange}
            placeholder={authMethod === 'email' ? 'your@email.com' : '+1 (555) 123-4567'}
            className="input w-full"
            style={{ fontSize: '16px' }}
            autoComplete="off"
            autoFocus
          />
        </div>

        <div className="h-[76px] flex items-start">
          {(localError || error) && (
            <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {localError || error}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSendOTPClick}
            className="w-full btn-primary"
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
  ))

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
        {process.env.NODE_ENV === 'development' && (
          <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
            Development: If email is empty, try codes: 123456 or 000000
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Verification Code
          </label>
          <input
            type="text"
            defaultValue=""
            onChange={handleOtpInputChange}
            placeholder="Enter 6-digit code"
            className="input w-full text-center text-lg tracking-wider"
            style={{ fontSize: '16px' }}
            maxLength={6}
            autoComplete="off"
            autoFocus
          />
        </div>

        <div className="h-[76px] flex items-start">
          {(localError || error) && (
            <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {localError || error}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleVerifyOTP}
            className="w-full btn-primary"
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
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4"
      style={{ 
        minHeight: 'calc(var(--vh, 1vh) * 100)',
        position: 'relative'
      }}
    >
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
          className="glass-card min-h-[500px] flex flex-col"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
              <Icon name="pet" className="text-white" size={32} />
            </div>
            <h1 className="text-xl font-bold">PuppyTrackr</h1>
          </div>

          <div className="flex-1 flex items-center">
            <div className="w-full">
              <AnimatePresence mode="wait">
                {getCurrentForm()}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AuthWrapper 