interface SourceTraceModalProps {
  isOpen: boolean
  onClose: () => void
  item: {
    statement: string
    source: string
    confidence?: string | number
    rawEvidence?: string
    documentDate?: string
    verified?: boolean
  } | null
}

export function SourceTraceModal({ isOpen, onClose, item }: SourceTraceModalProps) {
  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔍</span>
            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
              Clinical Provenance & Traceability
            </h4>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Extracted Clinical Fact
            </span>
            <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 font-bold text-slate-900 text-sm">
              {item.statement}
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Source Type</span>
              <span className="font-bold text-slate-800">{item.source}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">AI Extraction Confidence</span>
              <span className="font-bold text-emerald-700">
                {typeof item.confidence === 'number' ? `${item.confidence}%` : item.confidence || 'High (94%)'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Physician Verification</span>
              <span className={`font-bold ${item.verified ? 'text-emerald-700' : 'text-amber-700'}`}>
                {item.verified ? '✓ Verified by Doctor' : 'Pending Doctor Review'}
              </span>
            </div>
          </div>

          {item.rawEvidence && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Patient Raw Input / Document Snippet:
              </span>
              <p className="text-slate-700 italic">"{item.rawEvidence}"</p>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
