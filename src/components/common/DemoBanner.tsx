export function DemoBanner() {
  return (
    <div className="w-full bg-slate-900 text-slate-300 px-4 py-1.5 text-[11px] font-medium border-b border-slate-800 flex items-center justify-between font-sans">
      <div className="flex items-center gap-2">
        <span className="bg-amber-500/20 text-amber-300 font-extrabold px-1.5 py-0.2 rounded border border-amber-500/40 text-[10px] tracking-wider uppercase">
          SIH 2024–2026 DEMO
        </span>
        <span>
          <strong>MediKiosk</strong> · Ministry of Ayush Problem Statement 26047 · <em>AI-Assisted Documentation (Not Autonomous Diagnosis)</em>
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-3 text-slate-400">
        <span>Synthetic Clinical Data</span>
        <span>·</span>
        <span>ABDM Compliant Protocol</span>
      </div>
    </div>
  )
}
