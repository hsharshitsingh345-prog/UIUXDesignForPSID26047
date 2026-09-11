import { useState } from 'react'

interface AyushAnswers {
  bodyFrame: string
  skin: string
  weatherSensitivity: string
  mentalSleep: string
  agniChoice: string
  koshthaChoice: string
  dominantTaste: string
  dailyRoutine: string
  physicalActivity: string
}

interface AyushIntakeFlowProps {
  onComplete: (answers: AyushAnswers) => void
  onBack: () => void
}

export function AyushIntakeFlow({ onComplete, onBack }: AyushIntakeFlowProps) {
  const [step, setStep] = useState<number>(1)
  const totalSteps = 5

  const [answers, setAnswers] = useState<AyushAnswers>({
    bodyFrame: '',
    skin: '',
    weatherSensitivity: '',
    mentalSleep: '',
    agniChoice: '',
    koshthaChoice: '',
    dominantTaste: '',
    dailyRoutine: '',
    physicalActivity: ''
  })

  const update = (field: keyof AyushAnswers, val: string) => {
    setAnswers(prev => ({ ...prev, [field]: val }))
  }

  // Calculate constitutional tendencies
  const getLivePrakriti = () => {
    let v = 0, p = 0, k = 0
    if (answers.bodyFrame === 'thin_dry') v += 3
    else if (answers.bodyFrame === 'moderate_warm') p += 3
    else if (answers.bodyFrame === 'broad_heavy') k += 3

    if (answers.weatherSensitivity === 'cold_wind') v += 2
    else if (answers.weatherSensitivity === 'heat_sun') p += 2
    else if (answers.weatherSensitivity === 'cold_damp') k += 2

    if (answers.mentalSleep === 'light_restless') v += 3
    else if (answers.mentalSleep === 'moderate_intense') p += 3
    else if (answers.mentalSleep === 'deep_slow') k += 3

    const total = v + p + k
    if (total === 0) {
      return { vata: 0, pitta: 0, kapha: 0, pending: true }
    }
    return {
      vata: Math.round((v / total) * 100),
      pitta: Math.round((p / total) * 100),
      kapha: Math.round((k / total) * 100),
      pending: false
    }
  }

  const live = getLivePrakriti()

  const isStepValid = () => {
    if (step === 1) return Boolean(answers.bodyFrame && answers.skin)
    if (step === 2) return Boolean(answers.weatherSensitivity && answers.mentalSleep)
    if (step === 3) return Boolean(answers.agniChoice)
    if (step === 4) return Boolean(answers.koshthaChoice)
    return true
  }

  const handleSkipStep = () => {
    if (step === 1) {
      if (!answers.bodyFrame) update('bodyFrame', 'unspecified')
      if (!answers.skin) update('skin', 'unspecified')
    } else if (step === 2) {
      if (!answers.weatherSensitivity) update('weatherSensitivity', 'unspecified')
      if (!answers.mentalSleep) update('mentalSleep', 'unspecified')
    } else if (step === 3) {
      if (!answers.agniChoice) update('agniChoice', 'unspecified')
    } else if (step === 4) {
      if (!answers.koshthaChoice) update('koshthaChoice', 'unspecified')
    }
    if (step < totalSteps) setStep(step + 1)
    else onComplete(answers)
  }

  return (
    <div className="flex-1 flex flex-col justify-between max-w-4xl w-full mx-auto px-6 py-6 font-sans">
      {/* Step Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌿</span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Ministry of Ayush · Patient Case-Taking Protocol
              </span>
              <h2 className="text-2xl font-bold text-slate-800 mt-1">
                {step === 1 && 'Prakriti — What is your natural body build and skin tendency?'}
                {step === 2 && 'Prakriti — How does your body react to weather, sleep and stress?'}
                {step === 3 && 'Agni — How is your digestion and appetite usually?'}
                {step === 4 && 'Koshtha — How are your bowel routine and elimination habits?'}
                {step === 5 && 'Ahara & Vihara — Daily diet tastes, lifestyle and habits'}
              </h2>
              <p className="text-xs text-emerald-700 font-medium mt-0.5">
                {step === 1 && 'देह प्रकृति परीक्षा (शरीर गठन व त्वचा स्वभाव)'}
                {step === 2 && 'ऋतु संवेदनशीलता व निद्रा स्वभाव'}
                {step === 3 && 'अग्नि परीक्षा (जठराग्नि व क्षुधा स्वरूप)'}
                {step === 4 && 'कोष्ठ परीक्षा (मल त्याग व पाचन गति)'}
                {step === 5 && 'आहार-विहार परीक्षा (दैनिक दिनचर्या व खानपान)'}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs font-semibold text-slate-500">Step {step} of {totalSteps}</span>
            <div className="w-28 h-2 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <p className="text-slate-600 text-sm mb-6">
          {step === 1 && 'Choose what best matches your natural bodily traits since childhood. Tap any card to select.'}
          {step === 2 && 'Help your Ayurvedic physician understand your constitutional climate sensitivity.'}
          {step === 3 && 'In Ayurveda, Agni governs metabolic transformation. Select how your appetite behaves.'}
          {step === 4 && 'Your bowel habit indicates the natural mobility of Apana Vata in your digestive tract.'}
          {step === 5 && 'Review your constitutional assessment preview before proceeding to document review.'}
        </p>

        {/* ─── Step 1: Body Frame & Skin ─── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Natural Physical Build (शरीर गठन)</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: 'thin_dry',
                    label: 'Slender / Light Build (कृश)',
                    sub: 'Light bones, tends to dry skin, moves and talks quickly',
                    dosha: 'Vata Tendency (वात प्रधान)'
                  },
                  {
                    id: 'moderate_warm',
                    label: 'Medium / Athletic (मध्यम)',
                    sub: 'Warm skin, good muscle tone, sweats easily in heat',
                    dosha: 'Pitta Tendency (पित्त प्रधान)'
                  },
                  {
                    id: 'broad_heavy',
                    label: 'Solid / Broad Build (स्थूल/दृढ़)',
                    sub: 'Heavy bones, smooth/cool skin, steady endurance',
                    dosha: 'Kapha Tendency (कफ प्रधान)'
                  }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => update('bodyFrame', opt.id)}
                    className={`p-5 text-left rounded-2xl border-2 transition-all ${
                      answers.bodyFrame === opt.id
                        ? 'border-emerald-600 bg-emerald-50/80 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800 text-base">{opt.label}</span>
                      {answers.bodyFrame === opt.id && <span className="text-emerald-600 font-bold">✓</span>}
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{opt.sub}</p>
                    <span className="text-[11px] font-medium text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                      {opt.dosha}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Skin Texture (त्वचा का स्वभाव)</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'dry_rough', title: 'Dry or Rough (रूक्ष)', desc: 'Flakes easily, rough skin in winter' },
                  { id: 'warm_reddish', title: 'Warm / Sensitive (उष्ण/स्निग्ध)', desc: 'Prone to reddish flushes, moles, or heat rashes' },
                  { id: 'oily_smooth', title: 'Soft, Thick & Oily (चिकनी)', desc: 'Well hydrated, rarely cracks or chaps' }
                ].map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => update('skin', s.id)}
                    className={`p-4 text-left rounded-xl border transition-all ${
                      answers.skin === s.id
                        ? 'border-emerald-600 bg-emerald-50/70 font-semibold'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="text-slate-800 text-sm font-bold">{s.title}</span>
                      {answers.skin === s.id && <span className="text-emerald-600">✓</span>}
                    </div>
                    <span className="text-xs text-slate-500">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 2: Weather & Sleep ─── */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Climate / Weather Sensitivity (मौसम संवेदनशीलता)</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: 'cold_wind',
                    icon: '💨',
                    label: 'Dislikes Cold & Wind (शीत असहिष्णु)',
                    desc: 'Joints ache or skin becomes dry in winter. Prefers sunshine and warm drinks.'
                  },
                  {
                    id: 'heat_sun',
                    icon: '☀️',
                    label: 'Dislikes Heat & Sun (उष्ण असहिष्णु)',
                    desc: 'Sweats heavily, irritable or headaches in heat. Prefers cool shade and breezy weather.'
                  },
                  {
                    id: 'cold_damp',
                    icon: '🌧️',
                    label: 'Dislikes Damp & Humid (आर्द्र असहिष्णु)',
                    desc: 'Gets chest heaviness or phlegm in monsoon/humid weather.'
                  }
                ].map(w => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => update('weatherSensitivity', w.id)}
                    className={`p-5 text-left rounded-2xl border-2 transition-all ${
                      answers.weatherSensitivity === w.id
                        ? 'border-emerald-600 bg-emerald-50/80 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{w.icon}</span>
                    <span className="font-bold text-slate-800 text-sm block mb-1">{w.label}</span>
                    <span className="text-xs text-slate-600">{w.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Sleep & Mind Patterns (निद्रा व मानस स्वभाव)</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'light_restless', title: 'Light & Restless (अल्प निद्रा)', desc: 'Easily awakened by slight sounds; active thoughts' },
                  { id: 'moderate_intense', title: 'Moderate & Vivid (मध्यम निद्रा)', desc: 'Falls asleep quickly; dreams are vivid and purposeful' },
                  { id: 'deep_slow', title: 'Deep & Heavy (गाढ़ निद्रा)', desc: 'Sleeps soundly 8+ hours; sluggish to wake up in the morning' }
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => update('mentalSleep', m.id)}
                    className={`p-4 text-left rounded-xl border transition-all ${
                      answers.mentalSleep === m.id
                        ? 'border-emerald-600 bg-emerald-50/70 font-semibold'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="text-slate-800 text-sm font-bold block mb-1">{m.title}</span>
                    <span className="text-xs text-slate-500">{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 3: Agni Pariksha ─── */}
        {step === 3 && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-4">
              How does your appetite and digestion behave on a typical day? (अग्नि स्वरूप)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: 'irregular',
                  icon: '🌪️',
                  title: 'Vishama Agni — Irregular Appetite',
                  sanskrit: 'विषमाग्नि (वात प्रभाव)',
                  desc: 'Some days very hungry, other days completely uninterested in food. Frequent bloating or gas.'
                },
                {
                  id: 'very_low',
                  icon: '🐢',
                  title: 'Manda Agni — Sluggish / Slow Digestion',
                  sanskrit: 'मन्दाग्नि (कफ प्रभाव)',
                  desc: 'Low appetite. Sensation that food sits heavy in the stomach hours after small meals.'
                },
                {
                  id: 'burning',
                  icon: '🔥',
                  title: 'Tikshna Agni — Intense / Burning Digestion',
                  sanskrit: 'तीक्ष्णाग्नि (पित्त प्रभाव)',
                  desc: 'Cannot delay meals without sharp hunger, sour belching, or acid burning sensation.'
                },
                {
                  id: 'normal',
                  icon: '⚖️',
                  title: 'Sama Agni — Balanced & Smooth',
                  sanskrit: 'समाग्नि (सम दोष)',
                  desc: 'Hungry at regular intervals, digests well, feels light and refreshed after meals.'
                }
              ].map(a => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => update('agniChoice', a.id)}
                  className={`p-5 text-left rounded-2xl border-2 flex items-start gap-4 transition-all ${
                    answers.agniChoice === a.id
                      ? 'border-emerald-600 bg-emerald-50/80 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-3xl mt-1">{a.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 text-base">{a.title}</span>
                      {answers.agniChoice === a.id && <span className="text-emerald-600 font-bold">✓</span>}
                    </div>
                    <span className="text-xs font-semibold text-emerald-800 block mb-1">{a.sanskrit}</span>
                    <p className="text-xs text-slate-600 leading-relaxed">{a.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Step 4: Koshtha Pariksha ─── */}
        {step === 4 && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-4">
              How would you describe your bowel movements and elimination? (कोष्ठ स्वरूप)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: 'hard_constipated',
                  icon: '🧱',
                  title: 'Krura Koshtha',
                  sub: 'Hard / Constipation-Prone',
                  sanskrit: 'क्रूर कोष्ठ (वात)',
                  desc: 'Stool is hard, dry, or difficult. Skipping days is common. Needs warm liquids or laxatives.'
                },
                {
                  id: 'regular_normal',
                  icon: '🌿',
                  title: 'Madhyama Koshtha',
                  sub: 'Regular & Formed',
                  sanskrit: 'मध्यम कोष्ठ (सम)',
                  desc: 'Formed bowel movement once or twice daily without urgency or discomfort.'
                },
                {
                  id: 'soft_loose',
                  icon: '💧',
                  title: 'Mridu Koshtha',
                  sub: 'Soft / Sensitive Evacuation',
                  sanskrit: 'मृदु कोष्ठ (पित्त)',
                  desc: 'Bowels are easily provoked. Warm milk, grapes, or spices quickly cause loose motions.'
                }
              ].map(k => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => update('koshthaChoice', k.id)}
                  className={`p-5 text-left rounded-2xl border-2 transition-all ${
                    answers.koshthaChoice === k.id
                      ? 'border-emerald-600 bg-emerald-50/80 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-3xl mb-2 block">{k.icon}</span>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800 text-sm">{k.title}</span>
                    {answers.koshthaChoice === k.id && <span className="text-emerald-600 font-bold">✓</span>}
                  </div>
                  <span className="text-xs font-semibold text-emerald-800 block mb-1">{k.sub}</span>
                  <span className="text-[11px] text-slate-500 block mb-2">{k.sanskrit}</span>
                  <p className="text-xs text-slate-600 leading-relaxed">{k.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Step 5: Ahara-Vihara & Summary ─── */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Preferred Tastes (रस रुचि)</label>
                <div className="flex flex-wrap gap-2">
                  {['Sweet (मधुर)', 'Salty (लवण)', 'Sour (अम्ल)', 'Spicy (कटु)', 'Bitter (तिक्त)', 'Astringent (कषाय)'].map(taste => (
                    <button
                      key={taste}
                      type="button"
                      onClick={() => update('dominantTaste', taste)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                        answers.dominantTaste === taste
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {taste}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Daily Routine & Lifestyle (दिनचर्या)</label>
                <div className="flex flex-wrap gap-2">
                  {['Sedentary Desk Work', 'Physical Activity / Fieldwork', 'Shift Work / Irregular Routine', 'High Mental Stress'].map(act => (
                    <button
                      key={act}
                      type="button"
                      onClick={() => update('physicalActivity', act)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                        answers.physicalActivity === act
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {act}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Constitutional Assessment Preview — Clearly labeled as questionnaire score */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white shadow-md">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌿</span>
                  <span className="font-bold text-sm tracking-wide uppercase text-emerald-300">
                    Constitutional Assessment (प्रारंभिक प्रकृति गणना)
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-800/80 px-2 py-0.5 rounded border border-emerald-500/40 text-emerald-200">
                  AI-Assisted Questionnaire Score
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/80 mb-4">
                This indicates relative tendencies based on your answers to assist the Ayurvedic physician during Nadi and Rogi Pariksha. <em>This is not a laboratory measurement or medical diagnosis.</em>
              </p>

              {live.pending ? (
                <div className="p-4 rounded-xl bg-white/10 border border-white/15 text-center">
                  <p className="text-xs font-semibold text-emerald-200">
                    ℹ Constitutional score will be finalized during physician clinical examination.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs border border-white/10">
                    <span className="text-xs text-amber-300 font-semibold block">Vata (वात)</span>
                    <span className="text-lg font-black block mt-1">{live.vata}%</span>
                    <span className="text-[10px] text-emerald-100 block">
                      {live.vata >= 45 ? 'Relatively Higher' : 'Moderate'}
                    </span>
                    <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: `${live.vata}%` }} />
                    </div>
                  </div>

                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs border border-white/10">
                    <span className="text-xs text-rose-300 font-semibold block">Pitta (पित्त)</span>
                    <span className="text-lg font-black block mt-1">{live.pitta}%</span>
                    <span className="text-[10px] text-emerald-100 block">
                      {live.pitta >= 45 ? 'Dominant Tendency' : 'Moderate'}
                    </span>
                    <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-rose-400 h-full rounded-full" style={{ width: `${live.pitta}%` }} />
                    </div>
                  </div>

                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs border border-white/10">
                    <span className="text-xs text-blue-300 font-semibold block">Kapha (कफ)</span>
                    <span className="text-lg font-black block mt-1">{live.kapha}%</span>
                    <span className="text-[10px] text-emerald-100 block">
                      {live.kapha >= 40 ? 'Prominent' : 'Relatively Lower'}
                    </span>
                    <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-blue-400 h-full rounded-full" style={{ width: `${live.kapha}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 mt-6">
        <button
          type="button"
          onClick={() => {
            if (step > 1) setStep(step - 1)
            else onBack()
          }}
          className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors"
        >
          ← {step === 1 ? 'Back to Clinic Selection' : 'Previous Question'}
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {step < totalSteps && (
            <button
              type="button"
              onClick={handleSkipStep}
              className="px-4 py-3 rounded-xl border border-slate-200 text-slate-500 font-medium text-xs hover:bg-slate-50 transition-colors"
            >
              Not sure / Skip (छोड़ें)
            </button>
          )}

          <button
            type="button"
            disabled={!isStepValid()}
            onClick={() => {
              if (step < totalSteps) setStep(step + 1)
              else onComplete(answers)
            }}
            className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {step === totalSteps ? 'Save & Continue to Documents →' : 'Next Question (आगे बढ़ें) →'}
          </button>
        </div>
      </div>
    </div>
  )
}
