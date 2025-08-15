import React, { useState, useCallback } from 'react'

const Logo = ({ size = 64, className = '' }) => {
  const sources = [
    '/puppyTrackr-Logo-v1.svg',
    '/puppyTrackr-Logo-v1.png',
    '/puppyTrackr-icon.png'
  ]
  const [index, setIndex] = useState(0)

  const handleError = useCallback(() => {
    setIndex((prev) => (prev < sources.length - 1 ? prev + 1 : prev))
  }, [sources.length])

  return (
    <img
      src={sources[index]}
      alt="PuppyTrackr Logo"
      width={size}
      height={size}
      onError={handleError}
      className={`inline-block ${className}`}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  )
}

export default Logo 