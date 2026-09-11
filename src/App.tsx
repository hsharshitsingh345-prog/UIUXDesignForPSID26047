import { useState, useEffect, useRef } from 'react'
import { OPDType, PatientCase, LanguageCode, UserRole, MedicationRecord, VitalsData } from './types'
import { fetchQueue, submitIntake, updateQueueStatus, acknowledgeRedFlag, recordAudit, callGeminiOCR, resetDemoDataApi } from './services/api'
import { AyushIntakeFlow } from './screens/ayush/AyushIntakeFlow'
import { AyushCaseSheet } from './screens/ayush/AyushCaseSheet'
import { OCRVerifyScreen } from './screens/kiosk/OCRVerifyScreen'
import { PathwayScreen } from './screens/kiosk/PathwayScreen'
import { VitalsScreen } from './screens/kiosk/VitalsScreen'
import { VoiceInput } from './components/voice/VoiceInput'
import { HelpModal } from './components/common/HelpModal'
import { SessionTimeoutModal } from './components/common/SessionTimeoutModal'
import { DemoBanner } from './components/common/DemoBanner'
import { SourceTraceModal } from './components/clinical/SourceTraceModal'
import { PhysicianAuthModal } from './components/security/PhysicianAuthModal'
import { STRINGS, speakText } from './utils/i18n'

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
  | 'welcome' | 'language' | 'consent' | 'identification' | 'profile' | 'pathway'
  | 'complaint' | 'ai_conversation' | 'vitals' | 'ayush_intake' | 'medication' | 'allergy'
  | 'document_scan' | 'ocr_verify' | 'review' | 'completion'
  | 'redflag' | 'physician'

// ─── Kiosk Shell with Global Inactivity and Accessibility ─────────────────────
function KioskShell({
  children,
  showProgress,
  step,
  totalSteps,
  progressLabel,
  hideHelp,
  onOpenHelp,
  lang = 'en'
}: {
  children: React.ReactNode
  showProgress?: boolean
  step?: number
  totalSteps?: number
  progressLabel?: string
  hideHelp?: boolean
  onOpenHelp?: () => void
  lang?: LanguageCode
}) {
  const pct = step !== undefined && totalSteps !== undefined ? Math.round((step / totalSteps) * 100) : 0
  const t = STRINGS[lang] || STRINGS.en

  return (
    <div className="min-h-full flex flex-col font-sans" style={{ backgroundColor: T.bg }}>
      <DemoBanner />

      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b" style={{ backgroundColor: T.card, borderColor: T.border }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xs" style={{ backgroundColor: T.teal }}>
            🌿
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span style={{ fontWeight: 800, fontSize: 19, color: T.text }}>MediKiosk</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                SIH PSID 26047 · Ministry of Ayush
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              AI-Assisted Case-Taking & Multilingual Documentation Kiosk
            </p>
          </div>
        </div>

        {!hideHelp && (
          <button
            type="button"
            onClick={onOpenHelp}
            className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all hover:bg-teal-50 active:scale-95 shadow-xs"
            style={{ borderColor: T.teal, color: T.teal }}
          >
            <span>👋</span> {t.needHelp}
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {showProgress && step !== undefined && totalSteps !== undefined && (
        <div className="w-full px-6 py-3 border-b flex items-center gap-4 bg-white" style={{ borderColor: T.border }}>
          <div className="flex-1">
            <div className="flex justify-between mb-1 text-xs">
              <span className="font-semibold text-slate-600">{progressLabel ?? 'Intake Progress'}</span>
              <span className="font-bold text-teal-800">{pct}% Complete</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full bg-teal-700 transition-all duration-500 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  )
}

// ─── Screen 01 — Welcome Screen ───────────────────────────────────────────────
function WelcomeScreen({
  onStart,
  onChangeLang,
  onPhysician,
  onHelp,
  lang
}: {
  onStart: () => void
  onChangeLang: () => void
  onPhysician: () => void
  onHelp: () => void
  lang: LanguageCode
}) {
  const t = STRINGS[lang] || STRINGS.en

  return (
    <KioskShell hideHelp={false} onOpenHelp={onHelp} lang={lang}>
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 py-12 text-center max-w-3xl mx-auto w-full">
        {/* Pulsing Central Kiosk Icon */}
        <div
          onClick={onStart}
          className="w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 shadow-xl select-none"
          style={{
            backgroundColor: T.teal,
            boxShadow: '0 0 0 12px #E0F4F6',
          }}
          title="Tap to begin"
        >
          <span style={{ fontSize: 44 }}>🎙️</span>
        </div>

        <div className="space-y-3">
          <h1 style={{ fontSize: 42, fontWeight: 900, color: T.text, lineHeight: 1.15 }}>
            {t.appName}
          </h1>
          <p style={{ fontSize: 20, color: T.muted, maxWidth: 540, margin: '0 auto', lineHeight: 1.4 }}>
            "Your health history, ready for your doctor."
          </p>
          <p className="text-xs text-emerald-800 font-semibold bg-emerald-50 inline-block px-3 py-1 rounded-full border border-emerald-200">
            {lang === 'hi' ? 'आयुष मंत्रालय केस-टेकिंग प्रणाली · त्वरित ओपीडी पंजीकरण' : 'Ministry of Ayush OPD Gateway · Rapid Multilingual Intake'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col items-center gap-3.5 w-full max-w-md">
          <button
            type="button"
            onClick={onStart}
            className="w-full py-5 rounded-2xl font-bold text-xl text-white flex items-center justify-center gap-3 transition-all hover:scale-102 active:scale-95 shadow-md"
            style={{ backgroundColor: T.teal }}
          >
            <span>🎙️</span> {t.startIntake}
          </button>

          <button
            type="button"
            onClick={onChangeLang}
            className="text-sm font-semibold transition-colors hover:underline text-slate-600 flex items-center gap-1.5"
          >
            <span>🌐</span> {t.changeLanguage}
          </button>
        </div>

        {/* Security & Physician Entrance */}
        <div className="pt-6 border-t border-slate-200 w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span>🔒</span> Privacy Protected: Zero sensitive history shown after session
          </span>
          <button
            type="button"
            onClick={onPhysician}
            className="font-bold text-teal-800 hover:text-teal-950 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 transition-colors flex items-center gap-1"
          >
            <span>🩺</span> Staff / Physician Portal Login →
          </button>
        </div>
      </div>
    </KioskShell>
  )
}

// ─── Screen 02 — Language Selection ──────────────────────────────────────────
const LANGUAGES = [
  { code: 'hi', native: 'हिन्दी', name: 'Hindi', script: 'Devanagari', welcome: 'नमस्ते' },
  { code: 'en', native: 'English', name: 'English', script: 'Latin', welcome: 'Welcome' },
  { code: 'bn', native: 'বাংলা', name: 'Bengali', script: 'Bengali', welcome: 'স্বাগতম' },
  { code: 'ta', native: 'தமிழ்', name: 'Tamil', script: 'Tamil', welcome: 'வணக்கம்' },
  { code: 'te', native: 'తెలుగు', name: 'Telugu', script: 'Telugu', welcome: 'స్వాగతం' },
  { code: 'kn', native: 'ಕನ್ನಡ', name: 'Kannada', script: 'Kannada', welcome: 'ಸ್ವಾಗತ' },
  { code: 'mr', native: 'मराठी', name: 'Marathi', script: 'Devanagari', welcome: 'नमस्कार' },
  { code: 'gu', native: 'ગુજરાતી', name: 'Gujarati', script: 'Gujarati', welcome: 'સ્વાગત' },
]

function LanguageScreen({
  onSelectLanguage,
  onHelp,
  currentLang
}: {
  onSelectLanguage: (lang: LanguageCode) => void
  onHelp: () => void
  currentLang: LanguageCode
}) {
  const [selected, setSelected] = useState<LanguageCode>(currentLang)

  return (
    <KioskShell hideHelp={false} onOpenHelp={onHelp} lang={selected}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-8 max-w-3xl mx-auto w-full">
        <div className="text-center space-y-1">
          <h1 style={{ fontSize: 34, fontWeight: 800, color: T.text }}>
            Which language would you like to use?
          </h1>
          <p style={{ fontSize: 18, color: T.muted }}>
            आप किस भाषा का उपयोग करना चाहेंगे?
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              type="button"
              onClick={() => setSelected(l.code === 'hi' ? 'hi' : 'en')}
              className={`flex flex-col items-center justify-center py-5 px-3 rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 text-center ${
                selected === l.code
                  ? 'border-teal-600 bg-teal-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span style={{ fontSize: 22, fontWeight: 800, color: T.text }}>{l.native}</span>
              <span style={{ fontSize: 13, color: T.muted, marginTop: 3 }}>{l.name}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onSelectLanguage(selected)}
          className="w-full max-w-md py-4 rounded-2xl text-white font-bold text-lg shadow-sm transition-opacity hover:opacity-95"
          style={{ backgroundColor: T.teal }}
        >
          {selected === 'hi' ? 'इस भाषा में जारी रखें (Continue) →' : 'Continue in English →'}
        </button>
      </div>
    </KioskShell>
  )
}

// ─── Screen 03 — Consent & Privacy ───────────────────────────────────────────
function ConsentScreen({
  onAgree,
  onDecline,
  onHelp,
  lang
}: {
  onAgree: () => void
  onDecline: () => void
  onHelp: () => void
  lang: LanguageCode
}) {
  const t = STRINGS[lang] || STRINGS.en

  const handleAudioListen = () => {
    const fullNotice = `${t.consentPrivate}. ${t.consentPurpose}. ${t.consentRecords}.`
    speakText(fullNotice, lang)
  }

  return (
    <KioskShell hideHelp={false} onOpenHelp={onHelp} lang={lang}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-7 max-w-xl mx-auto w-full">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mx-auto mb-3 text-2xl shadow-xs">
            🔒
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: T.text, marginBottom: 6 }}>
            {t.beforeWeBegin}
          </h1>
          <p style={{ fontSize: 16, color: T.muted }}>
            MediKiosk is an AI-assisted documentation kiosk. Your data is strictly protected.
          </p>
        </div>

        <div className="flex flex-col gap-3.5 w-full">
          {[
            { icon: '🔒', title: 'Private & Confidential', desc: t.consentPrivate },
            { icon: '📝', title: 'Prepares Clinical Case History', desc: t.consentPurpose },
            { icon: '📄', title: 'Scans Previous Papers (OCR)', desc: t.consentRecords }
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 rounded-2xl border bg-white shadow-xs"
              style={{ borderColor: T.border }}
            >
              <span className="text-2xl mt-0.5">{item.icon}</span>
              <div>
                <p className="font-bold text-sm text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Speech audio read aloud */}
        <button
          type="button"
          onClick={handleAudioListen}
          className="px-5 py-2.5 rounded-full border border-teal-300 bg-teal-50 text-teal-800 font-semibold text-xs flex items-center gap-2 hover:bg-teal-100 transition-colors"
        >
          <span>🔊</span> {t.listenAudio}
        </button>

        <div className="flex flex-col gap-2.5 w-full">
          <button
            type="button"
            onClick={onAgree}
            className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: T.teal }}
          >
            {t.agreeContinue}
          </button>
          <button
            type="button"
            onClick={onDecline}
            className="w-full py-2.5 rounded-xl text-slate-500 font-semibold text-xs hover:bg-slate-100"
          >
            {t.declineConsent}
          </button>
        </div>
      </div>
    </KioskShell>
  )
}

// ─── Screen 04 — Identification (Masked & Privacy-Aware) ──────────────────────
function IdentificationScreen({
  onNext,
  onHelp,
  lang
}: {
  onNext: (idType: string, idVal: string, profileData?: { name: string; age: number; gender: string; phone: string; abhaId: string }) => void
  onHelp: () => void
  lang: LanguageCode
}) {
  const t = STRINGS[lang] || STRINGS.en
  const [method, setMethod] = useState<'abha' | 'phone' | 'new'>('abha')
  const [abhaVal, setAbhaVal] = useState('14-8921-3321-9988')
  const [phoneVal, setPhoneVal] = useState('9412345678')
  const [selectedProfile, setSelectedProfile] = useState<{ name: string; age: number; gender: string; phone: string; abhaId: string; avatar: string } | null>({
    name: 'Ramesh Kumar',
    age: 56,
    gender: 'M',
    phone: '9412345678',
    abhaId: '14-8921-3321-9988',
    avatar: '👨'
  })

  const demoProfiles = [
    { name: 'Ramesh Kumar', age: 56, gender: 'M', phone: '9412345678', abhaId: '14-8921-3321-9988', avatar: '👨' },
    { name: 'Priya Sharma', age: 34, gender: 'F', phone: '9876543210', abhaId: '32-1144-5566-7788', avatar: '👩' },
    { name: 'Rajesh Patel', age: 62, gender: 'M', phone: '9811223344', abhaId: '88-4422-9911-3344', avatar: '👴' },
  ]

  const handleSelectProfile = (p: typeof demoProfiles[0]) => {
    setSelectedProfile(p)
    setAbhaVal(p.abhaId)
    setPhoneVal(p.phone)
  }

  const handleConfirm = () => {
    if (method === 'abha' && selectedProfile) {
      onNext(method, abhaVal, selectedProfile)
    } else if (method === 'phone') {
      onNext(method, phoneVal, { name: '', age: 0, gender: 'M', phone: phoneVal, abhaId: '' })
    } else {
      onNext(method, '', undefined)
    }
  }

  return (
    <KioskShell showProgress step={1} totalSteps={8} progressLabel="Step 1: Identification" onOpenHelp={onHelp} lang={lang}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-6 max-w-xl mx-auto w-full">
        <div className="text-center space-y-1">
          <h1 style={{ fontSize: 32, fontWeight: 800, color: T.text }}>
            {t.idTitle}
          </h1>
          <p style={{ fontSize: 16, color: T.muted }}>
            {t.idSub}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full">
          {[
            { id: 'abha', label: t.abhaScan, icon: '🪪' },
            { id: 'phone', label: t.phoneOption, icon: '📱' },
            { id: 'new', label: t.newPatient, icon: '🆕' },
          ].map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMethod(m.id as any)
                if (m.id === 'new') setSelectedProfile(null)
              }}
              className={`flex flex-col items-center justify-center py-4 px-2 rounded-2xl border-2 transition-all hover:scale-102 active:scale-95 text-center ${
                method === m.id
                  ? 'border-teal-600 bg-teal-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className="text-3xl">{m.icon}</span>
              <span className="font-bold text-xs text-slate-800 mt-2">{m.label}</span>
            </button>
          ))}
        </div>

        {method === 'abha' && (
          <div className="w-full space-y-4">
            {/* ABHA QR / Profile Presets for Demonstration */}
            <div className="p-4 rounded-2xl border bg-white shadow-xs space-y-3" style={{ borderColor: T.border }}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  {lang === 'hi' ? 'आयुष्मान भारत डिजिटल हेल्थ कार्ड (ABHA QR)' : 'Ayushman Bharat Digital Health Identifier (ABHA)'}
                </label>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                  ABDM Compliant
                </span>
              </div>

              {/* Demo Profile Selector */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500">
                  {lang === 'hi' ? 'त्वरित डेमो कार्ड चुनें:' : 'Select Demo ABHA Card / QR Profile:'}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {demoProfiles.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectProfile(p)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedProfile?.name === p.name
                          ? 'border-teal-600 bg-teal-50/80 ring-2 ring-teal-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{p.avatar}</span>
                        <span className="text-xs font-bold text-slate-800 truncate">{p.name.split(' ')[0]}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{p.age}{p.gender}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Verified Digital ABHA Card Preview */}
              {selectedProfile ? (
                <div className="p-4 rounded-xl bg-gradient-to-r from-teal-800 to-emerald-900 text-white shadow-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                        National Health Authority · Ayushman Bharat
                      </span>
                      <h4 className="font-bold text-base mt-0.5">{selectedProfile.name}</h4>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-xl shrink-0">
                      {selectedProfile.avatar}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 text-xs pt-1 border-t border-white/20">
                    <div>
                      <span className="text-[10px] text-emerald-200">ABHA Number:</span>
                      <p className="font-mono font-bold tracking-wider">{selectedProfile.abhaId}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-200">Demographics:</span>
                      <p className="font-semibold">{selectedProfile.age} yrs / {selectedProfile.gender === 'M' ? 'Male' : 'Female'} · +91 {selectedProfile.phone.slice(-4).padStart(10, '•')}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={abhaVal}
                    onChange={e => setAbhaVal(e.target.value)}
                    placeholder="14-digit ABHA ID or username@abdm"
                    className="w-full px-4 py-3.5 rounded-xl border font-mono text-base tracking-widest outline-none focus:border-teal-600"
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Verified with ABDM National Health Stack</span>
                <span className="text-emerald-700 font-semibold">✓ Linked to Health Locker</span>
              </div>
            </div>
          </div>
        )}

        {method === 'phone' && (
          <div className="w-full p-5 rounded-2xl border bg-white shadow-xs space-y-2.5" style={{ borderColor: T.border }}>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Enter 10-Digit Mobile Number
            </label>
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-3 rounded-xl bg-slate-100 border border-slate-200 font-mono text-sm text-slate-600 font-bold">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                value={phoneVal}
                onChange={e => setPhoneVal(e.target.value)}
                placeholder="9876543210"
                className="flex-1 px-4 py-3 rounded-xl border font-mono text-lg tracking-widest outline-none focus:border-teal-600"
              />
            </div>
          </div>
        )}

        {method === 'new' && (
          <div className="w-full p-5 rounded-2xl border border-teal-200 bg-teal-50/50 text-slate-700 text-xs space-y-1">
            <p className="font-bold text-teal-900 text-sm">🆕 First-Time Patient Registration</p>
            <p>You can create a temporary hospital OPD token. An ABHA ID will be generated for you after consultation.</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleConfirm}
          className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: T.teal }}
        >
          {method === 'new' ? 'Proceed to Details →' : 'Confirm & Proceed →'}
        </button>
      </div>
    </KioskShell>
  )
}

// ─── Screen 05 — Patient Details Confirmation ─────────────────────────────────
function PatientDetailsScreen({
  patientData,
  onChange,
  onNext,
  onHelp,
  lang
}: {
  patientData: { name: string; age: number; gender: string; phone: string }
  onChange: (field: string, val: any) => void
  onNext: () => void
  onHelp: () => void
  lang: LanguageCode
}) {
  const t = STRINGS[lang] || STRINGS.en

  return (
    <KioskShell showProgress step={2} totalSteps={8} progressLabel="Step 2: Basic Profile" onOpenHelp={onHelp} lang={lang}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-6 max-w-xl mx-auto w-full">
        <div className="text-center space-y-1">
          <h1 style={{ fontSize: 32, fontWeight: 800, color: T.text }}>
            {t.confirmDetails}
          </h1>
          <p style={{ fontSize: 16, color: T.muted }}>
            Please confirm your demographic information for clinical records.
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full bg-white p-6 rounded-3xl border shadow-xs" style={{ borderColor: T.border }}>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{t.fullName}</label>
            <input
              type="text"
              value={patientData.name}
              onChange={e => onChange('name', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border font-bold text-lg mt-1 outline-none focus:border-teal-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{t.age}</label>
              <input
                type="number"
                value={patientData.age}
                onChange={e => onChange('age', Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border font-bold text-lg mt-1 outline-none focus:border-teal-600"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{t.gender}</label>
              <div className="flex gap-2 mt-1">
                {['M', 'F', 'Other'].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => onChange('gender', g)}
                    className={`flex-1 py-3 rounded-xl border font-bold text-base transition-colors ${
                      patientData.gender === g
                        ? 'border-teal-600 bg-teal-50 text-teal-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{t.phone}</label>
            <input
              type="text"
              value={patientData.phone}
              onChange={e => onChange('phone', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border font-semibold text-base mt-1 outline-none focus:border-teal-600"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onNext}
          className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: T.teal }}
        >
          Confirm Details & Select Clinic →
        </button>
      </div>
    </KioskShell>
  )
}

// ─── Screen 06 — Chief Complaint with VoiceInput ──────────────────────────────
const COMPLAINTS = [
  { icon: '🦴', labelEn: 'Joint / Knee Pain', labelHi: 'संधिवात (जोड़ों में दर्द)' },
  { icon: '🔥', labelEn: 'Acidity & Digestion', labelHi: 'अम्लपित्त (गैस / एसिडिटी)' },
  { icon: '❤️', labelEn: 'Chest Pain', labelHi: 'सीने में दर्द व बेचैनी' },
  { icon: '😮‍💨', labelEn: 'Breathing Problem', labelHi: 'सांस लेने में कठिनाई' },
  { icon: '🤕', labelEn: 'Headache & Migraine', labelHi: 'सिरदर्द व चक्कर' },
  { icon: '🩹', labelEn: 'Skin Rash & Itching', labelHi: 'त्वचा पर खुजली व चकत्ते' },
  { icon: '🌡️', labelEn: 'Fever & Fatigue', labelHi: 'बुखार व कमजोरी' },
  { icon: '📋', labelEn: 'Routine Health Check', labelHi: 'सामान्य स्वास्थ्य परामर्श' },
]

function ChiefComplaintScreen({
  onNext,
  onHelp,
  lang
}: {
  onNext: (complaint: string, rawStatement: string) => void
  onHelp: () => void
  lang: LanguageCode
}) {
  const t = STRINGS[lang] || STRINGS.en
  const [selectedChip, setSelectedChip] = useState<string | null>(null)
  const [voiceText, setVoiceText] = useState('')

  const handleTranscript = (transcript: string) => {
    setVoiceText(transcript)
    setSelectedChip(transcript)
  }

  const handleChipClick = (c: typeof COMPLAINTS[0]) => {
    const label = lang === 'hi' ? c.labelHi : c.labelEn
    setSelectedChip(label)
    setVoiceText(label)
  }

  return (
    <KioskShell showProgress step={3} totalSteps={8} progressLabel="Step 3: Chief Complaint" onOpenHelp={onHelp} lang={lang}>
      <div className="flex-1 flex flex-col items-center px-6 py-8 gap-6 max-w-2xl mx-auto w-full">
        <div className="text-center space-y-1">
          <h1 style={{ fontSize: 32, fontWeight: 800, color: T.text }}>
            {t.complaintTitle}
          </h1>
          <p style={{ fontSize: 16, color: T.muted }}>
            {t.voicePrimary}
          </p>
        </div>

        {/* Voice Input Reusable Component */}
        <VoiceInput
          promptText={t.complaintTitle}
          lang={lang}
          onTranscriptConfirmed={handleTranscript}
          samplePhrases={[
            'Severe joint pain in both knees since six months',
            'Heavy chest pressure spreading to left arm',
            'Acidity, sour belching and stomach burning after food',
            'High fever and chills since three days'
          ]}
        />

        <div className="w-full flex items-center gap-4 my-1">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs font-bold uppercase text-slate-400">{t.orChoose}</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Quick Selection Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
          {COMPLAINTS.map(c => {
            const label = lang === 'hi' ? c.labelHi : c.labelEn
            const isSelected = selectedChip === label
            return (
              <button
                key={c.labelEn}
                type="button"
                onClick={() => handleChipClick(c)}
                className={`py-4 px-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all hover:scale-102 active:scale-95 text-center ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="text-2xl">{c.icon}</span>
                <span className="text-xs font-bold text-slate-800 leading-tight">{label}</span>
              </button>
            )
          })}
        </div>

        {(selectedChip || voiceText) && (
          <button
            type="button"
            onClick={() => onNext(selectedChip || voiceText, voiceText)}
            className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-sm transition-opacity hover:opacity-90 mt-2"
            style={{ backgroundColor: T.teal }}
          >
            Continue to Symptom Questions →
          </button>
        )}
      </div>
    </KioskShell>
  )
}

// ─── Screen 07 — Dynamic AI Questioning (Mandatory "I don't know") ────────────
function AIConversationScreen({
  complaint,
  onNext,
  onRedFlag,
  onHelp,
  lang
}: {
  complaint: string
  onNext: () => void
  onRedFlag: () => void
  onHelp: () => void
  lang: LanguageCode
}) {
  const t = STRINGS[lang] || STRINGS.en
  const isJoint = complaint.toLowerCase().includes('joint') || complaint.toLowerCase().includes('knee') || complaint.toLowerCase().includes('संधि')
  const isChest = complaint.toLowerCase().includes('chest') || complaint.toLowerCase().includes('सीने')

  const DONT_KNOW = t.dontKnow

  const questions = isJoint
    ? [
        { q: 'When is the stiffness or pain in your joints most noticeable?', opts: ['First thing in morning upon waking', 'After prolonged walking or standing', 'Continuous ache throughout day', 'Worse in cold windy weather', DONT_KNOW] },
        { q: 'Do you notice any swelling or cracking sound (crepitus) in the joints?', opts: ['Yes, noticeable swelling & warmth', 'Cracking sound with dryness', 'Stiffness without heat or redness', 'None of these', DONT_KNOW] },
        { q: 'Does application of warm sesame oil or warm fomentation provide relief?', opts: ['Yes, significant relief with warm oil', 'Cold application feels better', 'Neither makes any difference', 'Oil massage increases pain', DONT_KNOW] },
      ]
    : [
        { q: 'I want to understand your discomfort better. When did it start?', opts: ['Started suddenly today', 'Yesterday', 'Past 3 to 7 days', 'Chronic (Over 1 month)', DONT_KNOW] },
        { q: 'How would you describe the feeling?', opts: ['Heavy pressure / tight squeezing', 'Sharp stabbing pain on deep breathing', 'Burning sensation behind breastbone', 'Mild musculoskeletal soreness', DONT_KNOW] },
        { q: 'Does the pain spread to your arm, neck, or back?', opts: ['Yes, radiates down left arm or jaw', 'Spreads to upper back', 'Stays strictly localized', 'No radiation', DONT_KNOW] },
        { q: 'Do you feel severe cold sweating or sudden breathlessness?', opts: ['Yes, profuse cold sweats (Urgent)', 'Shortness of breath on walking', 'No sweating or breathlessness', 'Palpitations', DONT_KNOW] }
      ]

  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])

  const handleAnswer = (ans: string) => {
    const updated = [...answers, ans]
    setAnswers(updated)

    // Red-flag detection for acute typical chest pain with diaphoresis
    if (isChest && qIndex === 3 && ans.includes('Yes')) {
      onRedFlag()
      return
    }

    if (qIndex < questions.length - 1) {
      setQIndex(qIndex + 1)
    } else {
      onNext()
    }
  }

  const q = questions[qIndex]
  const pct = 40 + Math.round((qIndex / questions.length) * 20)

  return (
    <KioskShell showProgress step={4} totalSteps={8} progressLabel="Step 4: AI Symptom Questions" onOpenHelp={onHelp} lang={lang}>
      <div className="flex-1 flex flex-col items-center justify-between px-6 py-8 gap-6 max-w-2xl mx-auto w-full">
        {/* Avatar & Question */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-xs" style={{ backgroundColor: T.tealLight }}>
            👩‍⚕️
          </div>
          <div className="px-6 py-5 rounded-3xl bg-teal-50 border border-teal-300 max-w-lg shadow-xs">
            <p className="font-bold text-slate-900 text-xl leading-relaxed">{q.q}</p>
          </div>
        </div>

        {/* Answer Options */}
        <div className="flex flex-col gap-2.5 w-full">
          {q.opts.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => handleAnswer(opt)}
              className={`p-4 rounded-2xl border-2 font-semibold text-sm transition-all hover:scale-101 active:scale-98 text-left ${
                opt === DONT_KNOW
                  ? 'border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100 italic'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-teal-600 hover:bg-teal-50/50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Repeat Audio */}
        <button
          type="button"
          onClick={() => speakText(q.q, lang)}
          className="text-xs font-semibold text-teal-800 hover:underline flex items-center gap-1.5"
        >
          <span>🔊</span> {t.repeatQuestion}
        </button>
      </div>
    </KioskShell>
  )
}

// ─── Screen 08 — Medication Flow ──────────────────────────────────────────────
function MedicationScreen({
  onNext,
  onHelp,
  lang
}: {
  onNext: () => void
  onHelp: () => void
  lang: LanguageCode
}) {
  const t = STRINGS[lang] || STRINGS.en
  const [choice, setChoice] = useState<string | null>(null)

  return (
    <KioskShell showProgress step={5} totalSteps={8} progressLabel="Step 5: Current Medicines" onOpenHelp={onHelp} lang={lang}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-6 max-w-xl mx-auto w-full">
        <h1 style={{ fontSize: 32, fontWeight: 800, color: T.text, textAlign: 'center' }}>
          {t.medicinesTitle}
        </h1>
        <div className="flex flex-col gap-3.5 w-full">
          {[
            { id: 'yes', label: 'Yes, I currently take prescribed medicines', icon: '💊' },
            { id: 'no', label: 'No, I take no regular medicines', icon: '✓' },
            { id: 'unsure', label: "I don't know / Not sure", icon: '?' }
          ].map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setChoice(opt.id)}
              className={`flex items-center gap-4 py-5 px-6 rounded-2xl border-2 font-bold text-lg transition-all ${
                choice === opt.id
                  ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
              }`}
            >
              <span className="text-2xl">{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>

        {choice && (
          <button
            type="button"
            onClick={onNext}
            className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: T.teal }}
          >
            Continue to Allergy Check →
          </button>
        )}
      </div>
    </KioskShell>
  )
}

// ─── Screen 09 — Allergy Flow (Strict Differentiation) ────────────────────────
function AllergyScreen({
  onNext,
  onHelp,
  lang
}: {
  onNext: (status: 'none' | 'yes' | 'unspecified') => void
  onHelp: () => void
  lang: LanguageCode
}) {
  const t = STRINGS[lang] || STRINGS.en
  const [choice, setChoice] = useState<'none' | 'yes' | 'unspecified' | null>(null)

  return (
    <KioskShell showProgress step={6} totalSteps={8} progressLabel="Step 6: Allergies" onOpenHelp={onHelp} lang={lang}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-6 max-w-xl mx-auto w-full">
        <h1 style={{ fontSize: 32, fontWeight: 800, color: T.text, textAlign: 'center' }}>
          {t.allergiesTitle}
        </h1>
        <p className="text-xs text-slate-500 text-center">
          Note: "No known allergies" is clinically distinguished from "Allergy information not provided".
        </p>

        <div className="flex flex-col gap-3.5 w-full">
          {[
            { id: 'none', label: 'No Known Drug or Food Allergies (NKDA)', icon: '🟢', color: T.success },
            { id: 'yes', label: 'Yes, I have an allergic reaction to medicines/food', icon: '🔴', color: T.critical },
            { id: 'unspecified', label: 'Allergy information not provided / Not sure', icon: '🟡', color: T.warning }
          ].map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setChoice(opt.id as any)}
              className={`flex items-center gap-4 py-5 px-6 rounded-2xl border-2 font-bold text-base transition-all ${
                choice === opt.id
                  ? 'border-teal-600 bg-teal-50 text-slate-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
              }`}
            >
              <span className="text-2xl">{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>

        {choice && (
          <button
            type="button"
            onClick={() => onNext(choice)}
            className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: T.teal }}
          >
            Continue to Previous Records →
          </button>
        )}
      </div>
    </KioskShell>
  )
}

// ─── Screen 10 — Medical Document Upload & Real Gemini Vision OCR ─────────────
function DocumentScanScreen({
  onNext,
  onSkip,
  onHelp,
  lang,
  onFileReady,
  isOcrProcessing,
  ocrCount,
  ocrMeta
}: {
  onNext: () => void
  onSkip: () => void
  onHelp: () => void
  lang: LanguageCode
  onFileReady?: (file: File, previewUrl: string) => Promise<void> | void
  isOcrProcessing?: boolean
  ocrCount?: number
  ocrMeta?: { doctorName?: string; clinicName?: string; date?: string; offline?: boolean; message?: string } | null
}) {
  const t = STRINGS[lang] || STRINGS.en
  const [phase, setPhase] = useState<'idle' | 'dragover' | 'processing' | 'done' | 'error'>('idle')
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const processFile = async (file: File) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'image/heic', 'image/jpg']
    if (!allowed.includes(file.type) && !file.name.match(/\.(jpe?g|png|webp|pdf|heic)$/i)) {
      setPhase('error')
      setErrorMsg(`Unsupported file type. Please upload a JPG, PNG, or PDF.`)
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setPhase('error')
      setErrorMsg('File too large. Maximum 20 MB allowed.')
      return
    }

    setFileName(file.name)
    setFileSize(formatSize(file.size))
    setErrorMsg('')

    let url = ''
    if (file.type.startsWith('image/')) {
      url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }

    // Real OCR processing with animated progress
    setPhase('processing')
    setOcrProgress(15)

    const timer = setInterval(() => {
      setOcrProgress(prev => (prev < 90 ? prev + Math.floor(Math.random() * 8 + 6) : prev))
    }, 280)

    try {
      if (onFileReady) {
        await onFileReady(file, url)
      }
    } finally {
      clearInterval(timer)
      setOcrProgress(100)
      setPhase('done')
    }
  }

  const handleLoadSamplePrescription = async () => {
    try {
      setPhase('processing')
      setFileName('sample_ayush_prescription.jpg')
      setFileSize('754 KB')
      setOcrProgress(20)

      const res = await fetch('http://localhost:5000/api/ocr/sample')
      if (!res.ok) throw new Error('Sample not available from server')
      const blob = await res.blob()
      const sampleFile = new File([blob], 'sample_ayush_prescription.jpg', { type: 'image/jpeg' })
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)

      const timer = setInterval(() => {
        setOcrProgress(prev => (prev < 90 ? prev + 10 : prev))
      }, 250)

      if (onFileReady) {
        await onFileReady(sampleFile, url)
      }
      clearInterval(timer)
      setOcrProgress(100)
      setPhase('done')
    } catch (err: any) {
      console.error('Failed to load sample prescription:', err)
      setPhase('error')
      setErrorMsg(err.message || 'Could not load sample prescription.')
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setPhase('idle')
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const handleReset = () => {
    setPhase('idle')
    setFileName('')
    setFileSize('')
    setPreviewUrl(null)
    setOcrProgress(0)
    setErrorMsg('')
  }

  return (
    <KioskShell showProgress step={7} totalSteps={8} progressLabel="Step 7: Medical Documents" onOpenHelp={onHelp} lang={lang}>
      <div className="flex-1 flex flex-col items-center px-6 py-8 gap-5 max-w-2xl mx-auto w-full">
        <div className="text-center space-y-1">
          <h1 style={{ fontSize: 32, fontWeight: 800, color: T.text }}>
            {t.documentsTitle}
          </h1>
          <p style={{ fontSize: 16, color: T.muted }}>
            Upload a photo or PDF of your prescription or lab report. Google Gemini Vision extracts your medicines automatically.
          </p>
        </div>

        {/* Hidden real file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf"
          className="hidden"
          onChange={handleFileInput}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileInput}
        />

        {/* ── IDLE / ERROR phase ─── */}
        {(phase === 'idle' || phase === 'dragover' || phase === 'error') && (
          <div className="w-full flex flex-col gap-4">
            {/* Quick Demo Sample Prescription Trigger */}
            <button
              type="button"
              onClick={handleLoadSamplePrescription}
              className="w-full py-4 px-5 rounded-3xl border-2 border-dashed border-teal-500 bg-teal-50/90 hover:bg-teal-100/90 text-teal-950 font-bold transition-all flex items-center justify-between shadow-xs cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 text-left">
                <span className="text-3xl group-hover:scale-110 transition-transform">⚡</span>
                <div>
                  <p className="font-black text-teal-900 text-sm sm:text-base">Try Sample Doctor Prescription</p>
                  <p className="text-xs text-teal-700 font-medium">Dr. Rajesh Sharma BAMS MD · Amlodipine, Metformin, Ashwagandha</p>
                </div>
              </div>
              <span className="text-xs bg-teal-700 text-white font-bold px-3.5 py-2 rounded-xl shrink-0 group-hover:bg-teal-800 shadow-xs">
                Run Real OCR →
              </span>
            </button>

            {/* Drag & Drop Upload Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setPhase('dragover') }}
              onDragLeave={() => { if (phase === 'dragover') setPhase('idle') }}
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4 py-10 px-6 cursor-pointer transition-all select-none"
              style={{
                borderColor: phase === 'dragover' ? T.teal : phase === 'error' ? T.critical : T.border,
                backgroundColor: phase === 'dragover' ? T.tealLight : phase === 'error' ? '#FEF2F2' : '#F8FAFC',
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-transform hover:scale-105"
                style={{ backgroundColor: phase === 'error' ? '#FEE2E2' : T.tealLight }}
              >
                {phase === 'error' ? '⚠️' : phase === 'dragover' ? '📂' : '📄'}
              </div>
              {phase === 'error' ? (
                <div className="text-center">
                  <p className="font-bold text-rose-700 text-base">{errorMsg}</p>
                  <p className="text-xs text-rose-400 mt-1">Click here or drag a file to try again</p>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <p className="font-bold text-slate-700 text-lg">
                    {phase === 'dragover' ? 'Drop to upload' : 'Click to select your document'}
                  </p>
                  <p className="text-sm text-slate-500">
                    Prescription, Lab Report, or Discharge Summary
                  </p>
                  <p className="text-xs text-slate-400">
                    Accepts JPG, PNG, PDF · Max 20 MB · Or drag & drop here
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons Row */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-4 rounded-2xl border-2 font-bold text-sm border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>📁</span> Browse Files
              </button>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="py-4 rounded-2xl border-2 font-bold text-sm border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>📷</span> Open Camera
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs font-bold text-slate-400 uppercase">or</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={onSkip}
              className="w-full py-3.5 rounded-xl border-2 font-semibold text-sm text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
              style={{ borderColor: T.border }}
            >
              Skip — I have no previous medical documents
            </button>
          </div>
        )}

        {/* ── PROCESSING phase ─── */}
        {phase === 'processing' && (
          <div className="w-full flex flex-col items-center gap-6 py-6">
            <div className="w-20 h-20 rounded-2xl bg-teal-100 flex items-center justify-center text-4xl animate-pulse">
              🔬
            </div>
            <div className="text-center space-y-1">
              <p className="font-black text-teal-900 text-xl">Analyzing Prescription with Gemini Vision...</p>
              <p className="text-sm text-slate-500 font-medium">{fileName}</p>
              <p className="text-xs text-slate-400">AI is reading medications, dosages, frequencies, and doctor credentials</p>
            </div>

            <div className="w-full max-w-md">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
                <span>Clinical entity extraction...</span>
                <span className="font-bold text-teal-700">{ocrProgress}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 text-sm text-slate-500 w-full max-w-md">
              {ocrProgress > 15 && <p><span className="text-emerald-600 font-bold mr-2">✓</span>Document structure analyzed</p>}
              {ocrProgress > 35 && <p><span className="text-emerald-600 font-bold mr-2">✓</span>Clinical text regions identified</p>}
              {ocrProgress > 60 && <p><span className="text-emerald-600 font-bold mr-2">✓</span>Medications and dosages parsed</p>}
              {ocrProgress >= 90 && <p><span className="animate-pulse text-teal-600 font-bold mr-2">⟳</span>Finalizing structured clinical data...</p>}
            </div>
          </div>
        )}

        {/* ── DONE phase ─── */}
        {phase === 'done' && (
          <div className="w-full flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200">
              {previewUrl ? (
                <div className="w-28 h-36 rounded-xl border-2 border-emerald-300 overflow-hidden shadow-md shrink-0 bg-white">
                  <img src={previewUrl} alt="Uploaded document preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-32 rounded-xl border-2 border-emerald-300 bg-white flex items-center justify-center text-5xl shrink-0 shadow-sm">
                  📄
                </div>
              )}

              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">✅</span>
                  <div>
                    <p className="font-black text-emerald-900 text-lg">Document Processed</p>
                    <p className="text-xs text-slate-500 font-mono">{fileName} · {fileSize}</p>
                  </div>
                </div>

                {isOcrProcessing ? (
                  <div className="p-3 rounded-xl bg-teal-100/80 border border-teal-300 flex items-center gap-2 text-teal-950 text-xs font-bold animate-pulse">
                    <span className="animate-spin text-teal-700">⟳</span>
                    <span>Extracting clinical entities with Google Gemini Vision...</span>
                  </div>
                ) : ocrMeta?.offline ? (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 space-y-1">
                    <p className="font-bold">⚠️ Offline Clinical Fallback Active</p>
                    <p className="text-[11px] text-amber-800">{ocrMeta.message || 'Prescription captured. Please verify medications on the next screen.'}</p>
                  </div>
                ) : ocrCount && ocrCount > 0 ? (
                  <div className="text-xs space-y-1 text-emerald-900 p-2.5 rounded-xl bg-emerald-100/50 border border-emerald-200">
                    <p className="font-extrabold text-emerald-950">
                      ✓ {ocrCount} medication(s) extracted via Google Gemini Vision
                    </p>
                    {ocrMeta?.doctorName && <p>• Doctor / Clinic: <span className="font-semibold">{ocrMeta.doctorName}</span></p>}
                    {ocrMeta?.date && <p>• Prescription Date: <span className="font-semibold">{ocrMeta.date}</span></p>}
                  </div>
                ) : (
                  <div className="text-xs space-y-1 text-slate-700 p-2.5 rounded-xl bg-slate-100 border border-slate-200">
                    <p className="font-bold">ℹ️ No prescription medicines clearly detected in document</p>
                    <p className="text-[11px] text-slate-500">You can add your medications manually on the next screen.</p>
                  </div>
                )}

                <p className="text-[10px] text-amber-800 italic font-semibold mt-1">
                  AI-assisted extraction draft — please verify each medicine on the next screen
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-teal-700 hover:underline text-left mt-1 font-medium cursor-pointer"
                >
                  ↻ Upload or scan a different document
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={isOcrProcessing}
              onClick={onNext}
              className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2 cursor-pointer"
              style={{ backgroundColor: T.teal }}
            >
              {isOcrProcessing ? 'Extracting with Gemini Vision...' : `${t.verifyOcr} →`}
            </button>
          </div>
        )}
      </div>
    </KioskShell>
  )
}

// ─── Screen 11 — Review & Patient Confirmation ────────────────────────────────
function ReviewScreen({
  patientData,
  opdType,
  complaint,
  ayushAnswers,
  vitals,
  medications,
  allergyStatus,
  onSubmit,
  onEditSection,
  onHelp,
  lang,
  isSubmitting
}: {
  patientData: any
  opdType: OPDType
  complaint: string
  ayushAnswers: any
  vitals?: VitalsData | null
  medications: MedicationRecord[]
  allergyStatus: string
  onSubmit: () => void
  onEditSection: (screen: Screen) => void
  onHelp: () => void
  lang: LanguageCode
  isSubmitting: boolean
}) {
  const t = STRINGS[lang] || STRINGS.en
  const [patientConfirmed, setPatientConfirmed] = useState(false)

  return (
    <KioskShell showProgress step={8} totalSteps={8} progressLabel="Step 8: Final Review" onOpenHelp={onHelp} lang={lang}>
      <div className="flex-1 flex flex-col items-center px-6 py-8 gap-6 max-w-2xl mx-auto w-full">
        <h1 style={{ fontSize: 32, fontWeight: 800, color: T.text, textAlign: 'center' }}>
          {t.reviewTitle}
        </h1>

        <div className="flex flex-col gap-3 w-full">
          {/* Patient Details */}
          <div className="p-4 rounded-2xl border bg-white flex items-center justify-between" style={{ borderColor: T.border }}>
            <div>
              <p className="text-[11px] font-bold uppercase text-slate-400">Patient & ABHA ID</p>
              <p className="font-bold text-slate-900 text-base">{patientData.name} ({patientData.age}{patientData.gender})</p>
              <p className="text-xs text-slate-500 font-mono">{patientData.abhaId || 'ABHA: 14-8921-3321-9988'}</p>
            </div>
            <button onClick={() => onEditSection('profile')} className="text-teal-700 font-bold text-xs hover:underline">
              ✎ Edit
            </button>
          </div>

          {/* OPD Clinic */}
          <div className="p-4 rounded-2xl border bg-white flex items-center justify-between" style={{ borderColor: T.border }}>
            <div>
              <p className="text-[11px] font-bold uppercase text-slate-400">Consultation Clinic</p>
              <p className="font-bold text-slate-900 text-base">
                {opdType === 'ayush' ? '🌿 Ministry of Ayush (Ayurveda OPD)' : '🏥 General Allopathy OPD'}
              </p>
            </div>
            <button onClick={() => onEditSection('pathway')} className="text-teal-700 font-bold text-xs hover:underline">
              ✎ Edit
            </button>
          </div>

          {/* Chief Complaint */}
          <div className="p-4 rounded-2xl border bg-white flex items-center justify-between" style={{ borderColor: T.border }}>
            <div>
              <p className="text-[11px] font-bold uppercase text-slate-400">Reported Problem</p>
              <p className="font-bold text-slate-900 text-base">{complaint || 'General OPD Review'}</p>
            </div>
            <button onClick={() => onEditSection('complaint')} className="text-teal-700 font-bold text-xs hover:underline">
              ✎ Edit
            </button>
          </div>

          {/* AYUSH Assessment */}
          {opdType === 'ayush' && ayushAnswers && (
            <div className="p-4 rounded-2xl border bg-emerald-50/70 border-emerald-200 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-emerald-800">Ayush Pariksha Status</p>
                <p className="font-bold text-slate-900 text-sm">
                  Agni: {ayushAnswers.agniChoice || 'Vishama'} · Koshtha: {ayushAnswers.koshthaChoice || 'Krura'}
                </p>
                <p className="text-xs text-emerald-800 font-medium">Prakriti assessment ready for physician</p>
              </div>
              <button onClick={() => onEditSection('ayush_intake')} className="text-emerald-800 font-bold text-xs hover:underline">
                ✎ Edit
              </button>
            </div>
          )}

          {/* Vital Signs (Cardiology/Allopathy OPD) */}
          {vitals && (vitals.bpSystolic || vitals.pulse || vitals.spo2 || vitals.temperature) && (
            <div className="p-4 rounded-2xl border bg-blue-50/60 border-blue-200 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-blue-800">Triage Vital Signs</p>
                <p className="font-bold text-slate-900 text-sm">
                  {vitals.bpSystolic && vitals.bpDiastolic ? `BP: ${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg ` : ''}
                  {vitals.pulse ? `· Pulse: ${vitals.pulse} BPM ` : ''}
                  {vitals.spo2 ? `· SpO2: ${vitals.spo2}% ` : ''}
                  {vitals.temperature ? `· Temp: ${vitals.temperature} °F` : ''}
                </p>
                {vitals.isCritical && (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                    Urgent Alert Flagged
                  </span>
                )}
              </div>
              <button onClick={() => onEditSection('vitals')} className="text-blue-700 font-bold text-xs hover:underline">
                ✎ Edit
              </button>
            </div>
          )}

          {/* Meds & Allergies */}
          <div className="p-4 rounded-2xl border bg-white flex items-center justify-between" style={{ borderColor: T.border }}>
            <div>
              <p className="text-[11px] font-bold uppercase text-slate-400">Medications & Allergies</p>
              <p className="font-bold text-slate-900 text-sm">
                {medications.length} active medicine(s) verified via OCR · Allergy: {allergyStatus === 'none' ? 'NKDA' : 'Reported'}
              </p>
            </div>
            <button onClick={() => onEditSection('ocr_verify')} className="text-teal-700 font-bold text-xs hover:underline">
              ✎ Edit
            </button>
          </div>
        </div>

        {/* Patient Explicit Confirmation Checkbox */}
        <label className="flex items-start gap-3 p-4 rounded-2xl border border-teal-300 bg-teal-50/60 cursor-pointer w-full">
          <input
            type="checkbox"
            checked={patientConfirmed}
            onChange={e => setPatientConfirmed(e.target.checked)}
            className="w-5 h-5 mt-0.5 rounded accent-teal-700"
          />
          <span className="text-xs font-semibold text-teal-950 leading-relaxed">
            {t.reviewConfirmNotice}
          </span>
        </label>

        <button
          type="button"
          disabled={!patientConfirmed || isSubmitting}
          onClick={onSubmit}
          className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ backgroundColor: T.teal }}
        >
          {isSubmitting ? 'Syncing case with OPD Queue...' : t.submitHistory}
        </button>
      </div>
    </KioskShell>
  )
}

// ─── Screen 12 — Completion Screen (Privacy Preserved) ────────────────────────
function CompletionScreen({
  token,
  opdType,
  patientName,
  onReset,
  lang
}: {
  token: string
  opdType: OPDType
  patientName?: string
  onReset: () => void
  lang: LanguageCode
}) {
  const t = STRINGS[lang] || STRINGS.en
  const [smsSent, setSmsSent] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleSendSms = () => {
    setSmsSent(true)
    setTimeout(() => setSmsSent(false), 4000)
  }

  return (
    <KioskShell hideHelp lang={lang}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-5 text-center max-w-xl mx-auto w-full">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-4xl shadow-xs ring-8 ring-emerald-50">
          ✅
        </div>
        <div className="space-y-1">
          <h1 style={{ fontSize: 30, fontWeight: 900, color: T.success }}>
            {t.tokenTitle}
          </h1>
          <p style={{ fontSize: 15, color: T.muted }}>
            {t.tokenSub}
          </p>
        </div>

        {/* High-Impact Digital Token Card */}
        <div className="p-6 rounded-3xl border-2 bg-gradient-to-b from-white to-slate-50 shadow-md w-full text-left space-y-4" style={{ borderColor: T.teal }}>
          <div className="flex justify-between items-start border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Official OPD Token Slip · Ministry of Ayush / ABDM
              </span>
              <p className="text-5xl font-black text-slate-900 mt-1">{token || '#126'}</p>
            </div>

            {/* Crisp SVG QR Code for Token Tracking */}
            <div className="w-20 h-20 bg-white border border-slate-200 rounded-xl p-1.5 flex flex-col items-center justify-center shadow-xs shrink-0">
              <svg viewBox="0 0 40 40" className="w-full h-full text-slate-900" fill="currentColor">
                <rect x="2" y="2" width="10" height="10" />
                <rect x="4" y="4" width="6" height="6" fill="white" />
                <rect x="5" y="5" width="4" height="4" />
                <rect x="28" y="2" width="10" height="10" />
                <rect x="30" y="4" width="6" height="6" fill="white" />
                <rect x="31" y="5" width="4" height="4" />
                <rect x="2" y="28" width="10" height="10" />
                <rect x="4" y="30" width="6" height="6" fill="white" />
                <rect x="5" y="31" width="4" height="4" />
                <rect x="16" y="4" width="4" height="4" />
                <rect x="22" y="4" width="4" height="4" />
                <rect x="16" y="16" width="8" height="8" />
                <rect x="4" y="16" width="4" height="4" />
                <rect x="28" y="16" width="4" height="4" />
                <rect x="16" y="28" width="4" height="8" />
                <rect x="24" y="24" width="6" height="4" />
                <rect x="32" y="32" width="6" height="6" />
              </svg>
              <span className="text-[8px] font-bold text-slate-400 mt-0.5">Scan to Track</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Patient Name</span>
              <p className="font-bold text-slate-800">{patientName || 'Patient'}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Consulting Clinic</span>
              <p className="font-bold text-slate-800">{opdType === 'ayush' ? 'Ayurveda OPD' : 'Cardiology OPD'}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Assigned Room / Counter</span>
              <p className="font-bold text-teal-800">
                {opdType === 'ayush' ? 'Room 104 · Counter 2' : 'Room 202 · Counter 5'}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Estimated Wait</span>
              <p className="font-bold text-emerald-700">~10-15 mins (2 ahead)</p>
            </div>
          </div>
        </div>

        {/* Print & SMS Actions */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            type="button"
            onClick={handlePrint}
            className="py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <span>🖨️</span> {t.printSlip || 'Print Token Slip'}
          </button>
          <button
            type="button"
            onClick={handleSendSms}
            className="py-3 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 font-bold text-xs text-teal-800 flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <span>📱</span> {t.sendSms || 'Send Slip via SMS'}
          </button>
        </div>

        {smsSent && (
          <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-semibold animate-fade-in w-full">
            ✓ {t.smsSent || 'Token details sent to your registered phone number!'}
          </div>
        )}

        <p className="text-xs text-slate-400">
          For privacy and confidentiality, this kiosk resets automatically in 60 seconds.
        </p>

        <button
          type="button"
          onClick={onReset}
          className="w-full py-3.5 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm shadow-sm transition-colors"
        >
          Done (Clear Data & Return to Home)
        </button>
      </div>
    </KioskShell>
  )
}

// ─── Screen 13 — Red Flag Screen (Safe, Non-Diagnostic) ───────────────────────
function RedFlagScreen({
  onDismiss,
  lang
}: {
  onDismiss: () => void
  lang: LanguageCode
}) {
  const t = STRINGS[lang] || STRINGS.en

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 py-16 gap-8 text-center text-white font-sans bg-gradient-to-b from-rose-900 via-slate-900 to-rose-950">
      <div className="w-24 h-24 rounded-full bg-rose-500/30 border-2 border-rose-400 flex items-center justify-center text-5xl animate-pulse shadow-lg">
        🚨
      </div>

      <div className="max-w-xl space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-rose-300 bg-rose-950/80 px-3 py-1 rounded-full border border-rose-500/30">
          Priority Clinical Attention Required
        </span>
        <h1 className="text-3xl sm:text-4xl font-black leading-tight">
          {t.redFlagAlert}
        </h1>
        <p className="text-base text-rose-100 leading-relaxed">
          {t.redFlagSub}
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-white/10 border border-white/20 max-w-md w-full text-left space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 text-lg">✓</span>
          <p className="font-bold text-sm text-white">Staff Alert Triggered</p>
        </div>
        <p className="text-xs text-white/80 leading-relaxed">
          Please remain comfortably seated at this kiosk booth. A nursing officer or doctor is arriving to examine you immediately.
        </p>
        <div className="pt-2 border-t border-white/15 flex justify-between text-[11px] text-rose-200">
          <span>Triage Priority: Urgent</span>
          <span>Response Station: Booth 1</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="px-8 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold text-white border border-white/30 transition-colors"
      >
        Dismiss Alert (Staff Assisted) →
      </button>
    </div>
  )
}

// ─── Physician Dashboard (Portal with RBAC, Red-Flags, & Timeline) ────────────
function PhysicianDashboardView({
  onBack,
  user
}: {
  onBack: () => void
  user: { name: string; role: UserRole; department: string }
}) {
  const [queue, setQueue] = useState<PatientCase[]>([])
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-102')
  const [activeTab, setActiveTab] = useState<'summary' | 'timeline' | 'documents'>('summary')
  const [loading, setLoading] = useState(true)
  const [traceItem, setTraceItem] = useState<any>(null)

  const loadData = async () => {
    setLoading(true)
    const items = await fetchQueue()
    if (items.length > 0) {
      setQueue(items)
      if (!items.find(i => i.id === selectedCaseId)) {
        setSelectedCaseId(items[0].id)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    // Auto-refresh physician queue every 30 seconds
    const refreshInterval = setInterval(loadData, 30000)
    return () => clearInterval(refreshInterval)
  }, [])

  const currentPatient = queue.find(p => p.id === selectedCaseId) || queue[0]

  const handleStatusChange = async (newStatus: 'waiting' | 'in-consultation' | 'completed', notes?: string) => {
    if (!currentPatient) return
    await updateQueueStatus(currentPatient.id, newStatus, notes)
    loadData()
  }

  const handleAcknowledgeRedFlag = async (flagId: string) => {
    if (!currentPatient) return
    await acknowledgeRedFlag(currentPatient.id, flagId, user.name)
    loadData()
  }

  const handleDismissRedFlag = async (flagId: string) => {
    const reason = prompt('Please enter clinical rationale for dismissing red flag:')
    if (reason && currentPatient) {
      await acknowledgeRedFlag(currentPatient.id, flagId, user.name, reason)
      loadData()
    }
  }

  return (
    <div className="min-h-full flex flex-col font-sans" style={{ backgroundColor: T.bg }}>
      <DemoBanner />

      {/* Source Trace Modal */}
      <SourceTraceModal
        isOpen={Boolean(traceItem)}
        onClose={() => setTraceItem(null)}
        item={traceItem}
      />

      {/* Physician Header */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b bg-slate-950 text-white">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-slate-400 hover:text-white text-xl" title="Return to Kiosk">←</button>
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center font-bold text-sm">
            🩺
          </div>
          <div>
            <span className="font-bold text-base">Physician Review Portal</span>
            <span className="ml-2 text-[10px] font-bold bg-teal-900 text-teal-200 border border-teal-700 px-2 py-0.5 rounded">
              Role: {user.role.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <button
            onClick={async () => {
              if (window.confirm('Reseed demo queue with standard SIH cases?')) {
                await resetDemoDataApi()
                loadData()
              }
            }}
            className="bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-600/50 px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Reseed standard demo patients"
          >
            <span>↻</span> Reseed Demo Queue
          </button>
          <span>Doctor on Duty: <strong className="text-white">{user.name}</strong></span>
          <button
            onClick={loadData}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded border border-slate-700 flex items-center gap-1"
          >
            <span>🔄</span> Refresh Queue ({queue.length})
          </button>
        </div>
      </div>

      {/* Live OPD Queue Strip */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-2.5 flex items-center gap-3 overflow-x-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">
          Active OPD Queue:
        </span>
        {queue.map(p => {
          const hasUrgent = p.redFlags?.some(r => r.severity === 'urgent' && !r.acknowledged)
          return (
            <button
              key={p.id}
              onClick={() => setSelectedCaseId(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-2 border transition-all ${
                selectedCaseId === p.id
                  ? 'bg-teal-600 border-teal-500 text-white shadow-xs'
                  : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="font-bold">{p.token}</span>
              <span>{p.patientName}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                p.opdType === 'ayush' ? 'bg-emerald-900 text-emerald-200' : 'bg-blue-900 text-blue-200'
              }`}>
                {p.opdType === 'ayush' ? '🌿 AYUSH' : '🏥 ALLOPATHY'}
              </span>
              {hasUrgent && (
                <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-black animate-pulse">
                  URGENT RED-FLAG
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Main Clinical Workspace */}
      {currentPatient ? (
        <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-6 gap-6">
          <div className="flex-1 flex flex-col gap-5">
            {/* Urgent Red Flag Clinical Warning Banner */}
            {currentPatient.redFlags?.map(flag => (
              <div
                key={flag.id}
                className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">🚨</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-black text-rose-900 text-sm uppercase tracking-wider">
                        CRITICAL CLINICAL ALERT — {flag.symptom}
                      </h5>
                      <span className="text-[10px] font-bold bg-rose-200 text-rose-950 px-1.5 py-0.2 rounded">
                        Urgent
                      </span>
                    </div>
                    <p className="text-xs text-rose-800 mt-1 font-medium">{flag.reason}</p>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  {!flag.acknowledged ? (
                    <>
                      <button
                        onClick={() => handleAcknowledgeRedFlag(flag.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs"
                      >
                        ✓ Acknowledge
                      </button>
                      <button
                        onClick={() => handleDismissRedFlag(flag.id)}
                        className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-800 font-semibold text-xs hover:bg-rose-100"
                      >
                        Dismiss
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                      ✓ Acknowledged by {flag.acknowledgedBy}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Patient Header */}
            <div className="rounded-2xl p-5 border bg-white flex items-start justify-between" style={{ borderColor: T.border }}>
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {currentPatient.patientName} <span className="font-normal text-slate-500 text-lg">| {currentPatient.age} {currentPatient.gender}</span>
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-teal-700">
                    Token {currentPatient.token}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">{currentPatient.department}</span>
                  {currentPatient.abhaId && (
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border">
                      ABHA: {currentPatient.abhaId}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusChange('in-consultation')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                    currentPatient.status === 'in-consultation'
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  In Consultation
                </button>
                <button
                  onClick={() => handleStatusChange('completed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                    currentPatient.status === 'completed'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Mark Consulted ✓
                </button>
              </div>
            </div>

            {/* Render AYUSH Case Sheet if AYUSH OPD */}
            {currentPatient.opdType === 'ayush' ? (
              <AyushCaseSheet
                patient={currentPatient}
                onSave={(notes) => handleStatusChange('completed', notes)}
              />
            ) : (
              /* Allopathy Clinical View */
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-teal-900">
                    🤖 AI-Assisted Clinical Summary — Physician Review Required
                  </span>
                  <button
                    onClick={() => handleStatusChange('completed')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold"
                  >
                    ✓ Confirm Clinical Draft
                  </button>
                </div>

                <div className="p-5 rounded-2xl border bg-white space-y-3" style={{ borderColor: T.border }}>
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400">Chief Presenting Complaint</p>
                    <p className="font-bold text-base text-slate-900">{currentPatient.chiefComplaint}</p>
                    {currentPatient.rawPatientStatement && (
                      <p className="text-xs text-slate-600 italic mt-0.5">"{currentPatient.rawPatientStatement}"</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400">History of Present Illness (HPI)</p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {currentPatient.aiSummary?.allopathicSummary?.hpi || currentPatient.symptoms?.join(' · ')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Medical Document Timeline Section */}
            <div className="p-5 rounded-2xl border bg-white space-y-3" style={{ borderColor: T.border }}>
              <div className="flex justify-between items-center">
                <h5 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
                  Chronological Medical Records Timeline
                </h5>
                <span className="text-xs text-slate-400">2 documents available</span>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { date: 'Aug 12, 2026', type: 'Prescription (Rx)', detail: 'Metformin 500mg, Amlodipine 5mg · Dr. S. Rao' },
                  { date: 'Aug 12, 2026', type: 'Lab Investigation', detail: 'HbA1c: 8.2% (Flagged elevated) · City Diagnostic' },
                  { date: 'Mar 18, 2026', type: 'Hospital Discharge', detail: 'Hypertensive urgent visit · Discharged stable' }
                ].map((rec, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{rec.date} — {rec.type}</span>
                      <p className="text-slate-600 text-[11px]">{rec.detail}</p>
                    </div>
                    <button
                      onClick={() =>
                        setTraceItem({
                          statement: rec.detail,
                          source: `Scanned ${rec.type}`,
                          confidence: 96,
                          rawEvidence: rec.detail
                        })
                      }
                      className="text-teal-700 font-bold hover:underline"
                    >
                      View Source ↗
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Medications & Vitals */}
          <div className="w-full lg:w-80 flex flex-col gap-4">
            {/* Triage Vitals if captured */}
            {currentPatient.vitals && (currentPatient.vitals.bpSystolic || currentPatient.vitals.pulse || currentPatient.vitals.spo2) && (
              <div className="p-4 rounded-2xl border bg-white space-y-2.5" style={{ borderColor: T.border }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase text-slate-500">Triage Vital Signs</p>
                  {currentPatient.vitals.isCritical && (
                    <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded border border-rose-300 animate-pulse">
                      Urgent Alert
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {currentPatient.vitals.bpSystolic && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block">Blood Pressure</span>
                      <span className="font-bold text-slate-800">{currentPatient.vitals.bpSystolic}/{currentPatient.vitals.bpDiastolic} mmHg</span>
                    </div>
                  )}
                  {currentPatient.vitals.pulse && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block">Pulse Rate</span>
                      <span className="font-bold text-slate-800">{currentPatient.vitals.pulse} BPM</span>
                    </div>
                  )}
                  {currentPatient.vitals.spo2 && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block">Oxygen Sat</span>
                      <span className="font-bold text-slate-800">{currentPatient.vitals.spo2}%</span>
                    </div>
                  )}
                  {currentPatient.vitals.temperature && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block">Temperature</span>
                      <span className="font-bold text-slate-800">{currentPatient.vitals.temperature} °F</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl border bg-white space-y-2.5" style={{ borderColor: T.border }}>
              <p className="text-xs font-bold uppercase text-slate-500">Active Medications</p>
              {currentPatient.medications?.map((m, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <p className="font-bold text-slate-800">{m.name}</p>
                  <p className="text-slate-500">{m.dosage} · {m.frequency}</p>
                </div>
              )) || <p className="text-xs text-slate-400 italic">No regular medicines</p>}
            </div>

            <div className="p-4 rounded-2xl border bg-white space-y-2" style={{ borderColor: T.border }}>
              <p className="text-xs font-bold uppercase text-slate-500">Allergy Status</p>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold">
                {currentPatient.allergies?.[0] || 'No known drug allergies (NKDA)'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500">Loading cases...</div>
      )}
    </div>
  )
}

// ─── Root App Orchestrator ────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [lang, setLang] = useState<LanguageCode>('en')
  const [helpOpen, setHelpOpen] = useState(false)
  const [timeoutWarningOpen, setTimeoutWarningOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ name: string; role: UserRole; department: string }>({
    name: 'Dr. Anjali Rao (BAMS, MD)',
    role: 'physician',
    department: 'Ayurveda OPD'
  })

  // Patient Intake State (starts blank for each new kiosk session)
  const [patientData, setPatientData] = useState({
    name: '',
    age: 0,
    gender: 'M',
    phone: '',
    abhaId: ''
  })
  const [opdType, setOpdType] = useState<OPDType>('ayush')
  const [chiefComplaint, setChiefComplaint] = useState<string>('')
  const [rawStatement, setRawStatement] = useState<string>('')
  const [ayushAnswers, setAyushAnswers] = useState<any>(null)
  const [medications, setMedications] = useState<MedicationRecord[]>([])
  const [allergyStatus, setAllergyStatus] = useState<'none' | 'yes' | 'unspecified'>('unspecified')
  const [assignedToken, setAssignedToken] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ocrDocFile, setOcrDocFile] = useState<File | null>(null)
  const [ocrExtractedMeds, setOcrExtractedMeds] = useState<MedicationRecord[]>([])
  const [ocrMeta, setOcrMeta] = useState<{ doctorName?: string; clinicName?: string; date?: string; offline?: boolean; message?: string } | null>(null)
  const [vitalsData, setVitalsData] = useState<VitalsData | null>(null)
  const [isOcrProcessing, setIsOcrProcessing] = useState<boolean>(false)

  // Inactivity safety tracker (60s timer resets on screen switch or click)
  const inactivityTimerRef = useRef<any>(null)

  const resetInactivity = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    if (screen !== 'welcome' && screen !== 'completion' && screen !== 'physician') {
      inactivityTimerRef.current = setTimeout(() => {
        setTimeoutWarningOpen(true)
      }, 60000)
    }
  }

  useEffect(() => {
    resetInactivity()
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    }
  }, [screen])

  const go = (s: Screen) => {
    resetInactivity()
    setScreen(s)
  }

  // Clear data and reset session to welcome
  const handleFullReset = () => {
    setTimeoutWarningOpen(false)
    setPatientData({
      name: '',
      age: 0,
      gender: 'M',
      phone: '',
      abhaId: ''
    })
    setChiefComplaint('')
    setRawStatement('')
    setAyushAnswers(null)
    setVitalsData(null)
    setMedications([])
    setAllergyStatus('unspecified')
    setOcrDocFile(null)
    setOcrExtractedMeds([])
    setOcrMeta(null)
    setAssignedToken('')
    setIsSubmitting(false)
    setIsOcrProcessing(false)
    setScreen('welcome')
  }

  const handlePatientDataChange = (field: string, val: any) => {
    setPatientData(prev => ({ ...prev, [field]: val }))
  }

  const handleSubmitIntake = async () => {
    setIsSubmitting(true)
    recordAudit('intake_submitted', { patient: patientData.name, opd: opdType })

    const res = await submitIntake({
      patientName: patientData.name,
      age: patientData.age,
      gender: patientData.gender,
      phone: patientData.phone,
      abhaId: patientData.abhaId,
      opdType,
      department: opdType === 'ayush' ? 'Ayurveda OPD' : 'Cardiology OPD',
      chiefComplaint: chiefComplaint || (opdType === 'ayush' ? 'Sandhivata (Joint Pain)' : 'Chest pain'),
      rawPatientStatement: rawStatement,
      ayushAnswers: ayushAnswers || undefined,
      vitals: vitalsData || undefined,
      medications,
      allergyStatus
    })

    setIsSubmitting(false)
    if (res.token) {
      setAssignedToken(res.token)
    }
    go('completion')
  }

  return (
    <div onMouseMove={resetInactivity} onKeyDown={resetInactivity} className="min-h-screen flex flex-col">
      {/* Help Modal */}
      <HelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        onChangeLanguage={() => go('language')}
        onGoBack={() => {
          if (screen === 'complaint') go('pathway')
          else if (screen === 'pathway') go('profile')
          else if (screen === 'profile') go('identification')
          else go('welcome')
        }}
        lang={lang}
        currentQuestion={chiefComplaint}
      />

      {/* Session Privacy Inactivity Timeout */}
      <SessionTimeoutModal
        isOpen={timeoutWarningOpen}
        onContinue={() => {
          setTimeoutWarningOpen(false)
          resetInactivity()
        }}
        onTimeout={handleFullReset}
      />

      {/* Physician RBAC Login Modal */}
      <PhysicianAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={user => {
          setCurrentUser(user)
          go('physician')
        }}
      />

      {/* Screen Router */}
      {screen === 'welcome' && (
        <WelcomeScreen
          onStart={() => go('language')}
          onChangeLang={() => go('language')}
          onPhysician={() => setAuthModalOpen(true)}
          onHelp={() => setHelpOpen(true)}
          lang={lang}
        />
      )}

      {screen === 'language' && (
        <LanguageScreen
          onSelectLanguage={selected => {
            setLang(selected)
            go('consent')
          }}
          onHelp={() => setHelpOpen(true)}
          currentLang={lang}
        />
      )}

      {screen === 'consent' && (
        <ConsentScreen
          onAgree={() => {
            recordAudit('consent_accepted', { lang })
            go('identification')
          }}
          onDecline={() => {
            recordAudit('consent_declined', { lang })
            go('welcome')
          }}
          onHelp={() => setHelpOpen(true)}
          lang={lang}
        />
      )}

      {screen === 'identification' && (
        <IdentificationScreen
          onNext={(method, idVal, profileData) => {
            if (profileData && profileData.name) {
              setPatientData(prev => ({
                ...prev,
                name: profileData.name,
                age: profileData.age,
                gender: profileData.gender as any,
                phone: profileData.phone,
                abhaId: profileData.abhaId || idVal,
              }))
            } else if (idVal) {
              setPatientData(p => ({
                ...p,
                abhaId: method === 'abha' ? idVal : p.abhaId,
                phone: method === 'phone' ? idVal : p.phone
              }))
            }
            go('profile')
          }}
          onHelp={() => setHelpOpen(true)}
          lang={lang}
        />
      )}

      {screen === 'profile' && (
        <PatientDetailsScreen
          patientData={patientData}
          onChange={handlePatientDataChange}
          onNext={() => go('pathway')}
          onHelp={() => setHelpOpen(true)}
          lang={lang}
        />
      )}

      {screen === 'pathway' && (
        <KioskShell showProgress step={2} totalSteps={8} progressLabel="Step 2: Clinic Choice" onOpenHelp={() => setHelpOpen(true)} lang={lang}>
          <PathwayScreen
            onSelectPathway={type => {
              setOpdType(type)
              go('complaint')
            }}
          />
        </KioskShell>
      )}

      {screen === 'complaint' && (
        <ChiefComplaintScreen
          onNext={(comp, raw) => {
            setChiefComplaint(comp)
            setRawStatement(raw)
            go('ai_conversation')
          }}
          onHelp={() => setHelpOpen(true)}
          lang={lang}
        />
      )}

      {screen === 'ai_conversation' && (
        <AIConversationScreen
          complaint={chiefComplaint}
          onNext={() => {
            if (opdType === 'ayush') go('ayush_intake')
            else go('vitals')
          }}
          onRedFlag={() => {
            recordAudit('red_flag_triggered', { complaint: chiefComplaint })
            go('redflag')
          }}
          onHelp={() => setHelpOpen(true)}
          lang={lang}
        />
      )}

      {screen === 'vitals' && (
        <KioskShell showProgress step={4} totalSteps={8} progressLabel="Step 4: Vital Signs" onOpenHelp={() => setHelpOpen(true)} lang={lang}>
          <VitalsScreen
            initialVitals={vitalsData}
            onNext={(vitals) => {
              setVitalsData(vitals)
              if (vitals.isCritical) {
                recordAudit('critical_vitals_recorded', { bp: `${vitals.bpSystolic}/${vitals.bpDiastolic}`, spo2: vitals.spo2 })
              }
              go('medication')
            }}
            onSkip={() => go('medication')}
            onHelp={() => setHelpOpen(true)}
            lang={lang}
          />
        </KioskShell>
      )}

      {screen === 'ayush_intake' && (
        <KioskShell showProgress step={5} totalSteps={8} progressLabel="Step 5: Ayush Pariksha" onOpenHelp={() => setHelpOpen(true)} lang={lang}>
          <AyushIntakeFlow
            onComplete={answers => {
              setAyushAnswers(answers)
              go('document_scan')
            }}
            onBack={() => go('complaint')}
          />
        </KioskShell>
      )}

      {screen === 'medication' && (
        <MedicationScreen
          onNext={() => go('allergy')}
          onHelp={() => setHelpOpen(true)}
          lang={lang}
        />
      )}

      {screen === 'allergy' && (
        <AllergyScreen
          onNext={status => {
            setAllergyStatus(status)
            go('document_scan')
          }}
          onHelp={() => setHelpOpen(true)}
          lang={lang}
        />
      )}

      {screen === 'document_scan' && (
        <DocumentScanScreen
          onNext={() => go('ocr_verify')}
          onSkip={() => go('review')}
          onHelp={() => setHelpOpen(true)}
          lang={lang}
          isOcrProcessing={isOcrProcessing}
          ocrCount={ocrExtractedMeds.length}
          ocrMeta={ocrMeta}
          onFileReady={async (file, _previewUrl) => {
            setOcrDocFile(file)
            setIsOcrProcessing(true)
            try {
              // Call Gemini Vision OCR as soon as file is picked
              const result = await callGeminiOCR(file)
              if (result.success && result.medications && result.medications.length > 0) {
                setOcrExtractedMeds(result.medications)
                setOcrMeta({
                  doctorName: result.doctorName || result.clinicName || 'Attending Physician',
                  clinicName: result.clinicName || 'Hospital Clinic',
                  date: result.prescriptionDate || new Date().toLocaleDateString('en-GB'),
                })
              } else if (result.offline) {
                setOcrExtractedMeds([])
                setOcrMeta({ offline: true, message: result.message || result.error })
              } else if (!result.success) {
                setOcrExtractedMeds([])
                setOcrMeta({ offline: true, message: result.error || 'Could not read medications from this document' })
              } else {
                setOcrExtractedMeds([])
                setOcrMeta({ doctorName: result.doctorName, clinicName: result.clinicName, date: result.prescriptionDate })
              }
            } catch (err: any) {
              console.error('OCR execution error:', err)
              setOcrMeta({ offline: true, message: err.message || 'Could not connect to OCR service' })
            } finally {
              setIsOcrProcessing(false)
            }
          }}
        />
      )}

      {screen === 'ocr_verify' && (
        <KioskShell showProgress step={7} totalSteps={8} progressLabel="Step 7: OCR Verification" onOpenHelp={() => setHelpOpen(true)} lang={lang}>
          <OCRVerifyScreen
            onConfirm={verifiedMeds => {
              setMedications(verifiedMeds)
              recordAudit('ocr_verified', { count: verifiedMeds.length })
              go('review')
            }}
            onRescan={() => go('document_scan')}
            initialMeds={ocrExtractedMeds.length > 0 ? ocrExtractedMeds : undefined}
            ocrMeta={ocrMeta || undefined}
          />
        </KioskShell>
      )}

      {screen === 'review' && (
        <ReviewScreen
          patientData={patientData}
          opdType={opdType}
          complaint={chiefComplaint}
          ayushAnswers={ayushAnswers}
          vitals={vitalsData}
          medications={medications}
          allergyStatus={allergyStatus}
          onSubmit={handleSubmitIntake}
          onEditSection={target => go(target)}
          onHelp={() => setHelpOpen(true)}
          lang={lang}
          isSubmitting={isSubmitting}
        />
      )}

      {screen === 'completion' && (
        <CompletionScreen
          token={assignedToken}
          opdType={opdType}
          patientName={patientData.name}
          onReset={handleFullReset}
          lang={lang}
        />
      )}

      {screen === 'redflag' && (
        <RedFlagScreen
          onDismiss={handleFullReset}
          lang={lang}
        />
      )}

      {screen === 'physician' && (
        <PhysicianDashboardView
          onBack={() => go('welcome')}
          user={currentUser}
        />
      )}
    </div>
  )
}
