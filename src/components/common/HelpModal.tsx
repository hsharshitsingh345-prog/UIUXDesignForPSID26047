import { LanguageCode } from '../../types'
import { STRINGS, speakText } from '../../utils/i18n'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
  onRepeatQuestion?: () => void
  onChangeLanguage: () => void
  onGoBack: () => void
  lang: LanguageCode
  currentQuestion?: string
}

export function HelpModal({
  isOpen,
  onClose,
  onChangeLanguage,
  onGoBack,
  lang,
  currentQuestion
}: HelpModalProps) {
  if (!isOpen) return null

  const t = STRINGS[lang] || STRINGS.en

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">👋</span>
            <h3 className="font-bold text-slate-800 text-lg">{t.helpTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <div className="py-5 space-y-3">
          {currentQuestion && (
            <button
              onClick={() => {
                speakText(currentQuestion, lang)
                onClose()
              }}
              className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-teal-600 hover:bg-teal-50 flex items-center gap-3 transition-colors"
            >
              <span className="text-xl">🔊</span>
              <div>
                <p className="font-bold text-sm text-slate-800">{t.repeatQuestion}</p>
                <p className="text-xs text-slate-500">Listen via speech synthesis</p>
              </div>
            </button>
          )}

          <button
            onClick={() => {
              onChangeLanguage()
              onClose()
            }}
            className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-teal-600 hover:bg-teal-50 flex items-center gap-3 transition-colors"
          >
            <span className="text-xl">🌐</span>
            <div>
              <p className="font-bold text-sm text-slate-800">{t.changeLanguage}</p>
              <p className="text-xs text-slate-500">Switch between English, हिन्दी and more</p>
            </div>
          </button>

          <button
            onClick={() => {
              alert('A kiosk assistance bell has been sounded. A waiting hall facilitator is on their way to this kiosk.')
              onClose()
            }}
            className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-teal-600 hover:bg-teal-50 flex items-center gap-3 transition-colors"
          >
            <span className="text-xl">🔔</span>
            <div>
              <p className="font-bold text-sm text-slate-800">{t.callStaff}</p>
              <p className="text-xs text-slate-500">A hospital assistant will help you navigate</p>
            </div>
          </button>

          <button
            onClick={() => {
              onGoBack()
              onClose()
            }}
            className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 flex items-center gap-3 transition-colors"
          >
            <span className="text-xl">↩️</span>
            <div>
              <p className="font-bold text-sm text-slate-800">{t.goBack}</p>
              <p className="text-xs text-slate-500">Review or change your previous answer</p>
            </div>
          </button>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  )
}
