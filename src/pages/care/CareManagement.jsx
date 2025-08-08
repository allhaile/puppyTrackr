import React from 'react'
import { motion } from 'framer-motion'

const CareManagement = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold mb-6">Care Management</h1>
        <div className="glass-card">
          <p className="text-muted-foreground">Care management features coming soon...</p>
        </div>
      </motion.div>
    </div>
  )
}

export default CareManagement