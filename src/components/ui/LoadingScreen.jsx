import React from 'react'
import { motion } from 'framer-motion'

const LoadingScreen = ({ message = "Loading your pet's world..." }) => {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="text-center">
        <motion.div
          className="w-16 h-16 mx-auto mb-4"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-secondary" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground"
        >
          {message}
        </motion.p>
      </div>
    </div>
  )
}

export default LoadingScreen