import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import {
  Upload, Search, Grid, List, Star, StarOff, Play,
  Folder, Plus, Music, FileText, CheckCircle2, Loader2, AlertCircle, Trash2
} from 'lucide-react'

interface Piece {
  id: string
  title: string
  composer?: string
  instrument?: string
  difficulty?: string
  tempo_bpm?: number
  key_signature?: string
  time_signature?: string
  total_measures?: number
  is_favorite: boolean
  is_mastered: boolean
  omr_status: string
  best_score: number
  total_practice_sessions: number
  folder?: string
  created_at: string
}

const getInstrumentIcon = (instr?: string) => {
  const i = instr?.toLowerCase()
  if (i === 'piano') return '🎹'
  if (i === 'violin') return '🎻'
  if (i === 'guitar') return '🎸'
  if (i === 'voice') return '🎤'
  if (i === 'oud') return '🎵'
  if (i === 'qanun') return '🎼'
  if (i === 'nay') return '💨'
  return '🎶'
}

function DifficultyBadge({ level }: { level?: string }) {
  if (!level) return null
  const l = level.charAt(0).toUpperCase() + level.slice(1)
  const colors: Record<string, string> = {
    Beginner: 'var(--success)', Intermediate: 'var(--warning)',
    Advanced: 'var(--error)', Virtuoso: '#818CF8',
  }
  const color = colors[l] || 'var(--primary)'
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '5px',
      background: `${color}18`, color, border: `1px solid ${color}30`,
    }}>{l}</span>
  )
}

export default function LibraryPage() {
  const navigate = useNavigate()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('All')
  const [showUpload, setShowUpload] = useState(false)
  const [pieces, setPieces] = useState<Piece[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Upload form state
  const [uploadStep, setUploadStep] = useState<'idle' | 'form' | 'uploading' | 'processing' | 'done'>('idle')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadForm, setUploadForm] = useState({ title: '', composer: '', folder: 'My Library' })

  const loadPieces = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await api.get('/api/v1/pieces')
      setPieces(res.data)
    } catch {
      setError('Failed to load library. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadPieces() }, [loadPieces])

  const toggleFavorite = async (id: string, current: boolean) => {
    try {
      await api.patch(`/api/v1/pieces/${id}`, { is_favorite: !current })
      setPieces(prev => prev.map(p => p.id === id ? { ...p, is_favorite: !p.is_favorite } : p))
    } catch { /* silent */ }
  }

  const deletePiece = async (id: string) => {
    if (!confirm('Delete this piece from your library?')) return
    try {
      await api.delete(`/api/v1/pieces/${id}`)
      setPieces(prev => prev.filter(p => p.id !== id))
    } catch { /* silent */ }
  }

  const handleUpload = async () => {
    if (!uploadFile || !uploadForm.title) return
    setUploadStep('uploading')
    try {
      const fd = new FormData()
      fd.append('file', uploadFile)
      fd.append('title', uploadForm.title)
      if (uploadForm.composer) fd.append('composer', uploadForm.composer)
      fd.append('folder', uploadForm.folder)
      setUploadStep('processing')
      await api.post('/api/v1/pieces/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setUploadStep('done')
      await loadPieces()
    } catch {
      setUploadStep('idle')
      alert('Upload failed. Please try again.')
    }
  }

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) {
      setUploadFile(accepted[0])
      setUploadForm(f => ({ ...f, title: accepted[0].name.replace(/\.[^/.]+$/, '') }))
      setUploadStep('form')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': [], 'image/*': [] }, multiple: false
  })

  const folders = ['All', ...Array.from(new Set(pieces.map(p => p.folder || 'My Library').filter(Boolean)))]

  const filtered = pieces.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.title.toLowerCase().includes(q) || (p.composer || '').toLowerCase().includes(q)
    const matchFolder = selectedFolder === 'All' || p.folder === selectedFolder
    return matchSearch && matchFolder
  })

  return (
    <div className="page-stack">
      {/* Header */}
      <motion.div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div>
          <h1 className="heading-lg" style={{ color: 'var(--text-primary)' }}>Music Library</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {pieces.length} pieces · Upload PDFs and images for AI-powered notation recognition.
          </p>
        </div>
        <button onClick={() => { setShowUpload(true); setUploadStep('idle'); setUploadFile(null) }}
          className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Upload Score
        </button>
      </motion.div>

      {/* Controls bar */}
      <div className="card" style={{ padding: '14px 16px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or composer..."
            className="input" style={{ paddingLeft: '36px', width: '100%', fontSize: '0.875rem' }} />
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {folders.map(f => (
            <button key={f} onClick={() => setSelectedFolder(f)} className="btn-ghost"
              style={{
                fontSize: '0.75rem', padding: '5px 11px', borderRadius: '8px',
                background: selectedFolder === f ? 'rgba(212,163,95,0.12)' : 'transparent',
                color: selectedFolder === f ? 'var(--primary)' : 'var(--text-secondary)',
                border: `1px solid ${selectedFolder === f ? 'var(--primary)' : 'var(--border)'}`,
                display: 'inline-flex', alignItems: 'center', gap: '4px'
              }}>
              <Folder size={11} />{f}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '3px', marginLeft: 'auto' }}>
          {(['grid', 'list'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className="btn-ghost"
              style={{ padding: '7px', color: view === v ? 'var(--primary)' : 'var(--text-muted)' }}>
              {v === 'grid' ? <Grid size={15} /> : <List size={15} />}
            </button>
          ))}
        </div>
      </div>

      {/* Upload modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setShowUpload(false); setUploadStep('idle') }}>
            <motion.div className="card"
              style={{ maxWidth: '480px', width: '90%', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}
              initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}
              onClick={e => e.stopPropagation()}>
              <div>
                <h3 className="heading-md" style={{ color: 'var(--text-primary)' }}>AI OMR Engine</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Upload PDF or image. Optical Music Recognition will parse notes, measures, key and time signatures.
                </p>
              </div>

              {uploadStep === 'idle' && (
                <div {...getRootProps()} style={{
                  border: `2px dashed ${isDragActive ? 'var(--primary)' : 'var(--border)'}`,
                  background: isDragActive ? 'rgba(212,163,95,0.06)' : 'var(--bg-surface)',
                  borderRadius: '12px', padding: '40px 16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s'
                }}>
                  <input {...getInputProps()} />
                  <Upload size={30} style={{ color: isDragActive ? 'var(--primary)' : 'var(--text-muted)', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Drop file or click to browse</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>PDF, PNG, JPEG up to 50MB</p>
                </div>
              )}

              {uploadStep === 'form' && uploadFile && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', fontSize: '0.8rem', color: 'var(--success)' }}>
                    📄 {uploadFile.name} selected
                  </div>
                  <div>
                    <label className="input-label">Title *</label>
                    <input value={uploadForm.title} onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))}
                      className="input" placeholder="e.g. Moonlight Sonata" />
                  </div>
                  <div>
                    <label className="input-label">Composer</label>
                    <input value={uploadForm.composer} onChange={e => setUploadForm(f => ({ ...f, composer: e.target.value }))}
                      className="input" placeholder="e.g. Beethoven" />
                  </div>
                  <div>
                    <label className="input-label">Folder</label>
                    <input value={uploadForm.folder} onChange={e => setUploadForm(f => ({ ...f, folder: e.target.value }))}
                      className="input" placeholder="My Library" />
                  </div>
                  <button onClick={handleUpload} className="btn-primary" disabled={!uploadForm.title}
                    style={{ justifyContent: 'center' }}>
                    <Upload size={14} /> Upload & Analyze
                  </button>
                </div>
              )}

              {uploadStep === 'uploading' && (
                <div style={{ textAlign: 'center', padding: '28px 0' }}>
                  <FileText size={32} style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Uploading file...</p>
                </div>
              )}

              {uploadStep === 'processing' && (
                <div style={{ textAlign: 'center', padding: '28px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                    <Music size={32} style={{ color: 'var(--primary)' }} />
                  </motion.div>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>AI parsing notation...</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Detecting staffs, converting to MusicXML</p>
                </div>
              )}

              {uploadStep === 'done' && (
                <div style={{ textAlign: 'center', padding: '28px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={36} style={{ color: 'var(--success)' }} />
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Upload Successful!</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Your piece has been added to the library.</p>
                  <button onClick={() => { setShowUpload(false); setUploadStep('idle') }} className="btn-primary" style={{ marginTop: '8px' }}>
                    View in Library
                  </button>
                </div>
              )}

              {(uploadStep === 'idle' || uploadStep === 'form') && (
                <button onClick={() => { setShowUpload(false); setUploadStep('idle') }} className="btn-ghost" style={{ justifyContent: 'center' }}>
                  Cancel
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading / Error states */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', gap: '12px' }}>
          <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
          <span style={{ color: 'var(--text-muted)' }}>Loading your library...</span>
        </div>
      )}

      {error && !loading && (
        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <AlertCircle size={32} style={{ color: 'var(--error)', marginBottom: '8px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{error}</p>
          <button onClick={loadPieces} className="btn-secondary" style={{ marginTop: '12px' }}>Retry</button>
        </div>
      )}

      {/* Grid view */}
      {!loading && !error && view === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {filtered.map((piece, i) => (
            <motion.div key={piece.id} className="card"
              style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3, borderColor: 'var(--border-hover)' }}>

              <div style={{ height: '80px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem' }}>
                {getInstrumentIcon(piece.instrument)}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{piece.title}</h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{piece.composer || 'Unknown Composer'}</p>
                </div>
                <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                  <button onClick={() => toggleFavorite(piece.id, piece.is_favorite)} className="btn-ghost" style={{ padding: '4px' }}>
                    {piece.is_favorite
                      ? <Star size={15} style={{ color: 'var(--primary)', fill: 'var(--primary)' }} />
                      : <StarOff size={15} style={{ color: 'var(--text-muted)' }} />}
                  </button>
                  <button onClick={() => deletePiece(piece.id)} className="btn-ghost" style={{ padding: '4px' }}>
                    <Trash2 size={13} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <DifficultyBadge level={piece.difficulty} />
                {piece.omr_status === 'done' && (
                  <span className="badge badge-success" style={{ fontSize: '0.62rem' }}>✓ Parsed</span>
                )}
                {piece.omr_status === 'processing' && (
                  <span className="badge badge-warning" style={{ fontSize: '0.62rem' }}>⏳ Processing</span>
                )}
                {piece.omr_status === 'pending' && (
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Pending OMR</span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)', padding: '8px 0', borderTop: '1px solid var(--border)' }}>
                {piece.tempo_bpm && <div>♩ <strong>{piece.tempo_bpm} BPM</strong></div>}
                {piece.key_signature && <div>🎵 <strong>{piece.key_signature}</strong></div>}
                {piece.total_measures && <div>📏 <strong>{piece.total_measures} bars</strong></div>}
                <div>🎯 <strong>{piece.best_score > 0 ? `${piece.best_score}%` : '—'}</strong></div>
              </div>

              <button onClick={() => navigate(`/practice/${piece.id}`)} className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '8px 0' }}>
                <Play size={13} /> Practice
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* List view */}
      {!loading && !error && view === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map((piece, i) => (
            <motion.div key={piece.id} className="card"
              style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <div style={{ fontSize: '1.6rem', width: '44px', height: '44px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {getInstrumentIcon(piece.instrument)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{piece.title}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{piece.composer || 'Unknown'} · {piece.key_signature || '—'} · {piece.tempo_bpm ? `${piece.tempo_bpm} BPM` : '—'}</div>
              </div>
              <DifficultyBadge level={piece.difficulty} />
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: piece.best_score >= 85 ? 'var(--success)' : 'var(--text-secondary)', width: '70px', textAlign: 'right', flexShrink: 0 }}>
                {piece.best_score > 0 ? `${piece.best_score}%` : '—'}
              </div>
              <button onClick={() => toggleFavorite(piece.id, piece.is_favorite)} className="btn-ghost" style={{ padding: '5px', flexShrink: 0 }}>
                {piece.is_favorite ? <Star size={14} style={{ color: 'var(--primary)', fill: 'var(--primary)' }} /> : <StarOff size={14} style={{ color: 'var(--text-muted)' }} />}
              </button>
              <button onClick={() => navigate(`/practice/${piece.id}`)} className="btn-primary" style={{ padding: '7px 14px', fontSize: '0.78rem', flexShrink: 0 }}>
                <Play size={12} /> Practice
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <Music size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 14px' }} />
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '1rem' }}>
            {search ? 'No pieces found' : 'Your library is empty'}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {search ? 'Try a different search term.' : 'Upload sheet music to get started with interactive practice.'}
          </p>
          {!search && (
            <button onClick={() => setShowUpload(true)} className="btn-primary" style={{ margin: '16px auto 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} /> Upload First Score
            </button>
          )}
        </div>
      )}
    </div>
  )
}
