import { useState } from 'react'

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  teal: '#087F8C',
  tealDark: '#065F6B',
  tealLight: '#E0F4F6',
  blue: '#2563EB',
  blueLight: '#EFF6FF',
  bg: '#F7FAFC',
  card: '#ffffff',
  text: '#172033',
  muted: '#5A6A7A',
  border: '#D1DCE8',
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  critical: '#DC2626',
  criticalLight: '#FEE2E2',
}

type Screen =
  | 'welcome' | 'language' | 'consent' | 'identification' | 'profile'
  | 'complaint' | 'ai_conversation' | 'medication' | 'allergy'
  | 'document_scan' | 'ocr_verify' | 'review' | 'completion'
  | 'redflag' | 'physician'

// ─── Shared components ────────────────────────────────────────────────────────

function HelpButton() {
  return (
    <button
      className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors hover:bg-[#F7FAFC]"
      style={{ borderColor: T.border, color: T.muted, fontFamily: 'var(--font-sans)' }}
    >
      <span style={{ fontSize: 18 }}>👋</span> Need Help?
    </button>
  )
}

function ProgressBar({ step, total, label }: { step: number; total: number; label: string }) {
  const pct = Math.round((step / total) * 100)
  return (
    <div className="w-full px-8 py-4 border-b flex items-center gap-4" style={{ borderColor: T.border, backgroundColor: T.card }}>
      <div className="flex-1">
        <div className="flex justify-between mb-1.5">
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: T.muted }}>{label}</span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: T.teal }}>{pct}%</span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ backgroundColor: T.border }}>
          <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: T.teal }} />
        </div>
      </div>
      {pct > 30 && pct < 90 && (
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: T.success, fontWeight: 600 }}>You're doing great!</span>
      )}
    </div>
  )
}

function KioskShell({ children, showProgress, step, totalSteps, progressLabel, hideHelp }: {
  children: React.ReactNode
  showProgress?: boolean
  step?: number
  totalSteps?: number
  progressLabel?: string
  hideHelp?: boolean
}) {
  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: T.bg, fontFamily: 'var(--font-sans)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b" style={{ backgroundColor: T.card, borderColor: T.border }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: T.teal }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2a6 6 0 0 1 6 6c0 4-6 10-6 10S4 12 4 8a6 6 0 0 1 6-6z" fill="white" opacity="0.9"/>
              <circle cx="10" cy="8" r="2.5" fill="white"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 20, color: T.text }}>MediKiosk</span>
        </div>
        {!hideHelp && <HelpButton />}
      </div>

      {showProgress && step !== undefined && totalSteps !== undefined && (
        <ProgressBar step={step} total={totalSteps} label={progressLabel ?? 'Your health history'} />
      )}

      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  )
}

// ─── Screen 01 — Welcome ──────────────────────────────────────────────────────
function WelcomeScreen({ onStart, onPhysician }: { onStart: () => void; onPhysician: () => void }) {
  const [pulse, setPulse] = useState(false)
  return (
    <KioskShell hideHelp>
      <div className="flex-1 flex flex-col items-center justify-center gap-10 px-8 py-16 text-center">
        <div>
          <div
            className="w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: T.teal }}
          >
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" fill="white" opacity="0.15"/>
              <path d="M24 6a16 16 0 1 1 0 32A16 16 0 0 1 24 6z" fill="white" opacity="0.9"/>
              <path d="M24 14v10l6 4" stroke={T.teal} strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 42, fontWeight: 700, color: T.text, lineHeight: 1.2, marginBottom: 12 }}>
            Welcome to MediKiosk
          </h1>
          <p style={{ fontSize: 22, color: T.muted, maxWidth: 520, margin: '0 auto', lineHeight: 1.5 }}>
            Your health history, ready for your doctor.
          </p>
        </div>

        {/* Microphone pulse */}
        <div className="flex flex-col items-center gap-4">
          <button
            onMouseEnter={() => setPulse(true)}
            onMouseLeave={() => setPulse(false)}
            onClick={onStart}
            className="relative w-36 h-36 rounded-full flex flex-col items-center justify-center text-white transition-transform active:scale-95"
            style={{ backgroundColor: T.teal, boxShadow: pulse ? `0 0 0 20px ${T.tealLight}` : `0 0 0 8px ${T.tealLight}`, transition: 'all 0.3s ease' }}
          >
            <span style={{ fontSize: 40 }}>🎙️</span>
            <span style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>Start</span>
          </button>
          <p style={{ fontSize: 18, color: T.muted }}>Tap or speak to begin</p>
        </div>

        <button
          onClick={onStart}
          className="px-10 py-5 rounded-2xl text-white font-bold transition-opacity hover:opacity-90"
          style={{ backgroundColor: T.teal, fontSize: 22 }}
        >
          🎙️ Start My Health History
        </button>

        <button
          className="px-6 py-3 rounded-xl border font-medium text-base transition-colors hover:bg-[#EFF6FF]"
          style={{ borderColor: T.border, color: T.muted }}
        >
          🔄 Change Language
        </button>

        <p style={{ fontSize: 16, color: T.muted }}>Need help? Ask a staff member</p>

        {/* Staff toggle */}
        <button
          onClick={onPhysician}
          className="fixed bottom-6 right-6 px-4 py-2 rounded-lg text-sm border transition-colors hover:bg-[#F7FAFC]"
          style={{ borderColor: T.border, color: T.muted, fontSize: 13 }}
        >
          👩‍⚕️ Staff Login
        </button>
      </div>
    </KioskShell>
  )
}

// ─── Screen 02 — Language ─────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'hi', label: 'हिन्दी', sub: 'Hindi' },
  { code: 'en', label: 'English', sub: 'English' },
  { code: 'bn', label: 'বাংলা', sub: 'Bengali' },
  { code: 'ta', label: 'தமிழ்', sub: 'Tamil' },
  { code: 'te', label: 'తెలుగు', sub: 'Telugu' },
  { code: 'kn', label: 'ಕನ್ನಡ', sub: 'Kannada' },
  { code: 'mr', label: 'मराठी', sub: 'Marathi' },
  { code: 'gu', label: 'ગુજરાતી', sub: 'Gujarati' },
]

function LanguageScreen({ onSelect }: { onSelect: (lang: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <KioskShell>
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 gap-8">
        <h1 style={{ fontSize: 36, fontWeight: 700, color: T.text, textAlign: 'center' }}>
          Which language would you like to use?
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => setSelected(lang.code)}
              className="rounded-2xl p-6 border-2 flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95"
              style={{
                borderColor: selected === lang.code ? T.teal : T.border,
                backgroundColor: selected === lang.code ? T.tealLight : T.card,
              }}
            >
              <span style={{ fontSize: 32, fontWeight: 700, color: T.text }}>{lang.label}</span>
              <span style={{ fontSize: 14, color: T.muted }}>{lang.sub}</span>
            </button>
          ))}
        </div>
        {selected && (
          <div className="flex flex-col items-center gap-4">
            <p style={{ fontSize: 20, color: T.teal, fontWeight: 500 }}>
              You can speak normally. I will ask you a few questions.
            </p>
            <button
              onClick={() => onSelect(selected)}
              className="px-10 py-4 rounded-2xl text-white font-bold text-xl transition-opacity hover:opacity-90"
              style={{ backgroundColor: T.teal }}
            >
              Continue →
            </button>
          </div>
        )}
      </div>
    </KioskShell>
  )
}

// ─── Screen 03 — Consent ──────────────────────────────────────────────────────
function ConsentScreen({ onAgree, onDecline }: { onAgree: () => void; onDecline: () => void }) {
  return (
    <KioskShell>
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 gap-8 max-w-2xl mx-auto w-full">
        <h1 style={{ fontSize: 36, fontWeight: 700, color: T.text, textAlign: 'center' }}>Before we begin</h1>
        <div className="flex flex-col gap-4 w-full">
          {[
            { icon: '🔒', title: 'Your information is private', desc: 'Only your doctor can see your health history.' },
            { icon: '🎙️', title: 'We will record your health information', desc: 'We will ask you a few simple questions about your health.' },
            { icon: '📄', title: 'You can share your previous medical documents', desc: 'You may scan prescriptions, lab reports, or discharge summaries.' },
          ].map((c, i) => (
            <div
              key={i}
              className="flex items-start gap-5 p-6 rounded-2xl border"
              style={{ backgroundColor: T.card, borderColor: T.border }}
            >
              <span style={{ fontSize: 36 }}>{c.icon}</span>
              <div>
                <p style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 4 }}>{c.title}</p>
                <p style={{ fontSize: 17, color: T.muted, lineHeight: 1.5 }}>{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          className="flex items-center gap-2 px-5 py-3 rounded-xl border text-base font-medium transition-colors hover:bg-[#F7FAFC]"
          style={{ borderColor: T.border, color: T.muted }}
        >
          🔊 Listen to this information
        </button>
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <button
            onClick={onAgree}
            className="flex-1 py-5 rounded-2xl text-white font-bold text-xl transition-opacity hover:opacity-90"
            style={{ backgroundColor: T.success }}
          >
            ✓ I Agree &amp; Continue
          </button>
          <button
            onClick={onDecline}
            className="flex-1 py-5 rounded-2xl font-bold text-xl border-2 transition-colors hover:bg-red-50"
            style={{ borderColor: T.critical, color: T.critical }}
          >
            I Don't Agree
          </button>
        </div>
      </div>
    </KioskShell>
  )
}

// ─── Screen 04 — Identification ───────────────────────────────────────────────
function IdentificationScreen({ onNext }: { onNext: () => void }) {
  return (
    <KioskShell showProgress step={1} totalSteps={8} progressLabel="Identification">
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 gap-6 max-w-xl mx-auto w-full">
        <h1 style={{ fontSize: 34, fontWeight: 700, color: T.text, textAlign: 'center' }}>
          Let's find your health record
        </h1>
        {[
          { icon: '📱', label: 'Scan ABHA QR Code', primary: true },
          { icon: '🔢', label: 'Enter ABHA Number', primary: false },
          { icon: '🆕', label: 'New Patient', primary: false },
        ].map((opt, i) => (
          <button
            key={i}
            onClick={onNext}
            className="w-full py-6 px-8 rounded-2xl border-2 flex items-center gap-5 font-bold text-xl transition-all hover:scale-[1.02] active:scale-95"
            style={{
              backgroundColor: opt.primary ? T.teal : T.card,
              borderColor: opt.primary ? T.teal : T.border,
              color: opt.primary ? '#fff' : T.text,
            }}
          >
            <span style={{ fontSize: 32 }}>{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </KioskShell>
  )
}

// ─── Screen 05 — Profile ──────────────────────────────────────────────────────
function ProfileScreen({ onNext }: { onNext: () => void }) {
  const [name, setName] = useState('Ramesh Kumar')
  const [age, setAge] = useState('56')
  const [sex, setSex] = useState('Male')
  const [phone] = useState('********21')

  return (
    <KioskShell showProgress step={2} totalSteps={8} progressLabel="Your details">
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 gap-6 max-w-xl mx-auto w-full">
        <h1 style={{ fontSize: 34, fontWeight: 700, color: T.text, textAlign: 'center' }}>
          Let's confirm a few details
        </h1>
        <div className="w-full flex flex-col gap-4">
          {[
            { label: 'Name', value: name, onChange: setName, type: 'text' },
            { label: 'Age', value: age, onChange: setAge, type: 'number' },
          ].map(f => (
            <div key={f.label} className="flex flex-col gap-2">
              <label style={{ fontSize: 18, fontWeight: 600, color: T.muted }}>{f.label}</label>
              <input
                type={f.type}
                value={f.value}
                onChange={e => f.onChange(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border-2 text-xl outline-none transition-colors focus:border-[#087F8C]"
                style={{ borderColor: T.border, fontSize: 22, fontFamily: 'var(--font-sans)', color: T.text }}
              />
            </div>
          ))}
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: 18, fontWeight: 600, color: T.muted }}>Sex</label>
            <div className="flex gap-3">
              {['Male', 'Female', 'Other'].map(s => (
                <button
                  key={s}
                  onClick={() => setSex(s)}
                  className="flex-1 py-4 rounded-xl border-2 font-bold text-lg transition-all"
                  style={{
                    borderColor: sex === s ? T.teal : T.border,
                    backgroundColor: sex === s ? T.tealLight : T.card,
                    color: sex === s ? T.teal : T.text,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: 18, fontWeight: 600, color: T.muted }}>Phone</label>
            <div className="w-full px-5 py-4 rounded-xl border-2 text-xl" style={{ borderColor: T.border, color: T.muted, fontSize: 22 }}>
              {phone}
            </div>
          </div>
        </div>
        <button
          onClick={onNext}
          className="w-full py-5 rounded-2xl text-white font-bold text-xl transition-opacity hover:opacity-90"
          style={{ backgroundColor: T.teal }}
        >
          ✓ Looks Correct — Continue →
        </button>
      </div>
    </KioskShell>
  )
}

// ─── Screen 06 — Chief Complaint ──────────────────────────────────────────────
const COMPLAINTS = [
  { icon: '🤕', label: 'Pain' },
  { icon: '🌡️', label: 'Fever' },
  { icon: '😮‍💨', label: 'Breathing problem' },
  { icon: '🤢', label: 'Stomach problem' },
  { icon: '🤧', label: 'Cold / Cough' },
  { icon: '🩸', label: 'Bleeding' },
  { icon: '😵', label: 'Dizziness' },
  { icon: '🧠', label: 'Other' },
]

function ChiefComplaintScreen({ onNext }: { onNext: (complaint: string) => void }) {
  const [spoken, setSpoken] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [listening, setListening] = useState(false)

  const handleMic = () => {
    setListening(true)
    setTimeout(() => {
      setSpoken("I'm having pain in my chest since yesterday.")
      setListening(false)
    }, 2000)
  }

  return (
    <KioskShell showProgress step={3} totalSteps={8} progressLabel="Chief complaint">
      <div className="flex-1 flex flex-col items-center px-8 py-8 gap-7 max-w-2xl mx-auto w-full">
        <h1 style={{ fontSize: 34, fontWeight: 700, color: T.text, textAlign: 'center', lineHeight: 1.3 }}>
          What brings you to the hospital today?
        </h1>

        {/* Voice input */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleMic}
            className="w-28 h-28 rounded-full flex flex-col items-center justify-center text-white transition-all active:scale-95"
            style={{
              backgroundColor: listening ? T.critical : T.teal,
              boxShadow: listening ? `0 0 0 16px ${T.criticalLight}` : `0 0 0 8px ${T.tealLight}`,
              transition: 'all 0.3s ease',
            }}
          >
            <span style={{ fontSize: 40 }}>{listening ? '⏺' : '🎙️'}</span>
            <span style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{listening ? 'Listening...' : 'Tap to speak'}</span>
          </button>
          {spoken && (
            <div
              className="px-6 py-4 rounded-2xl border max-w-sm text-center"
              style={{ backgroundColor: T.tealLight, borderColor: T.teal, color: T.teal, fontSize: 18, fontStyle: 'italic' }}
            >
              "{spoken}"
            </div>
          )}
        </div>

        <div className="w-full flex items-center gap-4">
          <div className="flex-1 h-px" style={{ backgroundColor: T.border }} />
          <span style={{ color: T.muted, fontSize: 16 }}>Or choose an option</span>
          <div className="flex-1 h-px" style={{ backgroundColor: T.border }} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
          {COMPLAINTS.map(c => (
            <button
              key={c.label}
              onClick={() => setSelected(c.label)}
              className="py-5 px-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95"
              style={{
                borderColor: selected === c.label ? T.teal : T.border,
                backgroundColor: selected === c.label ? T.tealLight : T.card,
              }}
            >
              <span style={{ fontSize: 30 }}>{c.icon}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: T.text, textAlign: 'center' }}>{c.label}</span>
            </button>
          ))}
        </div>

        {(spoken || selected) && (
          <button
            onClick={() => onNext(spoken || selected || '')}
            className="w-full py-5 rounded-2xl text-white font-bold text-xl transition-opacity hover:opacity-90"
            style={{ backgroundColor: T.teal }}
          >
            Continue →
          </button>
        )}
      </div>
    </KioskShell>
  )
}

// ─── Screen 07 — AI Conversation ─────────────────────────────────────────────
const AI_QUESTIONS = [
  { q: 'I want to understand your chest pain better. When did the pain start?', opts: ['Today', 'Yesterday', 'A few days ago', 'More than a week ago'] },
  { q: 'How would you describe the pain?', opts: ['Sharp', 'Burning', 'Dull / Pressure', 'Cramping', 'Heavy', 'Other'] },
  { q: 'Does the pain spread to your arm, jaw, or back?', opts: ['Yes, to the arm', 'Yes, to the jaw', 'Yes, to the back', 'No, stays in chest'] },
  { q: 'Do you feel short of breath along with the chest pain?', opts: ['Yes', 'No', 'Sometimes'] },
]

function AIConversationScreen({ onNext, onRedFlag }: { onNext: () => void; onRedFlag: () => void }) {
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [listening, setListening] = useState(false)

  const handleAnswer = (ans: string) => {
    const newAnswers = [...answers, ans]
    setAnswers(newAnswers)
    // Red-flag: chest pain + shortness of breath → urgent
    if (qIndex === 3 && ans === 'Yes') {
      setTimeout(onRedFlag, 600)
      return
    }
    if (qIndex < AI_QUESTIONS.length - 1) {
      setTimeout(() => setQIndex(qIndex + 1), 400)
    } else {
      setTimeout(onNext, 600)
    }
  }

  const q = AI_QUESTIONS[qIndex]
  const progress = 35 + Math.round((qIndex / AI_QUESTIONS.length) * 20)

  return (
    <KioskShell>
      <div className="w-full px-8 py-4 border-b flex items-center gap-4" style={{ borderColor: T.border, backgroundColor: T.card }}>
        <div className="flex-1">
          <div className="flex justify-between mb-1.5">
            <span style={{ fontSize: 13, color: T.muted }}>Your health history</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.teal }}>{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ backgroundColor: T.border }}>
            <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: T.teal }} />
          </div>
        </div>
        <span style={{ fontSize: 13, color: T.success, fontWeight: 600 }}>You're doing great!</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-between px-8 py-10 gap-8 max-w-2xl mx-auto w-full">
        {/* AI avatar + question */}
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl" style={{ backgroundColor: T.tealLight }}>
            👩‍⚕️
          </div>
          <div
            className="px-8 py-6 rounded-3xl rounded-tl-none max-w-lg"
            style={{ backgroundColor: T.tealLight, border: `1.5px solid ${T.teal}` }}
          >
            <p style={{ fontSize: 24, fontWeight: 600, color: T.text, lineHeight: 1.4 }}>{q.q}</p>
          </div>
        </div>

        {/* Answer options */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {q.opts.map(opt => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              className="py-4 px-6 rounded-2xl border-2 font-semibold text-lg transition-all hover:scale-105 active:scale-95"
              style={{ borderColor: T.border, backgroundColor: T.card, color: T.text }}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Mic + replay */}
        <div className="flex flex-col items-center gap-4 w-full">
          <button
            onClick={() => { setListening(true); setTimeout(() => setListening(false), 2000) }}
            className="w-20 h-20 rounded-full flex flex-col items-center justify-center text-white transition-all active:scale-95"
            style={{
              backgroundColor: listening ? T.critical : T.teal,
              boxShadow: listening ? `0 0 0 12px ${T.criticalLight}` : `0 0 0 6px ${T.tealLight}`,
              transition: 'all 0.3s',
            }}
          >
            <span style={{ fontSize: 28 }}>🎙️</span>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{listening ? 'Listening' : 'Speak'}</span>
          </button>
          <div className="flex gap-6">
            <button style={{ fontSize: 15, color: T.muted }} className="flex items-center gap-1.5 hover:text-[#087F8C]">
              🔊 Hear question again
            </button>
            <button style={{ fontSize: 15, color: T.muted }} className="flex items-center gap-1.5 hover:text-[#DC2626]">
              👋 Need help?
            </button>
          </div>
        </div>
      </div>

      {/* Previous answers */}
      {answers.length > 0 && (
        <div className="px-8 pb-6 flex flex-wrap gap-2 justify-center">
          {answers.map((a, i) => (
            <span key={i} className="px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: T.tealLight, color: T.teal }}>
              ✓ {a}
            </span>
          ))}
        </div>
      )}
    </KioskShell>
  )
}

// ─── Screen — Medication ──────────────────────────────────────────────────────
function MedicationScreen({ onNext }: { onNext: () => void }) {
  const [choice, setChoice] = useState<string | null>(null)
  const opts = [
    { icon: '💊', label: 'Yes, I take medicines', value: 'yes' },
    { icon: '✓', label: 'No medicines', value: 'no' },
    { icon: '?', label: "I'm not sure", value: 'unsure' },
  ]
  return (
    <KioskShell showProgress step={5} totalSteps={8} progressLabel="Medicines">
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 gap-6 max-w-xl mx-auto w-full">
        <h1 style={{ fontSize: 32, fontWeight: 700, color: T.text, textAlign: 'center' }}>
          Do you currently take any medicines?
        </h1>
        <div className="flex flex-col gap-4 w-full">
          {opts.map(opt => (
            <button
              key={opt.value}
              onClick={() => setChoice(opt.value)}
              className="flex items-center gap-5 py-6 px-7 rounded-2xl border-2 font-bold text-xl transition-all hover:scale-[1.02] active:scale-95"
              style={{
                borderColor: choice === opt.value ? T.teal : T.border,
                backgroundColor: choice === opt.value ? T.tealLight : T.card,
                color: T.text,
              }}
            >
              <span style={{ fontSize: 34 }}>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
        {choice === 'yes' && (
          <div className="w-full p-6 rounded-2xl" style={{ backgroundColor: T.blueLight, border: `1.5px solid ${T.blue}` }}>
            <p style={{ fontSize: 18, color: T.blue, fontWeight: 600, textAlign: 'center' }}>
              📷 You can show me your medicine strip or prescription.
            </p>
          </div>
        )}
        {choice && (
          <button
            onClick={onNext}
            className="w-full py-5 rounded-2xl text-white font-bold text-xl transition-opacity hover:opacity-90"
            style={{ backgroundColor: T.teal }}
          >
            Continue →
          </button>
        )}
      </div>
    </KioskShell>
  )
}

// ─── Screen — Allergy ─────────────────────────────────────────────────────────
function AllergyScreen({ onNext }: { onNext: () => void }) {
  const [choice, setChoice] = useState<string | null>(null)
  const opts = [
    { icon: '🟢', label: 'No known allergies', value: 'none', color: T.success },
    { icon: '🔴', label: 'Yes, I have an allergy', value: 'yes', color: T.critical },
    { icon: '🟡', label: "I'm not sure", value: 'unsure', color: T.warning },
  ]
  return (
    <KioskShell showProgress step={6} totalSteps={8} progressLabel="Allergies">
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 gap-6 max-w-xl mx-auto w-full">
        <h1 style={{ fontSize: 32, fontWeight: 700, color: T.text, textAlign: 'center' }}>
          Are you allergic to any medicine or food?
        </h1>
        <div className="flex flex-col gap-4 w-full">
          {opts.map(opt => (
            <button
              key={opt.value}
              onClick={() => setChoice(opt.value)}
              className="flex items-center gap-5 py-6 px-7 rounded-2xl border-2 font-bold text-xl transition-all hover:scale-[1.02] active:scale-95"
              style={{
                borderColor: choice === opt.value ? opt.color : T.border,
                backgroundColor: choice === opt.value ? opt.color + '15' : T.card,
                color: T.text,
              }}
            >
              <span style={{ fontSize: 28 }}>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
        {choice && (
          <button
            onClick={onNext}
            className="w-full py-5 rounded-2xl text-white font-bold text-xl transition-opacity hover:opacity-90"
            style={{ backgroundColor: T.teal }}
          >
            Continue →
          </button>
        )}
      </div>
    </KioskShell>
  )
}

// ─── Screen — Document Scan ───────────────────────────────────────────────────
function DocumentScanScreen({ onNext }: { onNext: () => void }) {
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [count, setCount] = useState(0)
  const docTypes = ['📄 Prescription', '🧪 Lab Report', '🏥 Discharge Summary', '🩻 Scan / Imaging Report', '💊 Medicine List', '📋 Other']

  const startScan = () => {
    setScanning(true)
    setTimeout(() => { setScanning(false); setScanned(true); setCount(c => c + 1) }, 2500)
  }

  return (
    <KioskShell showProgress step={7} totalSteps={8} progressLabel="Documents">
      <div className="flex-1 flex flex-col items-center px-8 py-10 gap-6 max-w-xl mx-auto w-full">
        <h1 style={{ fontSize: 32, fontWeight: 700, color: T.text, textAlign: 'center' }}>
          Do you have previous medical documents?
        </h1>
        <div className="grid grid-cols-2 gap-3 w-full">
          {docTypes.map(d => (
            <button
              key={d}
              onClick={startScan}
              className="py-4 px-4 rounded-2xl border-2 font-semibold text-base text-left transition-all hover:border-[#087F8C] hover:bg-[#E0F4F6]"
              style={{ borderColor: T.border, backgroundColor: T.card, color: T.text }}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Scanner */}
        <div
          className="w-full aspect-video rounded-3xl border-4 border-dashed flex flex-col items-center justify-center gap-3 relative overflow-hidden"
          style={{ borderColor: scanning ? T.teal : T.border, backgroundColor: scanning ? T.tealLight : '#F0F4F8' }}
        >
          {scanning ? (
            <>
              <div className="w-full h-1 absolute animate-bounce" style={{ backgroundColor: T.teal, top: '50%' }} />
              <p style={{ fontSize: 20, fontWeight: 700, color: T.teal }}>📷 Scanning...</p>
              <p style={{ fontSize: 15, color: T.muted }}>Keep the document flat</p>
            </>
          ) : scanned ? (
            <div className="flex flex-col items-center gap-2">
              <span style={{ fontSize: 40 }}>✅</span>
              <p style={{ fontSize: 20, fontWeight: 700, color: T.success }}>Document captured ✓</p>
              <p style={{ fontSize: 15, color: T.muted }}>{count} document{count > 1 ? 's' : ''} scanned</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 18, fontWeight: 600, color: T.muted }}>DOCUMENT</p>
              <p style={{ fontSize: 15, color: T.muted }}>ALIGN HERE</p>
            </>
          )}
        </div>

        {scanned && (
          <div className="flex gap-4 w-full">
            <button
              onClick={startScan}
              className="flex-1 py-4 rounded-2xl border-2 font-bold text-lg transition-colors hover:bg-[#E0F4F6]"
              style={{ borderColor: T.teal, color: T.teal }}
            >
              Scan another
            </button>
            <button
              onClick={onNext}
              className="flex-1 py-4 rounded-2xl text-white font-bold text-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: T.teal }}
            >
              I'm finished →
            </button>
          </div>
        )}
        {!scanned && (
          <button
            onClick={onNext}
            className="w-full py-4 rounded-2xl border-2 font-bold text-lg transition-colors hover:bg-[#F7FAFC]"
            style={{ borderColor: T.border, color: T.muted }}
          >
            Skip — no documents
          </button>
        )}
      </div>
    </KioskShell>
  )
}

// ─── Screen — Review ──────────────────────────────────────────────────────────
function ReviewScreen({ onSubmit }: { onSubmit: () => void }) {
  const sections = [
    { label: 'Main problem', value: 'Chest pain — started yesterday', icon: '🤕' },
    { label: 'Other symptoms', value: 'Breathlessness, fatigue', icon: '😮‍💨' },
    { label: 'Medical history', value: 'Diabetes, Hypertension', icon: '📋' },
    { label: 'Medicines', value: '3 medicines recorded', icon: '💊' },
    { label: 'Allergies', value: 'No known allergies', icon: '🟢' },
    { label: 'Previous records', value: '2 documents uploaded', icon: '📄' },
  ]
  return (
    <KioskShell showProgress step={8} totalSteps={8} progressLabel="Almost done!">
      <div className="flex-1 flex flex-col items-center px-8 py-10 gap-6 max-w-2xl mx-auto w-full">
        <h1 style={{ fontSize: 34, fontWeight: 700, color: T.text, textAlign: 'center' }}>
          Let's check your information
        </h1>
        <div className="flex flex-col gap-3 w-full">
          {sections.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-6 py-5 rounded-2xl border"
              style={{ backgroundColor: T.card, borderColor: T.border }}
            >
              <div className="flex items-center gap-4">
                <span style={{ fontSize: 26 }}>{s.icon}</span>
                <div>
                  <p style={{ fontSize: 14, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
                  <p style={{ fontSize: 18, fontWeight: 600, color: T.text }}>{s.value}</p>
                </div>
              </div>
              <button style={{ fontSize: 22, color: T.muted }} title="Edit">✎</button>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 18, color: T.muted, textAlign: 'center', lineHeight: 1.5 }}>
          Your doctor will review this information.
        </p>
        <button
          onClick={onSubmit}
          className="w-full py-5 rounded-2xl text-white font-bold text-xl transition-opacity hover:opacity-90"
          style={{ backgroundColor: T.teal }}
        >
          Submit My History →
        </button>
      </div>
    </KioskShell>
  )
}

// ─── Screen — Completion ─────────────────────────────────────────────────────
function CompletionScreen() {
  return (
    <KioskShell hideHelp>
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 gap-8 text-center">
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center text-6xl"
          style={{ backgroundColor: T.successLight }}
        >
          ✅
        </div>
        <div>
          <h1 style={{ fontSize: 38, fontWeight: 700, color: T.success, marginBottom: 12 }}>
            Your Doctor Has Your Information
          </h1>
          <p style={{ fontSize: 22, color: T.muted, maxWidth: 480, margin: '0 auto', lineHeight: 1.5 }}>
            Please wait in the waiting area. A staff member will call your name shortly.
          </p>
        </div>
        <div
          className="px-8 py-5 rounded-2xl border"
          style={{ backgroundColor: T.card, borderColor: T.border }}
        >
          <p style={{ fontSize: 16, color: T.muted, marginBottom: 4 }}>Token Number</p>
          <p style={{ fontSize: 48, fontWeight: 800, color: T.teal }}>#124</p>
          <p style={{ fontSize: 16, color: T.muted }}>Cardiology OPD</p>
        </div>
        <p style={{ fontSize: 16, color: T.muted }}>Session will close automatically in 60 seconds.</p>
      </div>
    </KioskShell>
  )
}

// ─── Screen — Red Flag ────────────────────────────────────────────────────────
function RedFlagScreen() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-8 py-16 gap-8 text-center" style={{ backgroundColor: T.critical, fontFamily: 'var(--font-sans)' }}>
      <div className="w-28 h-28 rounded-full flex items-center justify-center text-6xl animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
        🔴
      </div>
      <div>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: '#ffffff', marginBottom: 16, lineHeight: 1.2 }}>
          Please wait —<br />a healthcare staff member is coming
        </h1>
        <p style={{ fontSize: 22, color: 'rgba(255,255,255,0.85)', maxWidth: 500, margin: '0 auto', lineHeight: 1.5 }}>
          Based on what you told us, you may need immediate medical attention.
        </p>
      </div>
      <div
        className="px-8 py-5 rounded-2xl"
        style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)' }}
      >
        <p style={{ fontSize: 20, color: '#ffffff', fontWeight: 700 }}>⚠ Do not leave this area.</p>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>A staff alert has been sent.</p>
      </div>
    </div>
  )
}

// ─── Physician Dashboard ──────────────────────────────────────────────────────
const TIMELINE = [
  { year: 2026, events: [
    { date: 'Sep 11', type: 'Visit', label: 'OPD — Cardiology', sub: 'Chief complaint: Chest pain' },
    { date: 'Aug 12', type: 'Lab', label: 'Blood test', sub: 'HbA1c: 8.2%', flag: true },
    { date: 'Jul 03', type: 'Rx', label: 'Prescription', sub: 'Metformin 500 mg' },
    { date: 'Mar 18', type: 'DC', label: 'Hospital discharge', sub: 'Diagnosis: Hypertensive crisis' },
  ]},
  { year: 2025, events: [
    { date: 'Nov 21', type: 'Visit', label: 'Previous consultation', sub: 'Endocrinology follow-up' },
  ]},
]

function SourceModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8" onClick={onClose}>
      <div
        className="rounded-3xl p-8 max-w-md w-full"
        style={{ backgroundColor: T.card }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <p style={{ fontSize: 14, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Source</p>
          <button onClick={onClose} style={{ fontSize: 22, color: T.muted }}>✕</button>
        </div>
        <div className="p-5 rounded-2xl mb-4" style={{ backgroundColor: T.tealLight }}>
          <p style={{ fontSize: 14, color: T.muted, marginBottom: 4 }}>Patient response:</p>
          <p style={{ fontSize: 17, color: T.text, fontStyle: 'italic', lineHeight: 1.5 }}>
            "I was diagnosed with diabetes around 8 years ago."
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <span style={{ fontSize: 14, color: T.muted }}>Source</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Conversational History</span>
          </div>
          <div className="flex justify-between">
            <span style={{ fontSize: 14, color: T.muted }}>Confidence</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.success }}>High</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t" style={{ borderColor: T.border }}>
          <p style={{ fontSize: 14, color: T.muted, marginBottom: 4 }}>Also confirmed in:</p>
          <div className="px-4 py-3 rounded-xl border flex justify-between items-center" style={{ borderColor: T.border }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Prescription · Metformin 500mg</p>
              <p style={{ fontSize: 13, color: T.muted }}>Date: 12 Aug 2026</p>
            </div>
            <button style={{ fontSize: 14, color: T.teal, fontWeight: 600 }}>View →</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PhysicianDashboard({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'summary' | 'timeline' | 'documents'>('summary')
  const [showSource, setShowSource] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const tabs = ['summary', 'timeline', 'documents'] as const

  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: T.bg, fontFamily: 'var(--font-sans)' }}>
      {showSource && <SourceModal onClose={() => setShowSource(false)} />}

      {/* Physician top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b" style={{ backgroundColor: '#172033', borderColor: '#2A3A50' }}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 22 }}>←</button>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: T.teal }}>
            <span style={{ fontSize: 16 }}>🩺</span>
          </div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Physician Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Cardiology OPD · Dr. Anjali Rao</span>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: T.teal }}>AR</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-6 gap-6">
        {/* Left — patient header + AI summary */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Patient card */}
          <div className="rounded-2xl p-6 border flex items-start justify-between" style={{ backgroundColor: T.card, borderColor: T.border }}>
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: T.text }}>Ramesh Kumar <span style={{ fontWeight: 400, color: T.muted }}>| 56 M</span></h2>
              <div className="flex items-center gap-4 mt-2">
                <span className="px-3 py-1 rounded-full text-sm font-bold text-white" style={{ backgroundColor: T.teal }}>Token #124</span>
                <span style={{ fontSize: 15, color: T.muted }}>Cardiology OPD</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: T.warningLight }}>
                <span style={{ fontSize: 16 }}>⚠</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.warning }}>2 items requiring attention</span>
              </div>
            </div>
          </div>

          {/* AI Summary banner */}
          <div className="flex items-center justify-between px-5 py-3 rounded-xl border" style={{ backgroundColor: T.tealLight, borderColor: T.teal }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.teal }}>🤖 AI-generated draft — physician verification required</span>
            <div className="flex gap-2">
              {!confirmed ? (
                <>
                  <button onClick={() => setConfirmed(true)} className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: T.success }}>✓ Confirm Summary</button>
                  <button className="px-4 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: T.border, color: T.text }}>✎ Edit</button>
                  <button className="px-4 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: T.border, color: T.text }}>↻ Regenerate</button>
                  <button className="px-4 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: T.critical, color: T.critical }}>⚠ Report Error</button>
                </>
              ) : (
                <span className="px-4 py-2 rounded-lg text-sm font-bold" style={{ backgroundColor: T.success, color: '#fff' }}>✓ Confirmed by Dr. Rao</span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: T.muted + '20' }}>
            {tabs.map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all"
                style={{
                  backgroundColor: activeTab === t ? T.card : 'transparent',
                  color: activeTab === t ? T.text : T.muted,
                  boxShadow: activeTab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {t === 'summary' ? 'AI Summary' : t === 'timeline' ? 'Medical Timeline' : 'Documents'}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'summary' && (
            <div className="rounded-2xl border p-6 flex flex-col gap-5" style={{ backgroundColor: T.card, borderColor: T.border }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Chief Complaint</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: T.text }}>Chest pain × 1 day</p>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>History of Present Illness</p>
                <p style={{ fontSize: 16, color: T.text, lineHeight: 1.7 }}>
                  Central chest pain beginning yesterday evening. Patient describes pain as pressure-like, radiating to the left arm. Associated breathlessness noted. No fever. Patient has background history of diabetes (8 years) and hypertension.
                </p>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Past History</p>
                <div className="flex flex-col gap-2">
                  {['Diabetes — 8 years', 'Hypertension — 4 years'].map(h => (
                    <div key={h} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span style={{ color: T.success, fontSize: 16 }}>✓</span>
                        <button
                          onClick={() => setShowSource(true)}
                          className="text-left hover:underline"
                          style={{ fontSize: 16, color: T.text }}
                        >
                          {h}
                        </button>
                      </div>
                      <button
                        onClick={() => setShowSource(true)}
                        className="px-3 py-1 rounded-full text-xs font-semibold transition-colors hover:bg-[#E0F4F6]"
                        style={{ color: T.teal, backgroundColor: T.tealLight }}
                      >
                        Source ↗
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <span style={{ color: T.critical, fontSize: 16 }}>✗</span>
                    <span style={{ fontSize: 16, color: T.text }}>No known CKD</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="rounded-2xl border p-6" style={{ backgroundColor: T.card, borderColor: T.border }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>Medical History</p>
              <div className="flex flex-col gap-0">
                {TIMELINE.map(yr => (
                  <div key={yr.year}>
                    <p style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 12 }}>{yr.year}</p>
                    <div className="ml-4 border-l-2 flex flex-col gap-4 pb-4" style={{ borderColor: T.border }}>
                      {yr.events.map((ev, i) => (
                        <div key={i} className="relative pl-6">
                          <div className="absolute -left-[9px] w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: ev.flag ? T.warning : T.teal }} />
                          <p style={{ fontSize: 13, color: T.muted, marginBottom: 2 }}>{ev.date} · {ev.type}</p>
                          <p style={{ fontSize: 16, fontWeight: 600, color: T.text }}>{ev.label}</p>
                          <p style={{ fontSize: 14, color: T.muted }}>{ev.sub}{ev.flag ? ' ⚠' : ''}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="rounded-2xl border p-6" style={{ backgroundColor: T.card, borderColor: T.border }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Uploaded Documents</p>
              <div className="flex flex-col gap-3">
                {['Prescription — Aug 2026', 'Lab Report (HbA1c) — Aug 2026', 'Discharge Summary — Mar 2026', 'Prescription — Jan 2026', 'Lab Report (Lipid panel) — Nov 2025'].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-4 rounded-xl border" style={{ borderColor: T.border }}>
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: 22 }}>📄</span>
                      <span style={{ fontSize: 15, color: T.text, fontWeight: 500 }}>{doc}</span>
                    </div>
                    <button style={{ fontSize: 14, color: T.teal, fontWeight: 600 }}>View →</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar — meds, allergies, investigations */}
        <div className="w-full lg:w-80 flex flex-col gap-5">
          {[
            {
              title: 'Medications',
              icon: '💊',
              rows: [
                { label: 'Metformin', sub: '500 mg · Twice daily' },
                { label: 'Amlodipine', sub: '5 mg · Once daily' },
                { label: 'Atorvastatin', sub: '10 mg · Night' },
              ]
            },
            {
              title: 'Allergies',
              icon: '🟢',
              rows: [{ label: 'No known drug allergies', sub: 'Patient confirmed' }]
            },
            {
              title: 'Investigations',
              icon: '🧪',
              rows: [
                { label: 'HbA1c: 8.2%', sub: 'Aug 12 2026', flag: true },
                { label: 'Creatinine: 1.1 mg/dL', sub: 'Aug 12 2026' },
                { label: 'BP: 158/96 mmHg', sub: 'Today (kiosk)', flag: true },
              ]
            }
          ].map(section => (
            <div key={section.title} className="rounded-2xl border p-5" style={{ backgroundColor: T.card, borderColor: T.border }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                {section.icon} {section.title}
              </p>
              <div className="flex flex-col gap-2">
                {section.rows.map((r, i) => (
                  <div key={i} className="flex justify-between items-start">
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{r.label} {r.flag ? '⚠' : ''}</p>
                      <p style={{ fontSize: 13, color: T.muted }}>{r.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            className="w-full py-4 rounded-2xl text-white font-bold text-base transition-opacity hover:opacity-90"
            style={{ backgroundColor: T.teal }}
          >
            □ Save to Patient Record
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome')

  const go = (s: Screen) => setScreen(s)

  if (screen === 'physician') return <PhysicianDashboard onBack={() => go('welcome')} />
  if (screen === 'redflag') return <RedFlagScreen />

  return (
    <>
      {screen === 'welcome' && <WelcomeScreen onStart={() => go('language')} onPhysician={() => go('physician')} />}
      {screen === 'language' && <LanguageScreen onSelect={() => go('consent')} />}
      {screen === 'consent' && <ConsentScreen onAgree={() => go('identification')} onDecline={() => go('welcome')} />}
      {screen === 'identification' && <IdentificationScreen onNext={() => go('profile')} />}
      {screen === 'profile' && <ProfileScreen onNext={() => go('complaint')} />}
      {screen === 'complaint' && <ChiefComplaintScreen onNext={() => go('ai_conversation')} />}
      {screen === 'ai_conversation' && <AIConversationScreen onNext={() => go('medication')} onRedFlag={() => go('redflag')} />}
      {screen === 'medication' && <MedicationScreen onNext={() => go('allergy')} />}
      {screen === 'allergy' && <AllergyScreen onNext={() => go('document_scan')} />}
      {screen === 'document_scan' && <DocumentScanScreen onNext={() => go('review')} />}
      {screen === 'review' && <ReviewScreen onSubmit={() => go('completion')} />}
      {screen === 'completion' && <CompletionScreen />}
    </>
  )
}
