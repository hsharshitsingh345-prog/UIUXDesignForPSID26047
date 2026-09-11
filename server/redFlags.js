/**
 * MediKiosk Configuration-Driven Red-Flag Screening Engine
 * Smart India Hackathon PSID 26047 — Ministry of Ayush
 *
 * NOTE: This is an assistive clinical screening layer to aid staff escalation.
 * It is NOT a substitute for emergency medical assessment or comprehensive clinical triage.
 */

export const RED_FLAG_RULES = [
  {
    id: 'rf_cardiac_angina',
    name: 'Acute Typical Angina / ACS Suspicion',
    category: 'cardiac',
    severity: 'urgent',
    enabled: true,
    keywords: ['chest', 'heart', 'substernal', 'angina'],
    secondaryKeywords: ['sweat', 'diaphoresis', 'radiat', 'arm', 'jaw', 'breathless', 'cold sweat'],
    patientMessage: 'Please wait — a healthcare staff member is coming to assist you immediately.',
    staffMessage: 'Patient reported chest discomfort with cold diaphoresis or arm radiation. Potential ACS. Immediate 12-lead ECG & cardiac evaluation required.'
  },
  {
    id: 'rf_gi_hemorrhage',
    name: 'Gastrointestinal Hemorrhage / Bleeding',
    category: 'hemorrhage',
    severity: 'urgent',
    enabled: true,
    keywords: ['black stool', 'tarry stool', 'melena', 'vomit blood', 'hematemesis', 'blood in vomit', 'rectal bleeding'],
    secondaryKeywords: [],
    patientMessage: 'Please wait — a clinical nurse is coming to assist you.',
    staffMessage: 'Reported gastrointestinal bleeding / hematemesis / melena. Hemodynamic and SpO2 assessment needed.'
  },
  {
    id: 'rf_acute_dyspnea',
    name: 'Severe Acute Respiratory Distress',
    category: 'respiratory',
    severity: 'urgent',
    enabled: true,
    keywords: ['cannot breathe', 'gasping', 'choking', 'stridor', 'severe breathlessness', 'suffocating'],
    secondaryKeywords: [],
    patientMessage: 'Please remain calm — medical staff is on their way to assist your breathing.',
    staffMessage: 'Reported acute severe dyspnea at rest. Immediate SpO2 and airway check needed.'
  },
  {
    id: 'rf_neurological_stroke',
    name: 'Acute Neurological Deficit',
    category: 'neurological',
    severity: 'urgent',
    enabled: true,
    keywords: ['facial droop', 'face drooping', 'slurred speech', 'cannot speak', 'arm weakness', 'sudden numbness', 'loss of vision'],
    secondaryKeywords: [],
    patientMessage: 'Please stay seated — healthcare staff is coming to assist you.',
    staffMessage: 'Reported sudden focal neurological deficit / speech change. Urgent FAST stroke screening indicated.'
  },
  {
    id: 'rf_severe_anaphylaxis',
    name: 'Anaphylaxis / Severe Allergy',
    category: 'allergic',
    severity: 'urgent',
    enabled: true,
    keywords: ['throat swelling', 'swollen tongue', 'lip swelling', 'hives spreading', 'anaphylaxis'],
    secondaryKeywords: ['cannot breathe', 'wheezing', 'dizzy'],
    patientMessage: 'Please stay at this kiosk — clinical staff has been alerted.',
    staffMessage: 'Suspected severe allergic reaction / airway edema. Stat medical evaluation required.'
  }
]

export function screenForRedFlags(complaint = '', symptoms = [], answers = {}) {
  const combinedText = `${complaint} ${symptoms.join(' ')} ${JSON.stringify(answers)}`.toLowerCase()
  const triggered = []

  for (const rule of RED_FLAG_RULES) {
    if (!rule.enabled) continue

    const hasPrimary = rule.keywords.some(k => combinedText.includes(k.toLowerCase()))
    if (!hasPrimary) continue

    if (rule.secondaryKeywords && rule.secondaryKeywords.length > 0) {
      const hasSecondary = rule.secondaryKeywords.some(s => combinedText.includes(s.toLowerCase()))
      if (!hasSecondary) continue
    }

    triggered.push({
      id: `rf-${Date.now()}-${rule.id}`,
      ruleId: rule.id,
      name: rule.name,
      category: rule.category,
      severity: rule.severity,
      patientMessage: rule.patientMessage,
      staffMessage: rule.staffMessage,
      symptomSnippet: complaint || 'Reported during clinical questioning',
      timestamp: new Date().toISOString(),
      acknowledged: false,
      acknowledgedBy: null,
      acknowledgedAt: null,
      dismissed: false,
      dismissReason: null
    })
  }

  return triggered
}
