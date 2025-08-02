import React, { useState } from 'react'
import { Phone, Mail, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const LoginScreen = () => {
  const [method, setMethod] = useState('phone') // 'phone' | 'email'
  const [step, setStep] = useState('input') // 'input' | 'verify'
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signInWithPhone, signInWithEmail, verifyOtp, verifyEmailOtp } = useAuth()

  const handleSendOTP = async () => {
    setLoading(true)
    setError('')

    try {
      let result
      if (method === 'phone') {
        if (!phoneNumber.startsWith('+')) {
          setError('Please include country code (e.g., +1 for US)')
          setLoading(false)
          return
        }
        result = await signInWithPhone(phoneNumber)
      } else {
        if (!email.includes('@')) {
          setError('Please enter a valid email address')
          setLoading(false)
          return
        }
        result = await signInWithEmail(email)
      }

      if (result.error) {
        setError(result.error.message)
      } else {
        setStep('verify')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
    
    setLoading(false)
  }

  const handleVerifyOTP = async () => {
    setLoading(true)
    setError('')

    try {
      let result
      if (method === 'phone') {
        result = await verifyOtp(phoneNumber, otp)
      } else {
        result = await verifyEmailOtp(email, otp)
      }

      if (result.error) {
        setError(result.error.message)
      }
      // If successful, useAuth will handle the state change
    } catch (err) {
      setError('Invalid verification code. Please try again.')
    }
    
    setLoading(false)
  }

  const resetForm = () => {
    setStep('input')
    setOtp('')
    setError('')
    setPhoneNumber('')
    setEmail('')
  }

  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-neutral-25 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">PT</span>
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">Enter Verification Code</h1>
              <p className="text-neutral-600">
                We sent a code to {method === 'phone' ? phoneNumber : email}
              </p>
            </div>

            {/* OTP Input */}
            <div className="space-y-6">
              <div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
                  maxLength={6}
                />
              </div>

              {error && (
                <div className="p-3 bg-error-50 border border-error-200 rounded-lg">
                  <p className="text-error-700 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Verify Code</span>
                  </>
                )}
              </button>

              <button
                onClick={resetForm}
                className="w-full text-neutral-600 hover:text-neutral-900 font-medium py-2 transition-colors duration-200"
              >
                Back to login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-25 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">PT</span>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Welcome to PuppyTrackr</h1>
            <p className="text-neutral-600">Sign in to track your puppy's activities</p>
          </div>

          {/* Method Toggle */}
          <div className="flex bg-neutral-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setMethod('phone')}
              className={`flex-1 py-2 px-3 rounded-md font-medium text-sm transition-colors duration-200 flex items-center justify-center space-x-2 ${
                method === 'phone'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Phone</span>
            </button>
            <button
              onClick={() => setMethod('email')}
              className={`flex-1 py-2 px-3 rounded-md font-medium text-sm transition-colors duration-200 flex items-center justify-center space-x-2 ${
                method === 'email'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </button>
          </div>

          {/* Input Form */}
          <div className="space-y-6">
            {method === 'phone' ? (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-neutral-500 mt-1">Include country code (e.g., +1 for US)</p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-error-50 border border-error-200 rounded-lg">
                <p className="text-error-700 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleSendOTP}
              disabled={loading || (method === 'phone' ? !phoneNumber : !email)}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-neutral-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen 