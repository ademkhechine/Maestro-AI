import { motion } from 'framer-motion'

interface Props {
  heatmap: Record<string, 'green' | 'yellow' | 'red'>
}

const colorMap = {
  green: { bg: 'rgba(34,197,94,0.25)', border: 'rgba(34,197,94,0.4)', label: 'Correct' },
  yellow: { bg: 'rgba(245,158,11,0.25)', border: 'rgba(245,158,11,0.4)', label: 'Needs Work' },
  red: { bg: 'rgba(239,68,68,0.25)', border: 'rgba(239,68,68,0.4)', label: 'Incorrect' },
}

export default function HeatmapViewer({ heatmap }: Props) {
  const measures = Object.entries(heatmap)

  return (
    <motion.div className="card p-6"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="heading-md" style={{ color: 'var(--text-primary)' }}>Performance Heatmap</h3>
        <div className="flex gap-4">
          {Object.entries({ green: 'Correct', yellow: 'Needs Work', red: 'Incorrect' }).map(([color, label]) => (
            <div key={color} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm"
                style={{ background: colorMap[color as keyof typeof colorMap].bg, border: `1px solid ${colorMap[color as keyof typeof colorMap].border}` }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {measures.map(([measure, color], i) => (
          <motion.div key={measure}
            className="rounded-lg flex flex-col items-center gap-1 p-2 cursor-pointer"
            style={{
              width: '52px',
              background: colorMap[color].bg,
              border: `1px solid ${colorMap[color].border}`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, type: 'spring' }}
            whileHover={{ scale: 1.1 }}
            title={`Measure ${measure}: ${colorMap[color].label}`}
          >
            <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>M{measure}</span>
            <div className="text-base">
              {color === 'green' ? '✓' : color === 'yellow' ? '~' : '✗'}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
