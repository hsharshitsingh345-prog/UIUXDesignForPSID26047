import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.join(__dirname, 'data')
const DB_FILE = path.join(DATA_DIR, 'db.json')
const DB_TMP_FILE = path.join(DATA_DIR, 'db.json.tmp')

// Fictional test cases for Smart India Hackathon PSID 26047
const INITIAL_DATA = {
  lastToken: 125,
  intakes: [
    // Patient C: Cardiology Red Flag Urgent Case
    {
      id: 'case-102',
      token: '#124',
      patientName: 'Ramesh Kumar',
      age: 56,
      gender: 'M',
      phone: '+91 94123 45678',
      abhaId: '91-2345-6789-0123',
      opdType: 'allopathy',
      department: 'Cardiology OPD',
      status: 'in-consultation',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      chiefComplaint: 'Central chest pressure & exertion dyspnea × 1 day',
      rawPatientStatement: "I feel heavy squeezing pressure in the center of my chest since yesterday evening, spreads to left arm.",
      duration: '1 day',
      painScore: 7,
      symptoms: ['Substernal chest pressure radiating to left arm', 'Exertional dyspnea (breathlessness)', 'Cold diaphoresis (sweating)'],
      pastHistory: ['Type 2 Diabetes Mellitus (8 yrs)', 'Essential Hypertension (5 yrs)'],
      medications: [
        { name: 'Metformin', dosage: '500 mg', frequency: 'Twice daily', source: 'ocr_prescription', confidence: 97, verified: true },
        { name: 'Amlodipine', dosage: '5 mg', frequency: 'Once daily', source: 'ocr_prescription', confidence: 95, verified: true },
        { name: 'Atorvastatin', dosage: '10 mg', frequency: 'Night', source: 'ocr_prescription', confidence: 91, verified: true }
      ],
      allergies: ['No known drug allergies (NKDA)'],
      allergyStatus: 'none',
      investigations: [
        { test: 'HbA1c', value: '8.2%', date: 'Aug 12, 2026', flag: true },
        { test: 'Serum Creatinine', value: '1.1 mg/dL', date: 'Aug 12, 2026', flag: false },
        { test: 'BP (Kiosk Checked)', value: '158/96 mmHg', date: 'Today', flag: true }
      ],
      redFlags: [
        {
          id: 'rf-1',
          ruleId: 'rf_cardiac_angina',
          name: 'Acute Typical Angina / ACS Suspicion',
          category: 'cardiac',
          severity: 'urgent',
          symptomSnippet: 'Substernal chest pressure with cold diaphoresis or arm radiation',
          staffMessage: 'Patient reported chest discomfort with cold diaphoresis or arm radiation. Potential ACS. Immediate 12-lead ECG & cardiac evaluation required.',
          timestamp: new Date(Date.now() - 1700000).toISOString(),
          acknowledged: false,
          acknowledgedBy: null,
          acknowledgedAt: null,
          dismissed: false,
          dismissReason: null
        }
      ],
      aiSummary: {
        triageTag: 'urgent_attention',
        clinicalHeadline: 'Acute Typical Angina in a 56M Hypertensive Diabetic',
        attentionNotes: 'Hypertensive diabetic with acute typical angina symptoms. Immediate 12-lead ECG & Trop-I indicated.',
        allopathicSummary: {
          hpi: 'Patient reports 1-day history of heavy pressure-like chest tightness radiating to the left arm, exacerbated by exertion.',
          redFlags: ['Substernal chest pressure radiating to left arm with diaphoresis'],
          suggestedActions: ['Stat 12-Lead ECG', 'Serum Troponin-I / CK-MB', 'Continuous vitals monitor', 'Cardiology consult']
        },
        provenance: [
          { statement: 'Substernal chest pressure with left arm radiation', source: 'PATIENT_SPOKEN', confidence: 'High' },
          { statement: 'Metformin 500mg & Amlodipine 5mg', source: 'OCR', confidence: '96%' }
        ]
      },
      documents: [
        { id: 'd1', date: 'Aug 12, 2026', year: 2026, type: 'Prescription', title: 'Cardiology Followup Rx', summary: 'Metformin 500mg, Amlodipine 5mg' },
        { id: 'd2', date: 'Aug 12, 2026', year: 2026, type: 'Lab Report', title: 'Glycemic Profile', summary: 'HbA1c: 8.2%', flag: true }
      ],
      editHistory: [],
      isDemoData: true
    },
    // Patient B: AYUSH Joint Pain Case
    {
      id: 'case-101',
      token: '#123',
      patientName: 'Priya Sharma',
      age: 42,
      gender: 'F',
      phone: '+91 98765 43210',
      abhaId: '45-8912-3456-7890',
      opdType: 'ayush',
      department: 'Ayurveda OPD',
      status: 'waiting',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      chiefComplaint: 'Sandhivata (Chronic knee joint stiffness & swelling) × 6 months',
      rawPatientStatement: 'My knee joints crack and feel very stiff in the morning. Better when I put warm oil.',
      duration: '6 months',
      painScore: 6,
      symptoms: ['Joint stiffness in morning', 'Crepitus/cracking sound', 'Worse in cold dry weather', 'Digestive heaviness post-meal'],
      ayushData: {
        prakriti: {
          primary: 'Vata-Kapha Dwandvaja',
          vata: 55,
          pitta: 20,
          kapha: 25,
          bodyFrame: 'Thin to moderate build, tends to dry skin',
          weatherSensitivity: 'Averse to cold and dry winds (Shita-Asahishnuta)',
          mentalSleep: 'Light sleeper, active mind, tires easily',
          isScoreEstimate: true
        },
        agni: {
          type: 'Manda Agni',
          description: 'Sluggish digestive fire, slow digestion, post-meal heaviness',
          sanskrit: 'मन्दाग्नि'
        },
        koshtha: {
          type: 'Krura Koshtha',
          description: 'Hard bowel movements, mild constipation tendency',
          sanskrit: 'क्रूर कोष्ठ'
        },
        ahara: {
          dominantTaste: 'Pungent & Bitter preference',
          mealRoutine: 'Irregular lunch times, low warm water intake'
        },
        vihara: {
          activity: 'Sedentary desk work, limited joint movement',
          stress: 'Moderate work stress, disturbed sleep'
        },
        dashavidha: {
          bala: 'Madhyama (Medium endurance)',
          desha: 'Sadharana (Mixed temperate)',
          kala: 'Shishira / Hemanta (Winter aggravation)'
        }
      },
      aiSummary: {
        triageTag: 'routine',
        clinicalHeadline: 'Sandhigata Vata with Aama association in a Vata-Kapha constitution',
        provisionalAyushDiagnosis: 'Sandhigata Vata (Osteoarthrosis) with Aama association',
        pathogenesis: 'Vitiated Vata dosha localized in Janu sandhi (knee joints) with sluggish Jatharagni contributing to metabolic Aama formation.',
        recommendedPathya: 'Warm sesame oil local abhyanga, Sunthi (dry ginger) water, light warm easily digestible meals (Laghu Ahara).',
        recommendedApathya: 'Cold refrigerated foods, curd at night, dry raw salads, prolonged standing.',
        investigationsSuggested: ['X-Ray Both Knees (AP & Lateral)', 'Serum Uric Acid', 'RA Factor'],
        provenance: [
          { statement: 'Prakriti & Agni characteristics', source: 'PATIENT_SELECTED', confidence: 'High' },
          { statement: 'Morning joint stiffness & crepitus', source: 'PATIENT_SPOKEN', confidence: 'High' }
        ]
      },
      allergies: ['No known drug allergies'],
      allergyStatus: 'none',
      editHistory: [],
      isDemoData: true
    },
    // Patient A: AYUSH Acidity / Pitta Dominant Case
    {
      id: 'case-100',
      token: '#122',
      patientName: 'Sunita Verma',
      age: 34,
      gender: 'F',
      phone: '+91 98111 22334',
      abhaId: '12-3456-7890-1234',
      opdType: 'ayush',
      department: 'Ayurveda OPD',
      status: 'waiting',
      timestamp: new Date(Date.now() - 5400000).toISOString(),
      chiefComplaint: 'Amalpitta (Chronic Hyperacidity, Sour Belching & Retrosternal Burning)',
      rawPatientStatement: 'Intense burning in throat and chest 2 hours after meals, cannot tolerate spicy food.',
      duration: '3 months',
      painScore: 5,
      symptoms: ['Retrosternal burning (Vidaha)', 'Sour and bitter eructations (Tikta-Amla Udgara)', 'Headache when meals delayed', 'Nausea in morning'],
      ayushData: {
        prakriti: {
          primary: 'Pitta Dominant',
          vata: 25,
          pitta: 60,
          kapha: 15,
          bodyFrame: 'Medium frame, sensitive warm skin with flushing',
          weatherSensitivity: 'Intolerant to direct sun and heat',
          mentalSleep: 'Moderate sleep, vivid dreams, sharp temper',
          isScoreEstimate: true
        },
        agni: {
          type: 'Tikshna Agni',
          description: 'Hyper-intense appetite, severe heartburn if food delayed',
          sanskrit: 'तीक्ष्णाग्नि'
        },
        koshtha: {
          type: 'Mridu Koshtha',
          description: 'Soft stool, easily irritated by spices or warm milk',
          sanskrit: 'मृदु कोष्ठ'
        },
        ahara: {
          dominantTaste: 'Craves sweets, sensitive to sour and pungent',
          mealRoutine: 'Frequent tea drinking, delayed lunches'
        },
        vihara: {
          activity: 'Moderate activity, computer screen fatigue',
          stress: 'High mental deadlines'
        }
      },
      aiSummary: {
        triageTag: 'routine',
        clinicalHeadline: 'Urdhwaga Amlapitta in a Pitta-Prakriti patient with Tikshnagni',
        provisionalAyushDiagnosis: 'Urdhwaga Amlapitta (Hyperchlorhydria / GERD)',
        pathogenesis: 'Excessive Drava and Amla Guna increase in Pachaka Pitta leading to burning and reflux.',
        recommendedPathya: 'Cold milk, Munakka (raisins), barley water, Dadima (pomegranate), regular meal schedule.',
        recommendedApathya: 'Excessive tea/coffee, chili, fermented food, late night meals.',
        investigationsSuggested: ['Upper GI Endoscopy if symptoms persist', 'USG Abdomen']
      },
      allergies: ['Sulfonamides (rash)'],
      allergyStatus: 'yes',
      editHistory: [],
      isDemoData: true
    },
    // Patient D: General Allopathy Fever Case
    {
      id: 'case-099',
      token: '#121',
      patientName: 'Rajesh Patel',
      age: 29,
      gender: 'M',
      phone: '+91 97234 56789',
      abhaId: '33-4455-6677-8899',
      opdType: 'allopathy',
      department: 'General Medicine OPD',
      status: 'completed',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      chiefComplaint: 'Acute viral syndrome — fever & dry cough × 3 days',
      rawPatientStatement: 'Mild fever with body aches and dry throat since three days.',
      duration: '3 days',
      painScore: 3,
      symptoms: ['Low grade fever (100.2 F)', 'Myalgia and fatigue', 'Dry tickly cough'],
      allergies: ['No known drug allergies'],
      allergyStatus: 'none',
      aiSummary: {
        triageTag: 'routine',
        clinicalHeadline: 'Acute Upper Respiratory Viral Illness',
        allopathicSummary: {
          hpi: '3-day history of low grade fever and myalgia. No dyspnea or hemoptysis.',
          redFlags: [],
          suggestedActions: ['CBC, Dengue NS1 if fever persists > 5 days', 'Supportive hydration and antipyretics']
        }
      },
      editHistory: [],
      isDemoData: true
    }
  ],
  auditLogs: [
    {
      id: 'aud-1',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      action: 'intake_submitted',
      actor: 'patient_kiosk',
      role: 'patient_kiosk',
      recordId: 'case-099',
      result: 'success'
    },
    {
      id: 'aud-2',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      action: 'consent_accepted',
      actor: 'patient_kiosk',
      role: 'patient_kiosk',
      recordId: 'case-101',
      result: 'agreed'
    },
    {
      id: 'aud-3',
      timestamp: new Date(Date.now() - 1700000).toISOString(),
      action: 'red_flag_triggered',
      actor: 'system_rule_engine',
      role: 'system',
      recordId: 'case-102',
      result: 'rf_cardiac_angina'
    }
  ]
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(DB_FILE)) {
    atomicWriteDb(INITIAL_DATA)
  }
}

export function readDb() {
  ensureDataDir()
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch (err) {
    console.error('[DB] Corrupted db.json, rolling back to seed data:', err.message)
    atomicWriteDb(INITIAL_DATA)
    return INITIAL_DATA
  }
}

/**
 * Safe Atomic Write: Writes to tmp file then renames to avoid partial corruptions
 */
export function atomicWriteDb(data) {
  ensureDataDir()
  try {
    const serialized = JSON.stringify(data, null, 2)
    fs.writeFileSync(DB_TMP_FILE, serialized, 'utf-8')
    fs.renameSync(DB_TMP_FILE, DB_FILE)
  } catch (err) {
    console.error('[DB] Atomic write error:', err)
  }
}

// ─── Repositories ────────────────────────────────────────────────────────────

export const PatientRepository = {
  findByNameAndPhone(name, phone) {
    const db = readDb()
    return db.intakes.find(i => i.patientName.toLowerCase() === name.toLowerCase() && i.phone === phone)
  }
}

export const EncounterRepository = {
  recordPhysicianEdit(caseId, field, originalValue, editedValue, editorName) {
    const db = readDb()
    const intake = db.intakes.find(i => i.id === caseId)
    if (!intake) return null

    if (!intake.editHistory) intake.editHistory = []
    intake.editHistory.push({
      field,
      originalValue,
      editedValue,
      editor: editorName,
      timestamp: new Date().toISOString()
    })

    atomicWriteDb(db)
    AuditRepository.record('physician_edited_record', editorName, 'physician', caseId, 'success')
    return intake
  }
}

export const QueueRepository = {
  findAll() {
    const db = readDb()
    return db.intakes
  },

  findById(id) {
    const db = readDb()
    return db.intakes.find(i => i.id === id || i.token === id)
  },

  create(payload) {
    const db = readDb()

    // Deduplication check: Protect against double-click submissions within 10 seconds
    const now = Date.now()
    const duplicate = db.intakes.find(i => {
      const diff = now - new Date(i.timestamp).getTime()
      return (
        diff < 10000 &&
        i.patientName.toLowerCase() === (payload.patientName || '').toLowerCase() &&
        i.chiefComplaint === payload.chiefComplaint
      )
    })

    if (duplicate) {
      console.warn(`[QueueRepository] Deduplicated submission for ${payload.patientName}`)
      return duplicate
    }

    db.lastToken = (db.lastToken || 125) + 1
    const token = `#${db.lastToken}`
    const newIntake = {
      id: `case-${Date.now()}`,
      token,
      timestamp: new Date().toISOString(),
      status: 'waiting',
      editHistory: [],
      ...payload
    }

    db.intakes.unshift(newIntake)
    atomicWriteDb(db)

    AuditRepository.record('intake_submitted', 'patient_kiosk', 'patient_kiosk', newIntake.id, token)
    return newIntake
  },

  updateStatus(id, status, notes = '', doctorName = 'Hospital Staff') {
    const db = readDb()
    const intake = db.intakes.find(i => i.id === id || i.token === id)
    if (!intake) return null

    const prevStatus = intake.status
    intake.status = status
    if (notes) {
      EncounterRepository.recordPhysicianEdit(intake.id, 'physicianNotes', intake.physicianNotes || '', notes, doctorName)
      intake.physicianNotes = notes
    }

    atomicWriteDb(db)
    AuditRepository.record('encounter_status_updated', doctorName, 'physician', intake.id, `${prevStatus} -> ${status}`)
    return intake
  },

  resetDemoData() {
    const freshData = JSON.parse(JSON.stringify(INITIAL_DATA))
    freshData.intakes.forEach(item => {
      item.timestamp = new Date().toISOString()
    })
    atomicWriteDb(freshData)
    AuditRepository.record('demo_data_reset', 'admin', 'admin', null, 'success')
    return freshData.intakes
  }
}

export const RedFlagRepository = {
  acknowledge(caseId, flagId, doctorName, dismissReason = '') {
    const db = readDb()
    const intake = db.intakes.find(i => i.id === caseId)
    if (!intake || !intake.redFlags) return null

    const flag = intake.redFlags.find(f => f.id === flagId)
    if (!flag) return null

    flag.acknowledged = true
    flag.acknowledgedBy = doctorName
    flag.acknowledgedAt = new Date().toISOString()

    if (dismissReason) {
      flag.dismissed = true
      flag.dismissReason = dismissReason
      AuditRepository.record('red_flag_dismissed', doctorName, 'physician', caseId, dismissReason)
    } else {
      AuditRepository.record('red_flag_acknowledged', doctorName, 'physician', caseId, 'acknowledged')
    }

    atomicWriteDb(db)
    return intake
  }
}

export const AuditRepository = {
  record(action, actor = 'patient_kiosk', role = 'patient_kiosk', recordId = null, result = 'success') {
    const db = readDb()
    if (!db.auditLogs) db.auditLogs = []

    // Security: Only store metadata, NO sensitive raw clinical PII in audit log
    const event = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      action,
      actor,
      role,
      recordId,
      result
    }

    db.auditLogs.unshift(event)
    if (db.auditLogs.length > 300) db.auditLogs.pop()

    atomicWriteDb(db)
    return event
  },

  findAll() {
    const db = readDb()
    return db.auditLogs || []
  }
}

export const UserRepository = {
  getDemoUsers() {
    return [
      { id: 'doc-001', name: 'Dr. Anjali Rao (BAMS, MD)', role: 'physician', department: 'Ayurveda & Integrative Medicine' },
      { id: 'nurse-001', name: 'Staff Nurse Sunita M.', role: 'nurse', department: 'OPD Triage Station 2' },
      { id: 'admin-001', name: 'Central Records Officer', role: 'admin', department: 'Hospital EHR Central' }
    ]
  }
}
