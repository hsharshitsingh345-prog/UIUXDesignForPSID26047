export type OPDType = 'ayush' | 'allopathy'
export type LanguageCode = 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'kn' | 'mr' | 'gu'
export type UserRole = 'physician' | 'nurse' | 'admin'

export interface AyushPrakriti {
  primary: string
  vata: number
  pitta: number
  kapha: number
  description?: string
  bodyFrame?: string
  weatherSensitivity?: string
  mentalSleep?: string
  isScoreEstimate?: boolean
}

export interface AyushAgni {
  type: string
  description?: string
  label?: string
  sanskrit?: string
}

export interface AyushKoshtha {
  type: string
  description?: string
  label?: string
  sanskrit?: string
}

export interface AyushData {
  prakriti: AyushPrakriti
  agni: AyushAgni
  koshtha: AyushKoshtha
  ahara?: {
    dominantTaste?: string
    mealRoutine?: string
  }
  vihara?: {
    activity?: string
    stress?: string
  }
  dashavidha?: {
    bala?: string
    desha?: string
    kala?: string
  }
}

export interface AIObservation {
  id: string
  field: string
  value: string
  source: 'patient_voice' | 'patient_touch' | 'ocr_prescription' | 'ai_inference'
  sourceDetail: string
  confidence: number // 0 to 100
  verified: boolean
  verifiedBy?: string
  verifiedAt?: string
}

export interface RedFlagAlert {
  id: string
  severity: 'informational' | 'warning' | 'urgent'
  symptom: string
  reason: string
  source: string
  timestamp: string
  acknowledged: boolean
  acknowledgedBy?: string
  dismissed?: boolean
  dismissReason?: string
}

export interface AISummary {
  triageTag: 'routine' | 'urgent_attention' | 'critical_redflag'
  clinicalHeadline?: string
  provisionalAyushDiagnosis?: string
  pathogenesis?: string
  recommendedPathya?: string
  recommendedApathya?: string
  investigationsSuggested?: string[]
  attentionNotes?: string
  missingInformation?: string[]
  ayushAssessment?: {
    doshaImbalance: string
    agniStatus: string
    koshthaStatus: string
    provisionalAyushDiagnosis: string
    pathyaApathya: string
  }
  allopathicSummary?: {
    hpi: string
    redFlags: string[]
    suggestedActions: string[]
  }
  provenance?: Array<{
    statement: string
    source: string
    confidence: string
  }>
}

export interface MedicationRecord {
  id?: string
  name: string
  dosage: string
  frequency: string
  source?: 'patient_voice' | 'ocr_prescription' | 'manual'
  confidence?: number
  verified?: boolean
}

export interface DocumentTimelineItem {
  id: string
  date: string
  year: number
  type: 'Prescription' | 'Lab Report' | 'Discharge Summary' | 'Scan'
  title: string
  summary: string
  flag?: boolean
  url?: string
}

export interface ConsentRecord {
  status: 'agreed' | 'declined'
  timestamp: string
  version: string
  language: LanguageCode
  capturedAtKiosk: boolean
}

export interface AuditEvent {
  id: string
  timestamp: string
  action:
    | 'kiosk_session_started'
    | 'consent_accepted'
    | 'consent_declined'
    | 'intake_submitted'
    | 'red_flag_triggered'
    | 'ocr_verified'
    | 'physician_login'
    | 'physician_viewed_case'
    | 'physician_confirmed_summary'
    | 'physician_edited_record'
    | 'physician_dismissed_alert'
  userId?: string
  patientId?: string
  details?: Record<string, any>
}

export interface VitalsData {
  bpSystolic?: number
  bpDiastolic?: number
  pulse?: number
  spo2?: number
  temperature?: number
  recordedAt?: string
  isCritical?: boolean
}

export interface PatientCase {
  id: string
  token: string
  patientName: string
  age: number
  gender: string
  phone: string
  abhaId?: string
  opdType: OPDType
  department: string
  status: 'waiting' | 'in-consultation' | 'completed'
  timestamp: string
  chiefComplaint: string
  rawPatientStatement?: string
  duration?: string
  painScore?: number
  symptoms?: string[]
  pastHistory?: string[]
  vitals?: VitalsData
  medications?: MedicationRecord[]
  allergies?: string[]
  allergyStatus?: 'none' | 'yes' | 'unspecified'
  investigations?: Array<{ test: string; value: string; date?: string; flag?: boolean }>
  ayushData?: AyushData
  aiSummary?: AISummary
  redFlags?: RedFlagAlert[]
  documents?: DocumentTimelineItem[]
  consent?: ConsentRecord
  observations?: AIObservation[]
  physicianNotes?: string
  isDemoData?: boolean
}

export interface AuthSession {
  token: string
  user: {
    id: string
    name: string
    role: UserRole
    department: string
  }
}
