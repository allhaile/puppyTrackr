import React from 'react'

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-neutral-25 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-lg">PT</span>
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-neutral-600">Loading PuppyTrackr...</p>
      </div>
    </div>
  )
}

export default LoadingScreen 