import { OPDType } from '../../types'

interface PathwayScreenProps {
  onSelectPathway: (type: OPDType) => void
}

export function PathwayScreen({ onSelectPathway }: PathwayScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-8 max-w-3xl mx-auto w-full font-sans">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Care Pathway Selection · ओपीडी विभाग चयन
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">
          Which OPD clinic are you visiting today?
        </h1>
        <p className="text-slate-600 text-base max-w-xl mx-auto">
          Choose your medical stream so MediKiosk can customize your intake questions and prepare the right clinical case sheet for your doctor.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* AYUSH OPD Card */}
        <button
          type="button"
          onClick={() => onSelectPathway('ayush')}
          className="group text-left p-7 rounded-3xl border-2 border-emerald-300 bg-gradient-to-b from-emerald-50/80 to-white hover:border-emerald-600 hover:shadow-lg transition-all duration-200 relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[11px] font-extrabold uppercase px-3 py-1 rounded-bl-xl tracking-wider">
            Ministry of Ayush
          </div>

          <div>
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-3xl mb-4 group-hover:scale-105 transition-transform">
              🌿
            </div>
            <h3 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
              AYUSH OPD
            </h3>
            <p className="text-sm font-semibold text-emerald-700 mb-3">
              आयुर्वेद · योग · यूनानी · सिद्ध · होम्योपैथी
            </p>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Holistic Ayurvedic case-taking including body constitution (Prakriti), digestive fire (Agni), bowel habits (Koshtha), and dietary lifestyle assessment.
            </p>
          </div>

          <div className="pt-4 border-t border-emerald-100 flex items-center justify-between text-xs font-bold text-emerald-800">
            <span>Begin Ayush Case-Taking</span>
            <span className="text-base group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </button>

        {/* General Allopathic OPD Card */}
        <button
          type="button"
          onClick={() => onSelectPathway('allopathy')}
          className="group text-left p-7 rounded-3xl border-2 border-slate-200 bg-white hover:border-teal-600 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center text-3xl mb-4 group-hover:scale-105 transition-transform">
              🏥
            </div>
            <h3 className="text-2xl font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
              General / Modern Medicine
            </h3>
            <p className="text-sm font-semibold text-teal-700 mb-3">
              जनरल मेडिसिन · कार्डियोलॉजी · ऑर्थो
            </p>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Standard clinical triage focusing on acute symptoms, current pharmaceutical prescriptions, drug allergies, and vital sign assessment.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
            <span>Begin General Intake</span>
            <span className="text-base group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </button>
      </div>
    </div>
  )
}
