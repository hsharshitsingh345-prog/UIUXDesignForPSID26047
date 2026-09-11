import { PatientCase, AuthSession, UserRole, RedFlagAlert } from '../types'

const API_BASE = 'http://localhost:5000/api'

export async function fetchHealth(): Promise<{ status: string; aiMode: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/health`)
    if (!res.ok) return null
    return await res.json()
  } catch (err) {
    console.warn('[API] Health check failed:', err)
    return null
  }
}

export async function fetchQueue(): Promise<PatientCase[]> {
  try {
    const res = await fetch(`${API_BASE}/queue`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    return json.data || []
  } catch (err) {
    console.warn('[API] Failed to fetch queue:', err)
    return []
  }
}

export async function fetchPatient(id: string): Promise<PatientCase | null> {
  try {
    const res = await fetch(`${API_BASE}/patient/${id}`)
    if (!res.ok) return null
    const json = await res.json()
    return json.data || null
  } catch (err) {
    console.warn('[API] Failed to fetch patient:', err)
    return null
  }
}

export async function submitIntake(payload: Partial<PatientCase>): Promise<{ success: boolean; token: string; data?: PatientCase }> {
  try {
    const res = await fetch(`${API_BASE}/intake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('[API] Failed to post intake, returning simulated token:', err)
    return {
      success: true,
      token: `#${Math.floor(126 + Math.random() * 50)}`
    }
  }
}

export async function fetchDynamicQuestions(complaint: string, opdType: 'ayush' | 'allopathy' = 'ayush') {
  try {
    const res = await fetch(`${API_BASE}/ai/dynamic-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ complaint, opdType })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    return json.questions || []
  } catch (err) {
    console.warn('[API] Failed to fetch dynamic questions:', err)
    return []
  }
}

export async function checkRedFlags(complaint: string, symptoms: string[] = [], answers: any = {}) {
  try {
    const res = await fetch(`${API_BASE}/red-flags/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ complaint, symptoms, answers })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('[API] Red flag check failed:', err)
    return { isUrgent: false, flags: [] }
  }
}

export async function updateQueueStatus(id: string, status: string, notes?: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/queue/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    })
    return res.ok
  } catch (err) {
    console.warn('[API] Failed to update status:', err)
    return false
  }
}

export async function acknowledgeRedFlag(caseId: string, flagId: string, doctorName: string, dismissReason?: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/queue/${caseId}/red-flag/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flagId, doctorName, dismissReason })
    })
    return res.ok
  } catch (err) {
    console.warn('[API] Failed to acknowledge red flag:', err)
    return false
  }
}

export async function recordAudit(action: string, details: Record<string, any> = {}, userId = 'kiosk_patient') {
  try {
    await fetch(`${API_BASE}/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, details, userId })
    })
  } catch (err) {
    // Non-blocking audit logging
  }
}

export async function loginStaff(pin: string, role: UserRole): Promise<AuthSession | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, role })
    })
    if (!res.ok) return null
    return await res.json()
  } catch (err) {
    console.warn('[API] Staff login failed:', err)
    return null
  }
}

/**
 * Send an uploaded document file to the backend for Gemini Vision OCR.
 * Returns structured prescription data: medications, doctor name, date, etc.
 */
export async function callGeminiOCR(file: File): Promise<{
  success: boolean
  offline?: boolean
  message?: string
  doctorName?: string
  clinicName?: string
  prescriptionDate?: string
  patientName?: string
  medications?: MedicationRecord[]
  additionalInstructions?: string
  warnings?: string[]
  error?: string
}> {
  try {
    const formData = new FormData()
    formData.append('document', file)

    const res = await fetch(`${API_BASE}/ocr/extract`, {
      method: 'POST',
      body: formData
      // Note: Do NOT set Content-Type manually — browser sets it with boundary for multipart
    })

    const json = await res.json()
    return json
  } catch (err) {
    console.warn('[API] OCR call failed:', err)
    return { success: false, error: 'Could not connect to OCR service. Check backend is running.' }
  }
}

export async function resetDemoDataApi(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' })
    return res.ok
  } catch (err) {
    console.warn('[API] Reset demo data failed:', err)
    return false
  }
}

