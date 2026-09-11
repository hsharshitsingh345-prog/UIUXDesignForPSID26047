import { useState, useEffect } from 'react'

interface SessionTimeoutModalProps {
  isOpen: boolean
  onContinue: () => void
  onTimeout: () => void
  initialCountdown?: number
}

export function SessionTimeoutModal({
  isOpen,
  onContinue,
  onTimeout,
  initialCountdown = 30
}: SessionTimeoutModalProps) {
  const [seconds, setSeconds] = useState(initialCountdown)

  useEffect(() => {
    if (!isOpen) {
      setSeconds(initialCountdown)
      return
    }

    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          onTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, initialCountdown, onTimeout])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-200">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse">
          ⏳
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2">Are you still there?</h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-4">
          For your privacy and health data security in a shared hospital kiosk, this session will end and clear in:
        </p>

        <div className="inline-block px-5 py-2 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 font-mono font-black text-3xl mb-6">
          00:{seconds < 10 ? `0${seconds}` : seconds}
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onContinue}
            className="w-full py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-base shadow-sm transition-all"
          >
            I'm Still Here — Continue Intake
          </button>
          <button
            type="button"
            onClick={onTimeout}
            className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold text-xs"
          >
            End Session & Clear My Data Now
          </button>
        </div>
      </div>
    </div>
  )
}
