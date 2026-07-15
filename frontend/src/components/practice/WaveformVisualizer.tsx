import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function WaveformVisualizer() {
  const bars = Array.from({ length: 32 }, (_, i) => i)

  return (
    <motion.div
      className="card p-6 flex items-center justify-center gap-1"
      style={{ minHeight: '80px' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className="waveform-bar"
          animate={{ height: [8, Math.random() * 40 + 10, 8] }}
          transition={{
            duration: 0.4 + Math.random() * 0.3,
            repeat: Infinity,
            repeatType: 'mirror',
            delay: i * 0.05,
          }}
          style={{ background: 'var(--primary)' }}
        />
      ))}
    </motion.div>
  )
}
