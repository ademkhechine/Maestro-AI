import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Music, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import type { ParsedScore } from '../../utils/musicParser'
import { parseMusicXML, parseMIDI, midiToScore } from '../../utils/musicParser'

interface Props {
  onScoreLoaded: (score: ParsedScore, imageUrl?: string) => void
  onClose: () => void
}

type UploadState = 'idle' | 'loading' | 'success' | 'error'

export default function MusicSheetUploader({ onScoreLoaded, onClose }: Props) {
  const [state, setState] = useState<UploadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [loadedTitle, setLoadedTitle] = useState<string | null>(null)

  const processFile = useCallback(async (file: File) => {
    setState('loading')
    setError(null)
    const name = file.name.toLowerCase()

    try {
      // ── MusicXML ──────────────────────────────────────────────────────────
      if (name.endsWith('.xml') || name.endsWith('.musicxml') || name.endsWith('.mxl')) {
        let xmlString: string
        if (name.endsWith('.mxl')) {
          // Compressed MusicXML — try reading as text (some are uncompressed zip)
          xmlString = await file.text()
          if (!xmlString.includes('<score-partwise') && !xmlString.includes('<score-timewise')) {
            throw new Error('Compressed .mxl files require server-side decompression. Please export as .xml instead.')
          }
        } else {
          xmlString = await file.text()
        }
        const score = parseMusicXML(xmlString)
        setLoadedTitle(score.title)
        setState('success')
        setTimeout(() => { onScoreLoaded(score); onClose() }, 900)

      // ── MIDI ──────────────────────────────────────────────────────────────
      } else if (name.endsWith('.mid') || name.endsWith('.midi')) {
        const buffer = await file.arrayBuffer()
        const midi = parseMIDI(buffer)
        const title = file.name.replace(/\.(mid|midi)$/i, '')
        const score = midiToScore(midi, title)
        setLoadedTitle(score.title)
        setState('success')
        setTimeout(() => { onScoreLoaded(score); onClose() }, 900)

      // ── Image / PDF (show as reference overlay) ───────────────────────────
      } else if (name.match(/\.(png|jpg|jpeg|webp|pdf)$/)) {
        const url = URL.createObjectURL(file)
        const imageName = file.name.replace(/\.[^.]+$/, '')
        // Create a placeholder score with the image title for reference viewing
        const placeholderScore: ParsedScore = {
          title: imageName,
          composer: '',
          clef: 'treble',
          keyFifths: 0,
          keyMode: 'major',
          timeBeats: 4,
          timeBeatType: 4,
          divisions: 4,
          measures: [],
          tempoMarking: 120
        }
        setLoadedTitle(imageName)
        setState('success')
        setTimeout(() => { onScoreLoaded(placeholderScore, url); onClose() }, 900)

      } else {
        throw new Error('Unsupported file format. Please upload a .xml, .mxl, .mid, .midi, .pdf, or image file.')
      }
    } catch (err: any) {
      setError(err.message ?? 'Failed to parse the file.')
      setState('error')
    }
  }, [onScoreLoaded, onClose])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  return (
    <motion.div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(13,10,8,0.92)', backdropFilter: 'blur(20px)'
      }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        className="card"
        style={{
          width: '100%', maxWidth: '560px', padding: '32px',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: '20px',
          position: 'relative'
        }}
        initial={{ scale: 0.88, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.88, y: 24 }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', display: 'flex'
          }}
        >
          <X size={18} />
        </button>

        <div>
          <span className="badge badge-gold" style={{ marginBottom: '8px' }}>Import Sheet Music</span>
          <h2 className="heading-lg" style={{ color: 'var(--text-primary)' }}>Upload Your Music Sheet</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Supports MusicXML, MIDI, and image formats. Maestro AI will parse, render, and track your notes in real-time.
          </p>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: '16px',
            padding: '40px 20px',
            textAlign: 'center',
            background: dragOver ? 'rgba(212,163,95,0.05)' : 'var(--bg-surface)',
            transition: 'all 0.2s',
            cursor: 'pointer',
            position: 'relative'
          }}
          onClick={() => document.getElementById('sheet-upload-input')?.click()}
        >
          <input
            id="sheet-upload-input"
            type="file"
            accept=".xml,.mxl,.musicxml,.mid,.midi,.pdf,.png,.jpg,.jpeg,.webp"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {state === 'idle' && (
            <>
              <Upload size={32} style={{ color: 'var(--primary)', marginBottom: '12px', margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                Drop your sheet music here
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                or click to browse
              </p>
            </>
          )}

          {state === 'loading' && (
            <motion.div
              animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'inline-block', fontSize: '2rem' }}
            >
              🎼
            </motion.div>
          )}

          {state === 'success' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={32} style={{ color: 'var(--success)' }} />
              <p style={{ fontWeight: 700, color: 'var(--success)' }}>{loadedTitle}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Loading into practice session...</p>
            </motion.div>
          )}

          {state === 'error' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={32} style={{ color: 'var(--error)' }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--error)', fontWeight: 600 }}>Parse Error</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', maxWidth: '380px' }}>{error}</p>
              <button className="btn-secondary" style={{ marginTop: '8px', fontSize: '0.78rem' }}
                onClick={e => { e.stopPropagation(); setState('idle'); setError(null) }}>
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Format chips */}
        <div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Supported Formats
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[
              { label: 'MusicXML (.xml)', desc: 'Full notation, notes, dynamics', icon: <FileText size={12} />, color: 'var(--primary)' },
              { label: 'MIDI (.mid)', desc: 'Note timing and pitch', icon: <Music size={12} />, color: '#818CF8' },
              { label: 'Image / PDF', desc: 'Visual reference overlay', icon: <Upload size={12} />, color: '#22C55E' },
            ].map(f => (
              <div key={f.label} style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px',
                padding: '8px 12px', borderRadius: '10px',
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                flex: '1 1 140px'
              }}>
                <div style={{ color: f.color, marginTop: '1px' }}>{f.icon}</div>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{f.label}</p>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
