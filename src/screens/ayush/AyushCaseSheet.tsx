import { useState } from 'react'
import { PatientCase } from '../../types'
import { SourceTraceModal } from '../../components/clinical/SourceTraceModal'

interface AyushCaseSheetProps {
  patient: PatientCase
  onSave: (doctorNotes?: string) => void
}

export function AyushCaseSheet({ patient, onSave }: AyushCaseSheetProps) {
  const ayush = patient.ayushData
  const ai = patient.aiSummary
  const [activeTraceItem, setActiveTraceItem] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [doctorNotes, setDoctorNotes] = useState(patient.physicianNotes || '')
  const [savedFeedback, setSavedFeedback] = useState<string>('')

  const prakriti = ayush?.prakriti || {
    primary: 'Vata-Kapha Dwandvaja',
    vata: 50,
    pitta: 25,
    kapha: 25,
    description: 'Vata predominant with Kapha association'
  }

  const agni = ayush?.agni || {
    type: 'Manda Agni',
    label: 'Sluggish / Slow Digestion',
    sanskrit: 'मन्दाग्नि',
    description: 'Slow digestive fire, post-meal heaviness'
  }

  const koshtha = ayush?.koshtha || {
    type: 'Krura Koshtha',
    label: 'Hard Stool / Constipated',
    sanskrit: 'क्रूर कोष्ठ',
    description: 'Hard stool, mild constipation tendency'
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Traceability Modal */}
      <SourceTraceModal
        isOpen={Boolean(activeTraceItem)}
        onClose={() => setActiveTraceItem(null)}
        item={activeTraceItem}
      />

      {/* Top Banner — Mandatory AI Positioning */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shrink-0">
            🌿
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-emerald-950 text-base">
                Ayurvedic Case-Taking Sheet (आयुर्वेदिक रोग एवं रोगी परीक्षा)
              </h4>
              <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                Ministry of Ayush Protocol
              </span>
            </div>
            <p className="text-xs text-emerald-800">
              AI-assisted clinical intake draft — <em>Physician verification and final clinical decision required</em>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedFeedback && (
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300 animate-fade-in">
              {savedFeedback}
            </span>
          )}
          {!confirmed ? (
            <button
              type="button"
              onClick={() => {
                setConfirmed(true)
                onSave(doctorNotes)
                setSavedFeedback(`✓ Saved at ${new Date().toLocaleTimeString()}`)
              }}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
            >
              <span>✓</span> Confirm Summary
            </button>
          ) : (
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300">
              ✓ Verified by Physician
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50"
          >
            {isEditing ? 'Done' : '✎ Edit Notes'}
          </button>
        </div>
      </div>

      {/* Grid: Prakriti & Agni/Koshtha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Prakriti Analysis */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <h5 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span>🧬</span> Constitutional Assessment (देह प्रकृति)
            </h5>
            <button
              type="button"
              onClick={() =>
                setActiveTraceItem({
                  statement: `Prakriti: ${prakriti.primary}`,
                  source: 'Kiosk Guided Ayush Pariksha (Sharira + Ritu + Manas)',
                  confidence: 94,
                  rawEvidence: 'Physical build, weather intolerance, and sleep/mental traits evaluated during kiosk intake.',
                  verified: confirmed
                })
              }
              className="text-[11px] font-bold text-teal-700 hover:underline flex items-center gap-1"
            >
              <span>Source ↗</span>
            </button>
          </div>

          <div className="flex items-center justify-between mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700">Primary Constitution:</span>
            <span className="text-xs font-black text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200">
              {prakriti.primary}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-900">Vata Dosha (वात — Chala/Ruksha Guna)</span>
                <span className="text-slate-700 font-bold">{prakriti.vata}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${prakriti.vata}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-900">Pitta Dosha (पित्त — Ushna/Tikshna Guna)</span>
                <span className="text-slate-700 font-bold">{prakriti.pitta}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${prakriti.pitta}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-blue-900">Kapha Dosha (कफ — Guru/Snigdha Guna)</span>
                <span className="text-slate-700 font-bold">{prakriti.kapha}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${prakriti.kapha}%` }} />
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 italic mt-3">
            Note: Percentages indicate AI-assisted questionnaire scores to aid clinical examination. This is not a laboratory test or final diagnosis.
          </p>
        </div>

        {/* Agni & Koshtha */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <h5 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span>🔥</span> Agni & Koshtha Pariksha
            </h5>
            <button
              type="button"
              onClick={() =>
                setActiveTraceItem({
                  statement: `${agni.type} & ${koshtha.type}`,
                  source: 'Patient Symptom Intake',
                  confidence: 96,
                  rawEvidence: 'Appetite post-meal fullness response and bowel regularity response from patient interview.',
                  verified: confirmed
                })
              }
              className="text-[11px] font-bold text-teal-700 hover:underline flex items-center gap-1"
            >
              <span>Source ↗</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jatharagni (Digestive Fire)</span>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {agni.type} ({agni.sanskrit || 'अग्नि'})
              </span>
            </div>
            <p className="text-xs text-slate-700">{agni.description}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Koshtha (Bowel Elimination)</span>
              <span className="text-xs font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                {koshtha.type} ({koshtha.sanskrit || 'कोष्ठ'})
              </span>
            </div>
            <p className="text-xs text-slate-700">{koshtha.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Ahara (Diet Tendency)</span>
              <span className="font-semibold text-slate-800">{ayush?.ahara?.dominantTaste || 'Pungent / Salty taste preference'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Vihara (Lifestyle)</span>
              <span className="font-semibold text-slate-800">{ayush?.vihara?.activity || 'Desk work / Moderate exertion'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Clinical Case Sheet & Samprapti */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🩺</span>
            <h5 className="font-bold text-slate-900 text-sm">
              Provisional Clinical Information (रोग सम्प्राप्ति व निदान परामर्श)
            </h5>
          </div>
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            Provisional — Physician Review Required
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
            Provisional Assessment: {ai?.provisionalAyushDiagnosis || 'Sandhigata Vata with Aama association'}
          </span>
          <p className="text-xs text-slate-700 leading-relaxed">
            {ai?.pathogenesis || 'Vitiated Vata dosha localized in articular joints with sluggish Jatharagni contributing to low metabolic transformation.'}
          </p>
        </div>

        {/* Pathya - Apathya Guidance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
              <span>✅</span> Pathya (Recommended Diet & Habits)
            </span>
            <p className="text-xs text-slate-700 leading-relaxed">
              {ai?.recommendedPathya || 'Warm sesame oil abhyanga, Sunthi (dry ginger) water, light warm meals (Laghu Ahara).'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50">
            <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5 mb-1">
              <span>❌</span> Apathya (To Avoid)
            </span>
            <p className="text-xs text-slate-700 leading-relaxed">
              {ai?.recommendedApathya || 'Cold refrigerated drinks, curd at night, heavy fried food, cold wind exposure.'}
            </p>
          </div>
        </div>

        {/* Missing Information Tracker (Anti-Hallucination) */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Missing / Unspecified Information (Flagged by AI):
          </span>
          <ul className="text-xs text-slate-600 list-disc pl-4 space-y-0.5">
            {ai?.missingInformation?.length ? (
              ai.missingInformation.map((m, i) => <li key={i}>{m}</li>)
            ) : (
              <li>Family history of chronic joint disorders not captured during kiosk intake.</li>
            )}
            <li>Nadi Pariksha and tongue (Jihva) examination pending in consultation.</li>
          </ul>
        </div>

        {/* Physician Editable Clinical Notes */}
        {isEditing && (
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Physician Consultation Notes & Final Treatment Plan:
            </label>
            <textarea
              rows={3}
              value={doctorNotes}
              onChange={e => setDoctorNotes(e.target.value)}
              placeholder="Enter prescription formulations (e.g. Yogaraj Guggulu, Dashamularishta), specific diet plan, and review date..."
              className="w-full p-3 text-xs border rounded-xl outline-none focus:border-teal-600 font-mono"
            />
          </div>
        )}
      </div>

      {/* Action CTA */}
      <div className="flex justify-end items-center gap-3 pt-2">
        {savedFeedback && (
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-300">
            {savedFeedback}
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            onSave(doctorNotes)
            setSavedFeedback(`✓ Record & Notes Saved at ${new Date().toLocaleTimeString()}`)
          }}
          className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm transition-colors flex items-center gap-2"
        >
          <span>✓</span> Save to Hospital AYUSH E-Record
        </button>
      </div>
    </div>
  )
}
