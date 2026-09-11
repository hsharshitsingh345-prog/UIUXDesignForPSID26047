/**
 * AI Clinical & AYUSH Engine for MediKiosk
 * Smart India Hackathon PSID 26047 (Ministry of Ayush)
 *
 * Architecture:
 * - AIProvider abstraction (GeminiProvider + OfflineClinicalProvider)
 * - Classical Ayush Prakriti & Dosha constitution scoring
 * - Agni, Koshtha, and Ahara-Vihara clinical mapping
 * - Dynamic questionnaire engine with mandatory "I don't know" support
 * - Configurable Red-Flag safety evaluation (non-diagnostic triage)
 */

// ─── 1. Red-Flag Evaluation ──────────────────────────────────────────────────
export function evaluateRedFlags(complaint = '', symptoms = [], answers = {}) {
  const flags = []
  const text = `${complaint} ${symptoms.join(' ')} ${JSON.stringify(answers)}`.toLowerCase()

  // Cardiac urgent rule
  if (
    text.includes('chest') &&
    (text.includes('sweat') || text.includes('radiat') || text.includes('breathless') || text.includes('arm') || text.includes('diaphoresis'))
  ) {
    flags.push({
      id: `rf-${Date.now()}-1`,
      severity: 'urgent',
      symptom: 'Chest pressure with cold diaphoresis or arm radiation',
      reason: 'Potential acute coronary syndrome. Urgent ECG & cardiac enzyme evaluation indicated.',
      source: 'Patient Symptom Interview',
      timestamp: new Date().toISOString(),
      acknowledged: false
    })
  }

  // Acute GI bleeding rule
  if (text.includes('black stool') || text.includes('vomit blood') || text.includes('hematemesis') || text.includes('melena')) {
    flags.push({
      id: `rf-${Date.now()}-2`,
      severity: 'urgent',
      symptom: 'Reported gastrointestinal bleeding / black tarry stools',
      reason: 'Upper/Lower GI hemorrhage risk. Urgent hemodynamic assessment needed.',
      source: 'Patient Symptom Interview',
      timestamp: new Date().toISOString(),
      acknowledged: false
    })
  }

  // Acute respiratory distress rule
  if (text.includes('cannot breathe') || text.includes('choking') || text.includes('stridor') || text.includes('gasping')) {
    flags.push({
      id: `rf-${Date.now()}-3`,
      severity: 'urgent',
      symptom: 'Acute severe dyspnea at rest',
      reason: 'Respiratory distress. Immediate SpO2 and airway check needed.',
      source: 'Patient Symptom Interview',
      timestamp: new Date().toISOString(),
      acknowledged: false
    })
  }

  return flags
}

// ─── 2. Constitutional Prakriti Scoring Engine ──────────────────────────────
export function calculatePrakriti(answers = {}) {
  let vata = 0
  let pitta = 0
  let kapha = 0

  // 1. Sharira Gathana (Body Build)
  if (answers.bodyFrame === 'thin_dry') vata += 3
  else if (answers.bodyFrame === 'moderate_warm') pitta += 3
  else if (answers.bodyFrame === 'broad_heavy') kapha += 3

  // 2. Ritu Asahishnuta (Weather Sensitivity)
  if (answers.weatherSensitivity === 'cold_wind') vata += 2
  else if (answers.weatherSensitivity === 'heat_sun') pitta += 2
  else if (answers.weatherSensitivity === 'cold_damp') kapha += 2

  // 3. Nidra & Manas (Sleep & Mental Pace)
  if (answers.mentalSleep === 'light_restless') vata += 3
  else if (answers.mentalSleep === 'moderate_intense') pitta += 3
  else if (answers.mentalSleep === 'deep_slow') kapha += 3

  // 4. Tvak (Skin Texture)
  if (answers.skin === 'dry_rough') vata += 2
  else if (answers.skin === 'warm_reddish') pitta += 2
  else if (answers.skin === 'oily_smooth') kapha += 2

  // Default baseline
  if (vata === 0 && pitta === 0 && kapha === 0) {
    vata = 45
    pitta = 35
    kapha = 20
  }

  const total = vata + pitta + kapha
  const vataPct = Math.round((vata / total) * 100)
  const pittaPct = Math.round((pitta / total) * 100)
  const kaphaPct = 100 - (vataPct + pittaPct)

  const ranked = [
    { name: 'Vata', pct: vataPct, sanskrit: 'वात' },
    { name: 'Pitta', pct: pittaPct, sanskrit: 'पित्त' },
    { name: 'Kapha', pct: kaphaPct, sanskrit: 'कफ' }
  ].sort((a, b) => b.pct - a.pct)

  let primary = `${ranked[0].name} Dominant`
  if (ranked[0].pct - ranked[1].pct <= 12) {
    primary = `${ranked[0].name}-${ranked[1].name} Dwandvaja`
  }

  return {
    primary,
    vata: vataPct,
    pitta: pittaPct,
    kapha: kaphaPct,
    isScoreEstimate: true,
    disclaimer: 'AI-assisted questionnaire assessment. This is not a laboratory measurement or final medical diagnosis.'
  }
}

// ─── 3. Agni & Koshtha Clinical Mapping ──────────────────────────────────────
export function evaluateAgniAndKoshtha(answers = {}) {
  const agniMap = {
    very_low: { type: 'Manda Agni', label: 'Sluggish / Slow Digestion', sanskrit: 'मन्दाग्नि', description: 'Reduced digestive fire, post-meal fullness, takes hours to feel light.' },
    irregular: { type: 'Vishama Agni', label: 'Irregular / Fluctuating Appetite', sanskrit: 'विषमाग्नि', description: 'Variable appetite with frequent abdominal distension, gas, or colic.' },
    burning: { type: 'Tikshna Agni', label: 'Hyper-intense / Burning Appetite', sanskrit: 'तीक्ष्णाग्नि', description: 'Intense hunger, acid reflux or burning epigastric discomfort if meal delayed.' },
    normal: { type: 'Sama Agni', label: 'Balanced & Steady Digestion', sanskrit: 'समाग्नि', description: 'Regular hunger cycles, smooth assimilation, energizing post-meal state.' }
  }

  const koshthaMap = {
    hard_constipated: { type: 'Krura Koshtha', label: 'Hard Stool / Constipation Prone', sanskrit: 'क्रूर कोष्ठ', description: 'Dry hard bowel movement, irregular frequency, evacuation requires effort.' },
    soft_loose: { type: 'Mridu Koshtha', label: 'Soft Stool / Sensitive Evacuation', sanskrit: 'मृदु कोष्ठ', description: 'Easily provoked by milk, grapes, or warm spices, tendency to loose motions.' },
    regular_normal: { type: 'Madhyama Koshtha', label: 'Regular & Normal Elimination', sanskrit: 'मध्यम कोष्ठ', description: 'Formed bowel movement once daily with complete sensation of clearance.' }
  }

  return {
    agni: agniMap[answers.agniChoice] || agniMap.normal,
    koshtha: koshthaMap[answers.koshthaChoice] || koshthaMap.regular_normal
  }
}

// ─── 4. Dynamic Modular Question Engine ──────────────────────────────────────
export function getDynamicQuestions(complaint = '', opdType = 'ayush') {
  const c = complaint.toLowerCase()
  const DONT_KNOW = "I don't know / Not sure"

  // Pathway 1: Joint / Musculoskeletal Pain
  if (c.includes('joint') || c.includes('knee') || c.includes('back') || c.includes('sandhi') || c.includes('pain')) {
    return [
      {
        id: 'j1',
        question: 'When is the stiffness or pain in your joints most noticeable?',
        options: [
          'First thing upon waking in the morning',
          'After prolonged standing or walking',
          'Continuous ache all through day and night',
          'Worse during cold, windy or rainy weather',
          DONT_KNOW
        ]
      },
      {
        id: 'j2',
        question: 'Do you notice swelling, warmth, or a cracking sound (crepitus) in the affected joints?',
        options: [
          'Yes, noticeable swelling and warmth',
          'Cracking sound (crepitus) with dryness',
          'Stiffness without swelling or heat',
          'None of the above',
          DONT_KNOW
        ]
      },
      {
        id: 'j3',
        question: 'Does warm oil application (Abhyanga) or heat give relief?',
        options: [
          'Significant relief with warmth/oil',
          'Cold compress feels better',
          'Neither makes any noticeable difference',
          'Oil massage aggravates the pain',
          DONT_KNOW
        ]
      }
    ]
  }

  // Pathway 2: GI / Acidity / Digestion
  if (c.includes('acid') || c.includes('digest') || c.includes('stomach') || c.includes('gas') || c.includes('bloat') || c.includes('amla')) {
    return [
      {
        id: 'g1',
        question: 'Do you experience retrosternal burning or sour/bitter belching?',
        options: [
          'Yes, frequent sour belching & throat burning',
          'Heavy dull fullness like food sits in stomach',
          'Cramping with variable abdominal gas',
          'No burning sensation',
          DONT_KNOW
        ]
      },
      {
        id: 'g2',
        question: 'How soon after meals do symptoms usually appear?',
        options: [
          'Immediately while or right after eating',
          '2–3 hours after meal or on empty stomach',
          'First thing in the morning',
          'Irregular / unpredictable timing',
          DONT_KNOW
        ]
      },
      {
        id: 'g3',
        question: 'Have you noticed any dark/black-colored stools or persistent vomiting?',
        options: [
          'No, normal stool color',
          'Yes, black tarry stools (Urgent safety flag)',
          'Occasional nausea without vomiting',
          'Frequent vomiting',
          DONT_KNOW
        ]
      }
    ]
  }

  // Pathway 3: Chest / Cardiac symptoms
  if (c.includes('chest') || c.includes('heart') || c.includes('breathless')) {
    return [
      {
        id: 'c1',
        question: 'How would you describe the chest discomfort?',
        options: [
          'Heavy pressure, tight squeezing sensation',
          'Sharp, knife-like pain on deep inhalation',
          'Burning ache behind the breastbone',
          'Mild musculoskeletal soreness',
          DONT_KNOW
        ]
      },
      {
        id: 'c2',
        question: 'Does the pain spread to your left arm, jaw, neck, or back?',
        options: [
          'Yes, radiates down the left arm or jaw',
          'Spreads to the mid/upper back',
          'Stays strictly in one small spot',
          'No radiation',
          DONT_KNOW
        ]
      },
      {
        id: 'c3',
        question: 'Is it accompanied by sudden sweating, dizziness, or shortness of breath?',
        options: [
          'Yes, profuse cold sweats (Urgent safety flag)',
          'Breathlessness on walking only',
          'No sweating or dizziness',
          'Occasional palpitations',
          DONT_KNOW
        ]
      }
    ]
  }

  // Pathway 4: Fever & General Malaise
  return [
    {
      id: 'f1',
      question: 'How many days have you had this fever or primary symptom?',
      options: [
        'Sudden onset today',
        'Past 2 to 4 days',
        '1 to 2 weeks',
        'Chronic (over 1 month)',
        DONT_KNOW
      ]
    },
    {
      id: 'f2',
      question: 'Are you experiencing chills, shivering, or body aches?',
      options: [
        'Yes, severe shivering and high fever',
        'Mild low-grade fever with fatigue',
        'Body aches without high temperature',
        'No chills or body aches',
        DONT_KNOW
      ]
    },
    {
      id: 'f3',
      question: 'Does resting, hydration, or over-the-counter medicine provide relief?',
      options: [
        'Rest and fluids improve condition',
        'Temporarily lowered by fever tablet',
        'Fever remains constant',
        'Not tried yet',
        DONT_KNOW
      ]
    }
  ]
}

// ─── 5. AI Provider Abstraction (Gemini + Offline Clinical Engine) ───────────

export class GeminiProvider {
  constructor(apiKey) {
    this.apiKey = apiKey
  }

  async generateSummary(intakeData) {
    const prompt = `You are a clinical documentation AI assisting an OPD physician in India (Ministry of Ayush & ABDM protocol).
Summarize this patient's kiosk intake objectively. Do not fabricate diagnoses.

Patient Intake:
${JSON.stringify(intakeData, null, 2)}

Return strictly valid JSON:
{
  "triageTag": "routine" | "urgent_attention" | "critical_redflag",
  "clinicalHeadline": "string",
  "ayushAssessment": {
    "doshaImbalance": "string",
    "agniStatus": "string",
    "koshthaStatus": "string",
    "provisionalAyushDiagnosis": "string",
    "pathyaApathya": "string"
  },
  "allopathicSummary": {
    "hpi": "string",
    "redFlags": ["string"],
    "suggestedActions": ["string"]
  },
  "missingInformation": ["string"]
}`

    const models = ['gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.6-flash']
    let lastErr = null
    for (const model of models) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${this.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2
            }
          })
        })

        if (res.ok) {
          const json = await res.json()
          const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
          try {
            return JSON.parse(rawText)
          } catch {
            const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
            return JSON.parse(cleaned)
          }
        }
        lastErr = `HTTP ${res.status}`
      } catch (err) {
        lastErr = err.message
      }
    }
    throw new Error(`Gemini API error across pool: ${lastErr}`)
  }
}

export class OfflineClinicalProvider {
  generateSummary(intakeData) {
    const isAyush = intakeData.opdType === 'ayush'
    const redFlags = evaluateRedFlags(intakeData.chiefComplaint, intakeData.symptoms || [], intakeData.ayushAnswers || {})
    const isUrgent = redFlags.some(r => r.severity === 'urgent')

    if (isAyush) {
      const prakriti = calculatePrakriti(intakeData.ayushAnswers || {})
      const { agni, koshtha } = evaluateAgniAndKoshtha(intakeData.ayushAnswers || {})

      return {
        triageTag: isUrgent ? 'urgent_attention' : 'routine',
        clinicalHeadline: `${intakeData.chiefComplaint || 'Ayurvedic Intake'} in a patient with ${prakriti.primary} constitution`,
        provisionalAyushDiagnosis: 'Roga Samprapti indicative of Doshic accumulation with Mandagni/Tikshnagni',
        pathogenesis: 'Vitiated Dosha localization corresponding to reported srotas (channels) and Jatharagni status.',
        recommendedPathya: 'Warm Ushnodaka, easily digestible seasonal meals (Laghu Ahara), regular dinacharya routine.',
        recommendedApathya: 'Excessive cold refrigerated drinks, untimely heavy meals, day sleep (Divasvapna).',
        investigationsSuggested: ['Physician Nadi & Sparshana Pariksha', 'Routine CBC and biochemical evaluation as indicated'],
        missingInformation: intakeData.symptoms?.length ? [] : ['Symptom duration and exact aggravating factors not specified'],
        provenance: [
          { statement: 'Constitutional Dosha tendencies', source: 'Kiosk Guided Ayush Pariksha', confidence: 'High' },
          { statement: 'Reported chief complaint', source: 'Patient Voice / Touch Intake', confidence: 'High' }
        ]
      }
    }

    // Allopathy Fallback
    return {
      triageTag: isUrgent ? 'urgent_attention' : 'routine',
      clinicalHeadline: `${intakeData.chiefComplaint || 'General OPD'} — Clinical documentation briefing`,
      allopathicSummary: {
        hpi: `Patient presents with ${intakeData.chiefComplaint || 'unspecified complaint'} lasting ${intakeData.duration || 'recent duration'}.`,
        redFlags: redFlags.map(r => r.symptom),
        suggestedActions: isUrgent
          ? ['Immediate 12-lead ECG & cardiac monitoring', 'Urgent physician evaluation']
          : ['Routine physical examination', 'Review prior documentation']
      },
      missingInformation: intakeData.medications?.length ? [] : ['Prior medication history not recorded'],
      provenance: [
        { statement: 'Chief presenting complaint', source: 'Patient Kiosk Input', confidence: 'High' }
      ]
    }
  }
}

export async function generateClinicalSummary(intakeData) {
  const apiKey = process.env.GEMINI_API_KEY
  if (apiKey) {
    try {
      const gemini = new GeminiProvider(apiKey)
      return await gemini.generateSummary(intakeData)
    } catch (err) {
      console.warn('[AI] Gemini Provider error, using OfflineClinicalProvider fallback:', err.message)
    }
  }

  const offline = new OfflineClinicalProvider()
  return offline.generateSummary(intakeData)
}
