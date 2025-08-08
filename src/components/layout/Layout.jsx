import React from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from './Header'
import BottomNav from './BottomNav'
import FloatingActionButton from './FloatingActionButton'

const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
      {/* Watermark background */}
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
      
      <div className="relative z-10">
        <Header />
        
        <main className="pb-20 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>

        <FloatingActionButton />
        <BottomNav />
      </div>
    </div>
  )
}

export default Layout