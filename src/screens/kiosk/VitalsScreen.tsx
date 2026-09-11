import { useState } from 'react'
import { VitalsData, LanguageCode } from '../../types'

interface VitalsScreenProps {
  onNext: (vitals: VitalsData) => void
  onSkip: () => void
  onHelp: () => void
  lang: LanguageCode
  initialVitals?: VitalsData | null
}

export function VitalsScreen({ onNext, onSkip, onHelp, lang, initialVitals }: VitalsScreenProps) {
  const [systolic, setSystolic] = useState<string>(initialVitals?.bpSystolic ? String(initialVitals.bpSystolic) : '')
  const [diastolic, setDiastolic] = useState<string>(initialVitals?.bpDiastolic ? String(initialVitals.bpDiastolic) : '')
  const [pulse, setPulse] = useState<string>(initialVitals?.pulse ? String(initialVitals.pulse) : '')
  const [spo2, setSpo2] = useState<string>(initialVitals?.spo2 ? String(initialVitals.spo2) : '')
  const [temp, setTemp] = useState<string>(initialVitals?.temperature ? String(initialVitals.temperature) : '')

  const sysNum = Number(systolic) || 0
  const diaNum = Number(diastolic) || 0
  const pulseNum = Number(pulse) || 0
  const spo2Num = Number(spo2) || 0
  const tempNum = Number(temp) || 0

  // Clinical safety check: severe hypertension or severe hypoxemia
  const isSevereHypertension = sysNum >= 180 || diaNum >= 120
  const isSevereHypoxemia = spo2Num > 0 && spo2Num < 90
  const isCritical = isSevereHypertension || isSevereHypoxemia

  const hasAnyData = Boolean(systolic || diastolic || pulse || spo2 || temp)

  const handleApplyPreset = (preset: 'normal' | 'elevated') => {
    if (preset === 'normal') {
      setSystolic('120')
      setDiastolic('80')
      setPulse('72')
      setSpo2('98')
      setTemp('98.4')
    } else {
      setSystolic('165')
      setDiastolic('98')
      setPulse('92')
      setSpo2('96')
      setTemp('98.6')
    }
  }

  const handleSubmit = () => {
    const data: VitalsData = {
      bpSystolic: sysNum || undefined,
      bpDiastolic: diaNum || undefined,
      pulse: pulseNum || undefined,
      spo2: spo2Num || undefined,
      temperature: tempNum || undefined,
      recordedAt: new Date().toISOString(),
      isCritical
    }
    onNext(data)
  }

  return (
    <div className="flex-1 flex flex-col justify-between max-w-3xl w-full mx-auto px-6 py-6 font-sans">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              {lang === 'hi' ? 'कार्डियोलॉजी व सामान्य ओपीडी परीक्षा' : 'Cardiology & General Medicine Triage'}
            </span>
            <h2 className="text-2xl font-bold text-slate-800 mt-1">
              {lang === 'hi' ? 'शारीरिक महत्वपूर्ण माप (वाइटल्स / Vitals)' : 'Record Vital Signs (Optional)'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'hi'
                ? 'यदि कियोस्क पर बीपी, नाड़ी या पल्स ऑक्सीमीटर से जांच की गई है, तो यहाँ दर्ज करें।'
                : 'If taken at the kiosk triage desk, enter BP, pulse rate, oxygen saturation, and temperature.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onHelp}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            {lang === 'hi' ? 'सहायता ?' : 'Help ?'}
          </button>
        </div>

        {/* Critical safety alert banner */}
        {isCritical && (
          <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-400 flex items-start gap-3 text-rose-900 animate-pulse">
            <span className="text-2xl">🚨</span>
            <div>
              <p className="font-bold text-sm">
                {lang === 'hi' ? 'चेतावनी: असामान्य वाइटल माप दर्ज किया गया' : 'Clinical Alert: Extreme Vital Signs Recorded'}
              </p>
              <p className="text-xs text-rose-800 mt-0.5">
                {isSevereHypertension && (lang === 'hi' ? 'उच्च रक्तचाप (बीपी ≥ 180/120) — तुरंत डॉक्टर समीक्षा आवश्यक।' : 'Severe Blood Pressure reading (BP ≥ 180/120 mmHg). Priority triage required.')}
                {isSevereHypoxemia && (lang === 'hi' ? ' कम ऑक्सीजन स्तर (SpO2 < 90%) — तुरंत चिकित्सा सहायता लें।' : ' Low Oxygen Saturation (SpO2 < 90%). Emergency clinical attention required.')}
              </p>
            </div>
          </div>
        )}

        {/* Quick Kiosk Preset Buttons */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold uppercase">{lang === 'hi' ? 'त्वरित विकल्प:' : 'Quick Presets:'}</span>
          <button
            type="button"
            onClick={() => handleApplyPreset('normal')}
            className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium hover:bg-emerald-100 transition-colors"
          >
            ✓ Normal (120/80, 72 bpm, 98% SpO2)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('elevated')}
            className="px-3 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-medium hover:bg-amber-100 transition-colors"
          >
            ⚠ High BP Checkup (165/98 mmHg)
          </button>
          {hasAnyData && (
            <button
              type="button"
              onClick={() => {
                setSystolic('')
                setDiastolic('')
                setPulse('')
                setSpo2('')
                setTemp('')
              }}
              className="px-2.5 py-1 text-slate-400 hover:text-slate-600 underline"
            >
              Clear
            </button>
          )}
        </div>

        {/* Vitals Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Blood Pressure */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span>❤️</span> {lang === 'hi' ? 'रक्तचाप (Blood Pressure)' : 'Blood Pressure (BP)'}
              </span>
              <span className="text-[11px] text-slate-400">Target: 120/80 mmHg</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Systolic (ऊपरी)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="120"
                  value={systolic}
                  onChange={e => setSystolic(e.target.value)}
                  className={`w-full p-3 rounded-xl border text-center font-bold text-lg outline-none transition-colors ${
                    sysNum >= 140 ? 'border-rose-400 bg-rose-50/50 text-rose-900' : 'border-slate-200 focus:border-blue-600'
                  }`}
                />
              </div>
              <span className="text-2xl text-slate-300 font-light mt-5">/</span>
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Diastolic (निचला)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="80"
                  value={diastolic}
                  onChange={e => setDiastolic(e.target.value)}
                  className={`w-full p-3 rounded-xl border text-center font-bold text-lg outline-none transition-colors ${
                    diaNum >= 90 ? 'border-rose-400 bg-rose-50/50 text-rose-900' : 'border-slate-200 focus:border-blue-600'
                  }`}
                />
              </div>
              <span className="text-xs text-slate-400 mt-5 shrink-0">mmHg</span>
            </div>
          </div>

          {/* Pulse / Heart Rate */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span>💓</span> {lang === 'hi' ? 'नाड़ी गति (Pulse / Heart Rate)' : 'Pulse Rate'}
              </span>
              <span className="text-[11px] text-slate-400">Normal: 60-100 BPM</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                placeholder="72"
                value={pulse}
                onChange={e => setPulse(e.target.value)}
                className="flex-1 p-3 rounded-xl border border-slate-200 text-center font-bold text-lg outline-none focus:border-blue-600"
              />
              <span className="text-xs text-slate-400 shrink-0">BPM</span>
            </div>
          </div>

          {/* Oxygen Saturation SpO2 */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span>🫁</span> {lang === 'hi' ? 'ऑक्सीजन संतृप्ति (Oxygen / SpO2)' : 'Oxygen Saturation (SpO2)'}
              </span>
              <span className="text-[11px] text-slate-400">Normal: 95-100%</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                placeholder="98"
                value={spo2}
                onChange={e => setSpo2(e.target.value)}
                className={`flex-1 p-3 rounded-xl border text-center font-bold text-lg outline-none transition-colors ${
                  spo2Num > 0 && spo2Num < 95 ? 'border-amber-400 bg-amber-50/50 text-amber-900' : 'border-slate-200 focus:border-blue-600'
                }`}
              />
              <span className="text-xs text-slate-400 shrink-0">%</span>
            </div>
          </div>

          {/* Body Temperature */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span>🌡️</span> {lang === 'hi' ? 'शरीर का तापमान (Body Temperature)' : 'Body Temperature'}
              </span>
              <span className="text-[11px] text-slate-400">Normal: 98.4 °F</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                placeholder="98.4"
                value={temp}
                onChange={e => setTemp(e.target.value)}
                className={`flex-1 p-3 rounded-xl border text-center font-bold text-lg outline-none transition-colors ${
                  tempNum >= 100.4 ? 'border-rose-400 bg-rose-50/50 text-rose-900' : 'border-slate-200 focus:border-blue-600'
                }`}
              />
              <span className="text-xs text-slate-400 shrink-0">°F</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 mt-6">
        <button
          type="button"
          onClick={onSkip}
          className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
        >
          {lang === 'hi' ? 'छोड़ें — वाइटल्स नहीं लिए गए' : 'Skip — Vitals Not Measured Today'}
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
        >
          {hasAnyData
            ? (lang === 'hi' ? 'वाइटल्स सहेजें व आगे बढ़ें →' : 'Save Vitals & Continue →')
            : (lang === 'hi' ? 'आगे बढ़ें →' : 'Continue →')}
        </button>
      </div>
    </div>
  )
}
