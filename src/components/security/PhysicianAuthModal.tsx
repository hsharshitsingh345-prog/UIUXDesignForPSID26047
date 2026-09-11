import { useState } from 'react'
import { UserRole } from '../../types'

interface PhysicianAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (user: { name: string; role: UserRole; department: string }) => void
}

export function PhysicianAuthModal({
  isOpen,
  onClose,
  onLoginSuccess
}: PhysicianAuthModalProps) {
  const [pin, setPin] = useState('')
  const [role, setRole] = useState<UserRole>('physician')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // For demo/prototype: PIN 1234 or empty for test
    if (pin === '1234' || pin === '9999' || pin === '') {
      const staffProfiles: Record<UserRole, { name: string; department: string }> = {
        physician: { name: 'Dr. Anjali Rao (BAMS, MD)', department: 'Ayurveda & Integrative OPD' },
        nurse: { name: 'Staff Nurse Sunita M.', department: 'OPD Triage Station 2' },
        admin: { name: 'Admin Records Officer', department: 'Hospital EHR Central' }
      }

      const profile = staffProfiles[role]
      onLoginSuccess({
        name: profile.name,
        role,
        department: profile.department
      })
      onClose()
    } else {
      setError('Invalid Hospital Staff PIN. (Demo PIN: 1234 or leave blank)')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center text-2xl mx-auto mb-3">
            🩺
          </div>
          <h3 className="font-bold text-slate-900 text-xl">Hospital Staff Access</h3>
          <p className="text-xs text-slate-500 mt-1">
            Restricted clinical portal · Patient kiosk bypass blocked
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Select Role</label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              {(['physician', 'nurse', 'admin'] as UserRole[]).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-1.5 rounded-lg capitalize transition-colors ${
                    role === r ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Staff PIN Code</label>
            <input
              type="password"
              value={pin}
              onChange={e => {
                setPin(e.target.value)
                setError('')
              }}
              placeholder="Enter PIN (Demo: 1234)"
              className="w-full px-4 py-3 rounded-xl border text-center font-mono text-lg tracking-widest outline-none focus:border-teal-600"
            />
            {error && <p className="text-[11px] text-rose-600 font-semibold mt-1">{error}</p>}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
            <span className="font-bold block text-slate-700">SIH Demo Credentials:</span>
            PIN: <code className="font-mono font-bold text-teal-800">1234</code> (or press Unlock)
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
            >
              Back to Kiosk
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm"
            >
              Unlock Portal →
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
