import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import {
  QueueRepository,
  AuditRepository,
  RedFlagRepository
} from './db.js'
import {
  calculatePrakriti,
  evaluateAgniAndKoshtha,
  getDynamicQuestions,
  generateClinicalSummary,
  evaluateRedFlags
} from './aiEngine.js'

// Resolve .env relative to this file (server/.env) not process.cwd()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
const PORT = process.env.PORT || 5000

// Multer: in-memory storage for OCR image uploads (no disk writes needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/webp', 'image/jpg',
      'application/pdf', 'image/heic', 'image/heif', 'image/bmp', 'image/tiff',
      'application/octet-stream'
    ]
    if (allowed.includes((file.mimetype || '').toLowerCase()) || (file.originalname || '').match(/\.(jpe?g|png|webp|pdf|heic|bmp|tiff)$/i)) {
      cb(null, true)
    } else {
      cb(new Error('Please upload an image (JPG, PNG, WebP) or PDF file.'))
    }
  }
})

// Middleware
app.use(cors({ origin: '*' }))
app.use(express.json())

// Rate limiting map for OCR uploads (10 uploads per min per IP)
const ocrRateLimitMap = new Map()
const OCR_WINDOW_MS = 60 * 1000
const OCR_MAX_REQUESTS = 10

function ocrRateLimiter(req, res, next) {
  const ip = req.ip || req.connection?.remoteAddress || 'client'
  const now = Date.now()
  const record = ocrRateLimitMap.get(ip) || { count: 0, resetTime: now + OCR_WINDOW_MS }

  if (now > record.resetTime) {
    record.count = 1
    record.resetTime = now + OCR_WINDOW_MS
    ocrRateLimitMap.set(ip, record)
    return next()
  }

  if (record.count >= OCR_MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      error: 'OCR rate limit reached (10 scans/minute). Please wait 60 seconds to conserve AI quota.'
    })
  }

  record.count++
  ocrRateLimitMap.set(ip, record)
  next()
}

// ─── 1. Health & Configuration Check ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'MediKiosk Clinical Documentation & AYUSH Backend',
    version: '2.0.0-sih',
    timestamp: new Date().toISOString(),
    aiMode: process.env.GEMINI_API_KEY ? 'Gemini 1.5 Flash + Clinical Rule Engine' : 'Offline High-Precision Clinical Engine (Offline Mode)',
    geminiKeyLoaded: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
    ocrEnabled: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
    sihProblemStatement: 'PSID 26047 - Patient Case-Taking Software (Ministry of Ayush)',
    features: {
      redFlagSafety: true,
      auditLogging: true,
      ayushPariksha: true,
      ocrVerification: true,
      sourceTraceability: true
    }
  })
})

// ─── 2. OPD Live Queue ────────────────────────────────────────────────────────
app.get('/api/queue', (req, res) => {
  try {
    const queue = QueueRepository.findAll()
    res.json({ success: true, count: queue.length, data: queue })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ─── 3. Single Patient Details ────────────────────────────────────────────────
app.get('/api/patient/:id', (req, res) => {
  try {
    const intake = QueueRepository.findById(req.params.id)
    if (!intake) {
      return res.status(404).json({ success: false, error: 'Patient case not found' })
    }
    AuditRepository.record('physician_viewed_case', { caseId: req.params.id })
    res.json({ success: true, data: intake })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ─── 3b. Update Queue Status & Physician Notes ────────────────────────────────
app.patch(['/api/queue/:id/status', '/api/queue/:id'], (req, res) => {
  try {
    const { status, notes, doctorNotes, doctorName } = req.body
    const noteText = notes || doctorNotes || ''
    const updated = QueueRepository.updateStatus(
      req.params.id,
      status || 'in_consultation',
      noteText,
      doctorName || 'Dr. Anjali Rao (BAMS, MD)'
    )
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Patient case not found' })
    }
    // Mirror doctorNotes for convenience
    updated.doctorNotes = updated.physicianNotes || noteText
    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ─── 4. Kiosk Intake Submission ───────────────────────────────────────────────
app.post('/api/intake', async (req, res) => {
  try {
    const body = req.body
    if (!body.patientName && !body.chiefComplaint) {
      return res.status(400).json({ success: false, error: 'Patient name or chief complaint required' })
    }

    // Safety: Check for Red-Flag urgency
    const detectedRedFlags = evaluateRedFlags(
      body.chiefComplaint,
      body.symptoms || [],
      body.ayushAnswers || {}
    )

    // Evaluate vital signs safety if present
    if (body.vitals && (body.vitals.isCritical || (body.vitals.bpSystolic >= 180 || body.vitals.bpDiastolic >= 120 || (body.vitals.spo2 && body.vitals.spo2 < 90)))) {
      const isSevereBp = (body.vitals.bpSystolic >= 180 || body.vitals.bpDiastolic >= 120)
      detectedRedFlags.push({
        id: `rf-vitals-${Date.now()}`,
        ruleId: 'rf_critical_vitals',
        name: isSevereBp ? 'Hypertensive Crisis Alert' : 'Critical Hypoxemia Alert',
        category: 'vitals',
        severity: 'urgent',
        symptomSnippet: isSevereBp
          ? `Severe BP recorded: ${body.vitals.bpSystolic}/${body.vitals.bpDiastolic} mmHg`
          : `Critical SpO2 reading: ${body.vitals.spo2}%`,
        staffMessage: 'Emergency vital signs captured at kiosk triage. Immediate doctor assessment required.',
        timestamp: new Date().toISOString(),
        acknowledged: false,
        acknowledgedBy: null,
        acknowledgedAt: null,
        dismissed: false
      })
    }

    // AYUSH Pariksha scoring if AYUSH OPD
    let computedAyush = null
    if (body.opdType === 'ayush') {
      const prakriti = calculatePrakriti(body.ayushAnswers || {})
      const { agni, koshtha } = evaluateAgniAndKoshtha(body.ayushAnswers || {})
      computedAyush = {
        prakriti,
        agni,
        koshtha,
        rawAnswers: body.ayushAnswers || {}
      }
    }

    // AI Clinical Case Sheet generation
    const aiSummary = await generateClinicalSummary({
      ...body,
      ayushComputed: computedAyush
    })

    // If red flags found, mark triage urgency
    if (detectedRedFlags.length > 0) {
      aiSummary.triageTag = 'urgent_attention'
      AuditRepository.record('red_flag_triggered', {
        patient: body.patientName,
        complaint: body.chiefComplaint,
        flags: detectedRedFlags
      })
    }

    // Persist to repository
    const saved = QueueRepository.create({
      ...body,
      ayushData: computedAyush || body.ayushData,
      aiSummary,
      redFlags: detectedRedFlags
    })

    res.status(201).json({
      success: true,
      token: saved.token,
      id: saved.id,
      data: saved
    })
  } catch (err) {
    console.error('[API] Error submitting intake:', err)
    res.status(500).json({ success: false, error: 'Clinical intake processing error' })
  }
})

// ─── 5. Red-Flag Pre-Check Endpoint ───────────────────────────────────────────
app.post('/api/red-flags/check', (req, res) => {
  try {
    const { complaint, symptoms, answers } = req.body
    const flags = evaluateRedFlags(complaint, symptoms, answers)
    res.json({ success: true, isUrgent: flags.some(f => f.severity === 'urgent'), flags })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ─── 6. Dynamic Symptom Questions (Modular with "I don't know") ───────────────
app.post('/api/ai/dynamic-questions', (req, res) => {
  try {
    const { complaint, opdType } = req.body
    const questions = getDynamicQuestions(complaint, opdType)
    res.json({ success: true, questions })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ─── 7. Gemini Vision OCR — Prescription Extraction ───────────────────────────
app.post(
  '/api/ocr/extract',
  (req, res, next) => {
    upload.single('document')(req, res, (err) => {
      if (err) {
        console.warn('[OCR] File upload error:', err.message)
        return res.status(400).json({ success: false, error: err.message || 'File upload failed' })
      }
      next()
    })
  },
  ocrRateLimiter,
  async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY

      // No file uploaded
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No document file provided. Please attach a prescription image.' })
      }

      // No API key → return informative fallback
      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        return res.status(200).json({
          success: false,
          offline: true,
          message: 'GEMINI_API_KEY not configured. Please add your key to server/.env.',
          medications: []
        })
      }

      // Convert uploaded file buffer to base64 for Gemini Vision
      const base64Image = req.file.buffer.toString('base64')
      let mimeType = req.file.mimetype || 'image/jpeg'
      if (mimeType === 'application/octet-stream') {
        if (req.file.originalname?.endsWith('.pdf')) mimeType = 'application/pdf'
        else mimeType = 'image/jpeg'
      }

      // Enhanced clinical OCR prompt
      const ocrPrompt = `You are an expert clinical medical AI assistant digitizing prescriptions and health documents for an Indian hospital kiosk (under Ministry of Ayush / Ayushman Bharat Digital Mission ABDM guidelines).

Carefully examine this document image (which may be a handwritten doctor prescription, Ayurvedic vaidya note, printed hospital slip, discharge summary, pharmacy bill, or medication packaging).

Extract ALL medications mentioned. This includes:
- Allopathic medicines (e.g. Paracetamol, Metformin, Amlodipine, Telmisartan, Pantoprazole, Azithromycin)
- AYUSH / Ayurvedic formulations (e.g. Ashwagandha Churna, Triphala, Yograj Guggulu, Dashamularishta, Sitopaladi, Mahasudarshan, Giloy/Guduchi, Shankhapushpi)
- Siddha, Unani, or Homeopathic medicines
- Any visible dosages (e.g. 500 mg, 5 ml, 2 tablets, 1 spoon)
- Any visible frequency (e.g. Once daily, Twice daily, TDS, BD, OD, HS, SOS, 1-0-1, before meals, after meals)
- Duration (e.g. 5 days, 1 month, or null)

Also extract:
- Doctor / Vaidya name and qualifications if visible
- Hospital / Clinic name if visible
- Prescription / document date if visible
- Patient name if visible
- Any allergy alerts or special instructions

Return a valid JSON object matching this schema:
{
  "success": true,
  "doctorName": "string or null",
  "clinicName": "string or null",
  "prescriptionDate": "string or null",
  "patientName": "string or null",
  "medications": [
    {
      "name": "Generic or brand name of medication/herb",
      "dosage": "dosage with unit (e.g. 500 mg, 1 tab, 10 ml) or 'As directed'",
      "frequency": "clear frequency (e.g. Twice daily after meals, 1-0-1) or 'Daily'",
      "duration": "e.g. 15 days or null",
      "confidence": 95
    }
  ],
  "additionalInstructions": "string or null",
  "warnings": ["any allergy or precautionary warnings found"]
}

If no medicines are mentioned at all, return:
{
  "success": true,
  "doctorName": null,
  "clinicName": null,
  "prescriptionDate": null,
  "patientName": null,
  "medications": [],
  "additionalInstructions": "No medications clearly identifiable on this document",
  "warnings": []
}`

      // Model pool with automatic fallback across models to protect against single-model free-tier rate limits
      const GEMINI_MODELS = ['gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.6-flash']
      let rawText = ''
      let lastErrText = ''
      let modelUsed = ''

      for (const model of GEMINI_MODELS) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    { text: ocrPrompt },
                    { inlineData: { mimeType, data: base64Image } }
                  ]
                }],
                generationConfig: {
                  responseMimeType: 'application/json',
                  temperature: 0.1,
                  maxOutputTokens: 2048
                }
              })
            }
          )

          if (geminiRes.ok) {
            const geminiJson = await geminiRes.json()
            rawText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
            modelUsed = model
            console.log(`[OCR] Successfully extracted prescription using model: ${model}`)
            break
          } else {
            lastErrText = await geminiRes.text()
            console.warn(`[OCR] Model ${model} returned HTTP ${geminiRes.status}. Trying next available model in pool...`)
          }
        } catch (netErr) {
          lastErrText = netErr.message
          console.warn(`[OCR] Model ${model} network error:`, netErr.message)
        }
      }

      if (!rawText) {
        console.error('[OCR] All Gemini models in pool were exhausted or unavailable:', lastErrText)
        return res.status(200).json({
          success: false,
          offline: true,
          error: 'Gemini AI services busy. Please verify prescription manually.',
          message: 'Could not connect to Gemini Vision service. Please add medications manually.',
          medications: []
        })
      }

      let ocrResult
      try {
        ocrResult = JSON.parse(rawText)
      } catch (parseErr) {
        console.warn('[OCR] JSON parse fallback on raw text:', parseErr)
        const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim()
        ocrResult = JSON.parse(cleaned)
      }

      // Audit log the OCR extraction
      AuditRepository.record('ocr_extracted', 'patient_kiosk', 'patient_kiosk', null,
        `${ocrResult.medications?.length || 0} medicines extracted via Gemini Vision`)

      // Add source metadata to each medication
      if (ocrResult.medications && Array.isArray(ocrResult.medications)) {
        ocrResult.medications = ocrResult.medications.map(m => ({
          ...m,
          source: 'ocr_prescription',
          confidence: m.confidence || 95,
          verified: false // Physician must verify
        }))
      } else {
        ocrResult.medications = []
      }

      res.json({ success: true, ...ocrResult })
    } catch (err) {
      console.error('[OCR] Fatal error:', err)
      res.status(200).json({
        success: false,
        offline: true,
        error: err.message,
        message: 'OCR extraction encountered an error. You can add medicines manually on the next screen.',
        medications: []
      })
    }
  }
)

// ─── 7b. Serve Demo Sample Prescription for Easy Kiosk Testing ───────────────
app.get('/api/ocr/sample', (_req, res) => {
  const samplePath = path.join(__dirname, 'data', 'sample_prescription.jpg')
  if (fs.existsSync(samplePath)) {
    res.setHeader('Content-Type', 'image/jpeg')
    return res.sendFile(samplePath)
  }
  res.status(404).json({ success: false, error: 'Sample prescription not found' })
})

// ─── 7. Queue Status & Physician Confirmations ───────────────────────────────
app.patch('/api/queue/:id/status', (req, res) => {
  try {
    const { status, notes } = req.body
    const updated = QueueRepository.updateStatus(req.params.id, status, notes)
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Patient case not found' })
    }
    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ─── 8. Physician Acknowledge Red-Flag ─────────────────────────────────────────
app.post('/api/queue/:id/red-flag/acknowledge', (req, res) => {
  try {
    const { flagId, doctorName, dismissReason } = req.body
    const updated = RedFlagRepository.acknowledge(req.params.id, flagId, doctorName, dismissReason)
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Case or flag not found' })
    }
    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ─── 9. Audit Logging ────────────────────────────────────────────────────────
app.post('/api/audit', (req, res) => {
  try {
    const { action, details, userId } = req.body
    const event = AuditRepository.record(action, details, userId)
    res.json({ success: true, event })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.get('/api/audit', (req, res) => {
  try {
    const logs = AuditRepository.findAll()
    res.json({ success: true, count: logs.length, data: logs })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ─── 10. Demo Authentication Endpoint ─────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { pin, role } = req.body
  if (pin === '1234' || pin === '9999' || !pin) {
    const names = {
      physician: 'Dr. Anjali Rao (BAMS, MD)',
      nurse: 'Staff Nurse Sunita M.',
      admin: 'Central Records Officer'
    }
    AuditRepository.record('physician_login', { role, user: names[role] || 'Staff' })
    return res.json({
      success: true,
      token: `demo-jwt-${Date.now()}`,
      user: {
        id: `usr-${Date.now()}`,
        name: names[role] || 'Staff Member',
        role: role || 'physician',
        department: 'Ayurveda & Integrative Medicine'
      }
    })
  }

  res.status(401).json({ success: false, error: 'Invalid staff authentication PIN' })
})

// ─── 11. Demo Reset Endpoint (Smart India Hackathon Presentation) ─────────────
app.post('/api/demo/reset', (req, res) => {
  try {
    const queue = QueueRepository.resetDemoData()
    res.json({
      success: true,
      message: 'Demo queue reseeded to standard SIH clinical cases successfully',
      count: queue.length,
      data: queue
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`[MediKiosk Backend] Running on http://localhost:${PORT}`)
  console.log(`[MediKiosk Backend] SIH PSID 26047 - Ministry of Ayush OPD Gateway active`)
})
