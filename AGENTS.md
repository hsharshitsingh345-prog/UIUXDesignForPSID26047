# ArogyaKiosk — SIH PSID 26047

Multilingual OPD Patient Case-Taking & Clinical Documentation Kiosk for the Ministry of Ayush.
Smart India Hackathon Problem Statement ID 26047.

## Architecture

- **Frontend**: React 19, TypeScript 5.7, Tailwind CSS v4, Vite 8 (Port 5173).
- **Backend**: Express 4, Google Gemini Vision OCR fallback pool, Lowdb/JSON atomic persistence, Red-flag safety engine (Port 5000).

## Project Structure

- `src/main.tsx` — React entrypoint
- `src/App.tsx` — Main kiosk orchestrator and screen router
- `src/screens/ayush/` — AYUSH Prakriti assessment and Physician case sheet
- `src/screens/kiosk/` — Vitals, Pathway selection, and Gemini OCR verification
- `src/components/` — Modals (Help, Inactivity timeout, Physician auth, Source trace) and VoiceInput
- `src/services/api.ts` — Typed client API layer connecting to backend
- `src/types/index.ts` — Canonical clinical data contracts
- `src/utils/i18n.ts` — Multilingual strings (English, Hindi) & Web Speech synthesis
- `server/index.js` — Express REST API with OCR extraction & queue persistence
- `server/aiEngine.js` — Prakriti calculation, Agni/Koshtha scoring, & Gemini clinical summary
- `server/db.js` — Queue repository & audit event repository
- `server/data/` — Persistent JSON database (`db.json`) and demo prescription

## Key Commands

- `npm run dev` — Start Vite dev server on port 5173
- `npm run build` — Build production bundle to `dist/`
- `npm run check` — Run TypeScript type checking (`tsc --noEmit`)
- `node server/index.js` — Start Express backend on port 5000
