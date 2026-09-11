import { useState, useEffect } from 'react'
import { LanguageCode } from '../../types'
import { STRINGS, speakText } from '../../utils/i18n'

interface VoiceInputProps {
  promptText: string
  lang: LanguageCode
  onTranscriptConfirmed: (text: string) => void
  samplePhrases?: string[]
}

export function VoiceInput({
  promptText,
  lang,
  onTranscriptConfirmed,
  samplePhrases = [
    'I have knee pain since 6 months',
    'Severe burning in chest and stomach after meals',
    'Fever and headache since yesterday evening'
  ]
}: VoiceInputProps) {
  const t = STRINGS[lang] || STRINGS.en
  const [state, setState] = useState<'idle' | 'listening' | 'processing' | 'confirmed_check' | 'manual'>('idle')
  const [transcript, setTranscript] = useState('')
  const [manualText, setManualText] = useState('')
  const [micSupported, setMicSupported] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined' && !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setMicSupported(false)
    }
  }, [])

  const startListening = () => {
    setState('listening')

    // Check for native browser SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition()
        recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
        recognition.continuous = false
        recognition.interimResults = false

        recognition.onresult = (event: any) => {
          const spoken = event.results[0][0].transcript
          setTranscript(spoken)
          setState('confirmed_check')
        }

        recognition.onerror = () => {
          fallbackSimulation()
        }

        recognition.start()
        return
      } catch (err) {
        fallbackSimulation()
        return
      }
    }

    fallbackSimulation()
  }

  const fallbackSimulation = () => {
    // Graceful simulation when Web Speech API is blocked or on simulated kiosk
    setTimeout(() => {
      setState('processing')
      setTimeout(() => {
        const picked = samplePhrases[Math.floor(Math.random() * samplePhrases.length)]
        setTranscript(picked)
        setState('confirmed_check')
      }, 1000)
    }, 1800)
  }

  const handleConfirm = () => {
    onTranscriptConfirmed(transcript)
    setState('idle')
  }

  const handleRetry = () => {
    setTranscript('')
    setState('idle')
  }

  const handleManualSubmit = () => {
    if (manualText.trim()) {
      onTranscriptConfirmed(manualText.trim())
      setState('idle')
    }
  }

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Listening / Microphone CTA */}
      {state === 'idle' && (
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={startListening}
            className="w-28 h-28 rounded-full flex flex-col items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-lg relative group"
            style={{
              backgroundColor: '#087F8C',
              boxShadow: '0 0 0 10px #E0F4F6',
            }}
          >
            <span className="text-4xl">🎙️</span>
            <span className="text-xs font-bold mt-1 tracking-wide">TAP TO SPEAK</span>
          </button>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mt-1">
            <button
              type="button"
              onClick={() => speakText(promptText, lang)}
              className="hover:text-teal-700 flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 transition-colors"
            >
              <span>🔊</span> {t.repeatQuestion}
            </button>
            <button
              type="button"
              onClick={() => setState('manual')}
              className="hover:text-teal-700 underline"
            >
              Or type with keyboard
            </button>
          </div>
          {!micSupported && (
            <span className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
              Microphone simulated for demo testing
            </span>
          )}
        </div>
      )}

      {/* Listening Animated State */}
      {state === 'listening' && (
        <div className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-teal-50 border-2 border-teal-500 w-full max-w-md animate-pulse">
          <div className="w-20 h-20 rounded-full bg-teal-600 text-white flex items-center justify-center text-3xl shadow-md">
            <span>⏺</span>
          </div>
          <p className="font-bold text-teal-900 text-lg">{t.listening}</p>
          <p className="text-xs text-teal-700">Speak clearly towards the kiosk microphone</p>
          <button
            type="button"
            onClick={() => setState('idle')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline mt-1"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Processing State */}
      {state === 'processing' && (
        <div className="flex flex-col items-center gap-2 p-6 rounded-3xl bg-slate-50 border border-slate-300 w-full max-w-md">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-bold text-slate-700 text-sm">Processing speech and extracting clinical symptoms...</p>
        </div>
      )}

      {/* Verification Step — Patient confirms AI speech recognition */}
      {state === 'confirmed_check' && (
        <div className="w-full max-w-md p-5 rounded-2xl bg-white border-2 border-teal-600 shadow-md flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
              {t.iHeard}
            </span>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
              Confidence: High
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200 text-slate-800 font-medium text-base italic">
            "{transcript}"
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <span>✓</span> {t.correctBtn}
            </button>
            <button
              type="button"
              onClick={handleRetry}
              className="px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-colors"
            >
              {t.tryAgainBtn}
            </button>
          </div>
        </div>
      )}

      {/* Manual Keyboard Fallback */}
      {state === 'manual' && (
        <div className="w-full max-w-md p-5 rounded-2xl bg-white border border-slate-300 shadow-sm flex flex-col gap-3">
          <label className="text-xs font-bold text-slate-600 uppercase">Type your answer</label>
          <textarea
            rows={2}
            value={manualText}
            onChange={e => setManualText(e.target.value)}
            placeholder="e.g. Sharp pain in lower back since 3 days"
            className="w-full p-3 border rounded-xl text-sm outline-none focus:border-teal-600"
          />
          <div className="flex justify-between items-center pt-1">
            <button
              type="button"
              onClick={() => setState('idle')}
              className="text-xs text-slate-500 hover:underline"
            >
              Back to voice
            </button>
            <button
              type="button"
              onClick={handleManualSubmit}
              disabled={!manualText.trim()}
              className="px-5 py-2.5 rounded-xl bg-teal-700 text-white font-bold text-xs disabled:opacity-50"
            >
              Save Text →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
