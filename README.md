# 🏥 MediKiosk(चिकित्सा कियोस्क)
### Smart OPD Patient Case-Taking & AYUSH Clinical Documentation System
> **Smart India Hackathon (SIH) · Problem Statement ID: 26047**  
> **Ministry of Ayush · Government of India**

---

[![SIH 2026](https://img.shields.io/badge/SIH%202026-PSID%2026047-blue?style=for-the-badge)](https://www.sih.gov.in/)
[![Ministry of Ayush](https://img.shields.io/badge/Ministry%20of-Ayush-087F8C?style=for-the-badge)](https://ayush.gov.in/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini Vision](https://img.shields.io/badge/Google_Gemini-Vision_OCR-EA4335?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Node.js / Express](https://img.shields.io/badge/Express-Backend_API-green?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

---

## 📌 Executive Summary

Government hospital Outpatient Departments (OPDs) across India witness heavy patient footfall daily. Physicians often spend up to 70% of consultation time transcribing chief complaints, deciphering prior paper prescriptions, and documenting basic health metrics. In AYUSH facilities, constitutional assessment (*Prakriti, Agni, Koshtha*) requires detailed questioning that is difficult to conduct comprehensively during rushed consultations.

**ArogyaKiosk** is a patient-facing, multilingual digital health kiosk that automates pre-consultation clinical intake, extracts medication history from paper prescriptions via **Google Gemini Vision OCR**, calculates AYUSH constitutional metrics in real time, screens for acute emergency red flags, and synchronizes seamlessly with the attending physician's clinical case sheet.

---

## ✨ Core Clinical Capabilities

### 1. Dual-Pathway OPD Intake
- **AYUSH Constitutional Assessment**: Dynamic questioning for *Prakriti* (Vata, Pitta, Kapha distribution), *Agni* (digestive fire), and *Koshtha* (bowel habit) with live percentage calculations.
- **Allopathic & Emergency Triage**: Focused chief complaint capture, severity scale, symptom duration, and organ-system scoping.

### 2. Google Gemini Vision OCR Pipeline
- Digitizes handwritten doctor prescriptions, paper slips, and packaging photos directly at the kiosk.
- Extracts structured medicine names, dosages, frequencies (OD, BD, TDS, HS, SOS), and durations.
- **Multi-Model Fallback Pool**: Automatically falls back across `gemini-3.5-flash`, `gemini-3.7-flash`, `gemini-3.5-flash-lite`, and `gemini-3.8-flash` to safeguard uninterrupted uptime against single-model quota exhaustion.
- One-click sample doctor prescription trigger built-in for instant offline demonstration.

### 3. Safety First: Clinical Red-Flag Escalation
- Real-time screening engine for life-threatening symptoms (acute chest pain radiating to arm, cold diaphoresis, hematemesis, sudden respiratory distress, neurological FAST stroke signs).
- Triggers high-priority alerts with automated triage tag escalation (`urgent_attention`).
- Requires mandatory physician acknowledgment and logging.

### 4. ABHA & Digital Health Integration
- Interactive ABHA (Ayushman Bharat Health Account) simulation: QR code scanning, 14-digit ABHA validation, and demo profile loading.
- Generates downloadable/viewable digital ABHA cards.

### 5. Physician Case Sheet & OPD Queue Management
- Real-time waiting queue with live triage tags (`routine`, `urgent_attention`).
- Comprehensive physician case sheet presenting chief complaint, extracted prescriptions, vitals, and Prakriti radar visualization.
- Instant consultation status updates (`waiting` → `in-consultation` → `completed`) and persistent doctor clinical notes.

### 6. Accessibility & Human-Centered Design
- **Bilingual Support**: Instant switching between English and Hindi.
- **Voice-Guided Interaction**: Speech synthesis (`Web Speech API`) and speech-to-text voice input.
- **Privacy Guardian**: 60-second inactivity timer that protects confidential health data in high-traffic hospital waiting areas.
- **Emergency Help Modal**: Easy access to kiosk attendant summoning and audio repetition.

---

## 🏗️ Architecture & Data Flow

```
┌────────────────────────────────────────────────────────┐
│               ArogyaKiosk Front-End                    │
│      React 19 + TypeScript + Tailwind CSS v4 (Vite)    │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (Port 5000)
                            ▼
┌────────────────────────────────────────────────────────┐
│               Express.js REST Gateway                  │
│  - Red-Flag Screening Engine                           │
│  - AYUSH Prakriti / Agni / Koshtha Calculator          │
│  - Lowdb Atomic JSON Persistence (server/data/db.json) │
└───────────────────────────┬────────────────────────────┘
                            │ Multipart / Base64
                            ▼
┌────────────────────────────────────────────────────────┐
│               Google Gemini Vision API                 │
│      Multi-Model Fallback Pool (3.5 / 3.7 / Lite)      │
│      Handwritten Prescription Extraction Engine        │
└────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
UIUXDesignForPSID26047/
├── index.html                   # Clean, semantic HTML shell with Google Fonts
├── package.json                 # Frontend dependencies & npm run scripts
├── tsconfig.json                # TypeScript strict configuration
├── vite.config.ts               # Optimized Vite 8 configuration with React & Tailwind
├── README.md                    # Project documentation
│
├── src/                         # Frontend Application Source Code
│   ├── main.tsx                 # React entrypoint
│   ├── App.tsx                  # Kiosk orchestrator & screen router
│   ├── index.css                # Global Tailwind CSS styles
│   ├── types/
│   │   └── index.ts             # Canonical clinical & data interfaces
│   ├── services/
│   │   └── api.ts               # Typed client REST API service
│   ├── utils/
│   │   └── i18n.ts              # Multilingual strings & speech synthesis
│   ├── screens/
│   │   ├── ayush/
│   │   │   ├── AyushIntakeFlow.tsx   # Prakriti question questionnaire
│   │   │   └── AyushCaseSheet.tsx    # Doctor clinical sheet view
│   │   └── kiosk/
│   │       ├── OCRVerifyScreen.tsx   # Prescription review screen
│   │       ├── PathwayScreen.tsx     # AYUSH vs. Allopathy selection
│   │       └── VitalsScreen.tsx      # Blood pressure, pulse, SpO2 capture
│   └── components/
│       ├── clinical/
│       │   └── SourceTraceModal.tsx  # Provenance & audit modal
│       ├── common/
│       │   ├── DemoBanner.tsx        # SIH presentation banner
│       │   ├── HelpModal.tsx         # Attendant buzzer & audio controls
│       │   └── SessionTimeoutModal.tsx # Inactivity privacy guardian
│       ├── security/
│       │   └── PhysicianAuthModal.tsx # PIN login modal for doctors
│       └── voice/
│           └── VoiceInput.tsx        # Speech-to-text mic input component
│
└── server/                      # Backend API Source Code
    ├── index.js                 # Express server with OCR & queue endpoints
    ├── aiEngine.js              # AYUSH calculators & clinical summary logic
    ├── db.js                    # Atomic JSON persistence repository
    ├── package.json             # Server dependencies (Express, Multer, Lowdb)
    ├── .env.example             # Template for environment variables
    └── data/
        ├── db.json              # Persistent clinical queue database
        └── sample_prescription.jpg # Real sample prescription for testing
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or later ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or later

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/hsharshitsingh345-prog/UIUXDesignForPSID26047.git
cd UIUXDesignForPSID26047
```

---

### Step 2: Install Dependencies

**Install Frontend Dependencies:**
```bash
npm install
```

**Install Backend Dependencies:**
```bash
cd server
npm install
cd ..
```

---

### Step 3: Configure Environment Variables

1. Navigate to the `server/` directory.
2. Copy the template file:
   ```bash
   cp server/.env.example server/.env
   ```
3. Open `server/.env` and insert your **Google Gemini API Key**:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
   *(Get your free API key at [Google AI Studio](https://aistudio.google.com/app/apikey))*

---

### Step 4: Run the Application

#### Start the Backend Server (Port 5000)
```bash
node server/index.js
```
*Console output should confirm:*
```
[MediKiosk Backend] Running on http://localhost:5000
[MediKiosk Backend] SIH PSID 26047 - Ministry of Ayush OPD Gateway active
```

#### Start the Frontend Application (Port 5173)
In a new terminal window:
```bash
npm run dev
```

Open your browser and navigate to: **`http://localhost:5173`**

---

## 🧪 Verification & Quality Checks

Run the following commands in the project root to ensure clean builds and zero type errors:

```bash
# Type check the entire codebase
npm run check

# Build the production bundle
npm run build
```

---

## 📡 Key REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health, Gemini key status, and active features |
| `GET` | `/api/queue` | Live OPD patient queue with triage urgency flags |
| `GET` | `/api/patient/:id` | Detailed case record with clinical summaries |
| `POST` | `/api/intake` | Submit patient intake from kiosk |
| `POST` | `/api/ocr/extract` | Upload document file for Gemini Vision OCR extraction |
| `GET` | `/api/ocr/sample` | Serves real doctor prescription image for instant demo testing |
| `PATCH`| `/api/queue/:id/status`| Update case status and synchronize physician consultation notes |
| `POST` | `/api/demo/reset` | Reseeds queue with standard SIH test clinical cases |

---

## 🎯 Smart India Hackathon Demo Flow (3-Minute Walkthrough)

1. **Welcome Screen**: Select **English** or **हिंदी**, listen to audio greeting.
2. **ABHA Identification**: Click *"Simulate ABHA Scan"* to auto-populate patient profile (Sunita Devi, 42F).
3. **Select OPD Pathway**: Choose **AYUSH OPD**.
4. **Chief Complaint**: Enter joint pain or speak into the microphone.
5. **AYUSH Pariksha**: Complete constitutional assessment questions; observe real-time Prakriti score updates.
6. **Prescription OCR**: Click *"Use Sample Doctor Prescription"* on the upload screen; watch Google Gemini Vision extract medicines (*Ashwagandha Churna, Yograj Guggulu, etc.*).
7. **Confirmation**: Review summary and receive digital token number (`#126`).
8. **Physician Portal**: Click the header badge to open the Physician Dashboard; view the generated case sheet, review OCR source provenance, and enter doctor notes.

---

## 👨‍💻 Team & Acknowledgments

- **Developed for**: Smart India Hackathon 2026
- **Problem Statement ID**: 26047
- **Authority**: Ministry of Ayush, Government of India
- **Repository**: [https://github.com/hsharshitsingh345-prog/UIUXDesignForPSID26047](https://github.com/hsharshitsingh345-prog/UIUXDesignForPSID26047)
