'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, RotateCcw, Mic } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AudioPlayerProps {
  src?: string
  doaJudul?: string
  arabText?: string   // teks Arab untuk dibaca TTS
  latinText?: string  // fallback Latin jika Arabic voice tidak tersedia
  compact?: boolean
  className?: string
}

// Cari voice Arab terbaik dari daftar voice browser
function getArabicVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find(v => v.lang === 'ar-SA') ??
    voices.find(v => v.lang.startsWith('ar')) ??
    voices.find(v => v.lang === 'id-ID') ??
    null
  )
}

function speakText(text: string, rate: number, onEnd: () => void, onProgress?: (p: number) => void): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  const voice = getArabicVoice()
  if (voice) utterance.voice = voice
  utterance.lang = voice?.lang ?? 'ar-SA'
  utterance.rate = rate
  utterance.pitch = 1

  let startTime = 0
  const estimatedDuration = (text.length / 15) * (1 / rate) * 1000

  utterance.onstart = () => {
    startTime = Date.now()
    if (onProgress) {
      const tick = () => {
        const elapsed = Date.now() - startTime
        const pct = Math.min(100, (elapsed / estimatedDuration) * 100)
        onProgress(pct)
        if (pct < 100) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }
  }

  utterance.onend = () => { onEnd(); onProgress?.(100) }
  utterance.onerror = () => { onEnd(); onProgress?.(0) }

  window.speechSynthesis.speak(utterance)
  return utterance
}

export function AudioPlayer({ src, doaJudul, arabText, latinText, compact = false, className }: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [rate, setRate] = useState(0.8)  // sedikit lebih lambat untuk ketartilan
  const [voiceAvail, setVoiceAvail] = useState<boolean | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const uttRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Cek ketersediaan voice saat mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const check = () => {
      const voices = window.speechSynthesis.getVoices()
      setVoiceAvail(voices.length > 0)
    }
    check()
    window.speechSynthesis.addEventListener('voiceschanged', check)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', check)
  }, [])

  // Cleanup saat unmount
  useEffect(() => {
    return () => { window.speechSynthesis?.cancel() }
  }, [])

  const textToRead = arabText ?? latinText ?? doaJudul ?? ''
  const hasTTS = voiceAvail && textToRead.length > 0
  const hasSrc = !!src

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0 }
    setPlaying(false)
    setProgress(0)
  }, [])

  const togglePlay = useCallback(() => {
    if (playing) { stop(); return }

    if (hasSrc && audioRef.current) {
      audioRef.current.play()
      setPlaying(true)
      return
    }

    if (hasTTS) {
      setPlaying(true)
      speakText(
        textToRead, rate,
        () => { setPlaying(false); setProgress(0) },
        p => setProgress(p)
      )
    }
  }, [playing, hasSrc, hasTTS, textToRead, rate, stop])

  const cycleRate = () => {
    stop()
    setRate(r => r === 0.8 ? 0.6 : r === 0.6 ? 0.4 : 0.8)
  }
  const rateLabel = rate === 0.8 ? 'Normal' : rate === 0.6 ? 'Lambat' : 'Sangat Lambat'

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <button
          onClick={togglePlay}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
            playing
              ? 'bg-[#1B6B3A] text-white'
              : 'bg-[#E8F5ED] text-[#1B6B3A] hover:bg-[#1B6B3A] hover:text-white'
          )}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
          <span>{playing ? 'Sedang dibaca...' : 'Putar Audio'}</span>
          {playing && (
            <span className="flex gap-0.5 items-end h-4">
              {[1,2,3,4].map(i => (
                <span key={i} className="w-0.5 bg-white rounded-full animate-bounce"
                  style={{ height: `${6 + (i % 3) * 4}px`, animationDelay: `${i * 0.12}s` }} />
              ))}
            </span>
          )}
        </button>
        {playing && (
          <button onClick={stop} className="text-xs text-gray-400 hover:text-red-400">■ Stop</button>
        )}
      </div>
    )
  }

  return (
    <div className={cn('bg-[#F5E6C8] rounded-2xl p-4', className)}>
      {hasSrc && <audio ref={audioRef} src={src} onEnded={() => { setPlaying(false); setProgress(0) }} onTimeUpdate={() => { if (audioRef.current) setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100) }} />}

      {doaJudul && (
        <div className="flex items-center gap-2 mb-3">
          <Mic size={13} className="text-[#8B6914]" />
          <p className="text-xs text-[#8B6914] font-medium">{doaJudul}</p>
        </div>
      )}

      {/* Progress bar */}
      <div className="h-1.5 bg-[#E8D5A0] rounded-full mb-4 overflow-hidden">
        <div className="h-full bg-[#C9A84C] rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={stop} className="text-[#8B6914] hover:text-[#C9A84C] transition-colors" title="Stop & ulang">
            <RotateCcw size={18} />
          </button>
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-[#C9A84C] hover:bg-[#b8963d] text-white flex items-center justify-center transition-all active:scale-95 shadow-md"
          >
            {playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
          <Volume2 size={18} className="text-[#8B6914]" />
        </div>

        <div className="flex items-center gap-2">
          {hasTTS && !hasSrc && (
            <span className="text-xs text-[#8B6914]/60 bg-[#E8D5A0] px-2 py-0.5 rounded-full">🎙️ TTS</span>
          )}
          <button onClick={cycleRate}
            className="text-xs font-bold text-[#8B6914] bg-[#E8D5A0] px-2 py-1 rounded-lg hover:bg-[#C9A84C] hover:text-white transition-colors">
            {rateLabel}
          </button>
        </div>
      </div>

      {!hasSrc && !hasTTS && voiceAvail === false && (
        <p className="text-xs text-[#8B6914]/60 mt-2 text-center">
          Browser tidak mendukung text-to-speech. Coba di Chrome/Edge.
        </p>
      )}
    </div>
  )
}
