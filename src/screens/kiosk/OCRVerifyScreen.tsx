import { useState } from 'react'
import { MedicationRecord } from '../../types'

interface OCRMeta {
  doctorName?: string
  clinicName?: string
  date?: string
  offline?: boolean
  message?: string
}

interface OCRVerifyScreenProps {
  onConfirm: (meds: MedicationRecord[]) => void
  onRescan: () => void
  initialMeds?: MedicationRecord[]
  ocrMeta?: OCRMeta
}

const DEMO_MEDS: MedicationRecord[] = [
  { name: 'Metformin Hydrochloride', dosage: '500 mg', frequency: 'Twice daily (after meals)', confidence: 97, source: 'ocr_prescription', verified: false },
  { name: 'Amlodipine Besylate', dosage: '5 mg', frequency: 'Once daily (morning)', confidence: 95, source: 'ocr_prescription', verified: false },
  { name: 'Atorvastatin Calcium', dosage: '10 mg', frequency: 'Once daily (bedtime)', confidence: 91, source: 'ocr_prescription', verified: false }
]

export function OCRVerifyScreen({ onConfirm, onRescan, initialMeds, ocrMeta }: OCRVerifyScreenProps) {
  const isRealOCR = !ocrMeta?.offline && initialMeds && initialMeds.length > 0

  const [meds, setMeds] = useState<MedicationRecord[]>(() =>
    initialMeds && initialMeds.length > 0 ? initialMeds : DEMO_MEDS
  )

  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const updateMed = (index: number, field: keyof MedicationRecord, val: any) => {
    setMeds(prev => prev.map((m, i) => (i === index ? { ...m, [field]: val } : m)))
  }

  const removeMed = (index: number) => {
    setMeds(prev => prev.filter((_, i) => i !== index))
  }

  const addMed = () => {
    const newMed: MedicationRecord = {
      name: 'New Medication',
      dosage: '10 mg',
      frequency: 'Once daily',
      confidence: 100,
      source: 'manual',
      verified: false
    }
    setMeds(prev => [...prev, newMed])
    setEditingIndex(meds.length)
  }

  const handleConfirmAll = () => {
    // Mark all as verified by patient
    onConfirm(meds.map(m => ({ ...m, verified: true })))
  }

  const avgConfidence = meds.length
    ? Math.round(meds.reduce((s, m) => s + (m.confidence || 90), 0) / meds.length)
    : 0

  return (
    <div className="flex-1 flex flex-col justify-between max-w-5xl w-full mx-auto px-6 py-6 font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {isRealOCR ? (
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    ✓ Gemini Vision OCR — Real Extraction
                  </span>
                ) : (
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                    Demo OCR · Sample Data
                  </span>
                )}
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  AI-Extracted — Verify Before Saving
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mt-1">
                Verify Extracted Medications & Dosages
              </h2>
            </div>
          </div>
          {meds.length > 0 && (
            <span className="text-xs font-semibold text-teal-800 bg-teal-100/80 px-3 py-1.5 rounded-full border border-teal-300">
              OCR Confidence: {avgConfidence}% Avg
            </span>
          )}
        </div>

        {/* Offline / No API Key notice */}
        {ocrMeta?.offline && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-2.5 text-xs">
            <span className="text-amber-500 text-lg mt-0.5">⚠️</span>
            <div>
              <p className="font-bold text-amber-900">Gemini OCR not active — showing sample data</p>
              <p className="text-amber-700 mt-0.5">
                {ocrMeta.message || 'Add your GEMINI_API_KEY to server/.env and restart the backend to enable real prescription extraction.'}
              </p>
            </div>
          </div>
        )}

        {/* Real OCR success banner with prescription metadata */}
        {isRealOCR && (ocrMeta?.doctorName || ocrMeta?.clinicName || ocrMeta?.date) && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center gap-4 flex-wrap">
            <span className="text-emerald-600 font-bold text-base">✓</span>
            {ocrMeta.clinicName && (
              <span className="text-emerald-800"><strong>Clinic:</strong> {ocrMeta.clinicName}</span>
            )}
            {ocrMeta.doctorName && (
              <span className="text-emerald-800"><strong>Doctor:</strong> {ocrMeta.doctorName}</span>
            )}
            {ocrMeta.date && (
              <span className="text-emerald-800"><strong>Date:</strong> {ocrMeta.date}</span>
            )}
          </div>
        )}

        <p className="text-slate-600 text-sm mb-6">
          {isRealOCR
            ? 'Gemini Vision AI extracted these medicines from your prescription. Please confirm each item or correct any details.'
            : 'Sample prescription data shown. Upload a real prescription and add your Gemini API key to extract actual medicines.'}
        </p>

        {/* Extracted Medications List */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Extracted Medicines ({meds.length})
          </span>
          <button
            type="button"
            onClick={addMed}
            className="text-xs font-bold text-teal-800 hover:text-teal-900 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 transition-colors"
          >
            + Add Medicine Manually
          </button>
        </div>

        <div className="space-y-3">
          {meds.length === 0 && (
            <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-400">
              <p className="font-bold">No medicines extracted</p>
              <p className="text-xs mt-1">Add medicines manually or go back and upload a different document</p>
            </div>
          )}

          {meds.map((med, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col gap-2 transition-all hover:border-slate-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💊</span>
                  {editingIndex === idx ? (
                    <input
                      type="text"
                      value={med.name}
                      onChange={e => updateMed(idx, 'name', e.target.value)}
                      className="font-bold text-sm text-slate-800 border rounded px-2 py-1 w-56 outline-none focus:border-teal-500"
                    />
                  ) : (
                    <span className="font-bold text-sm text-slate-800">{med.name}</span>
                  )}
                  {med.source === 'manual' && (
                    <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border">MANUAL</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    (med.confidence || 0) >= 90
                      ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                      : 'text-amber-800 bg-amber-50 border-amber-200'
                  }`}>
                    {med.confidence || '—'}% Match
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingIndex(editingIndex === idx ? null : idx)}
                    className="text-xs text-slate-500 hover:text-teal-700 px-2 py-0.5 rounded transition-colors"
                  >
                    {editingIndex === idx ? '✓ Done' : '✎ Edit'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMed(idx)}
                    className="text-xs text-rose-400 hover:text-rose-700 px-1.5 transition-colors"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-0.5">Dosage</span>
                  {editingIndex === idx ? (
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={e => updateMed(idx, 'dosage', e.target.value)}
                      className="border rounded px-2 py-1 w-full text-slate-700 font-medium outline-none focus:border-teal-500"
                    />
                  ) : (
                    <span className="font-semibold text-slate-700">{med.dosage}</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-0.5">Frequency</span>
                  {editingIndex === idx ? (
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={e => updateMed(idx, 'frequency', e.target.value)}
                      className="border rounded px-2 py-1 w-full text-slate-700 font-medium outline-none focus:border-teal-500"
                    />
                  ) : (
                    <span className="text-slate-600">{med.frequency}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-slate-200 flex justify-between items-center mt-6">
        <button
          type="button"
          onClick={onRescan}
          className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors"
        >
          ← Upload Different Document
        </button>

        <button
          type="button"
          onClick={handleConfirmAll}
          className="px-8 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2"
        >
          ✓ Confirm {meds.length} Medicine{meds.length !== 1 ? 's' : ''} →
        </button>
      </div>
    </div>
  )
}
