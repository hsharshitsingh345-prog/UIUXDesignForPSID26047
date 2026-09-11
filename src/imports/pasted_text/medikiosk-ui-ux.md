MediKiosk — Frontend UI/UX Design
1. Design Philosophy

The interface should follow these principles:

One task per screen — avoid overwhelming patients with forms.
Voice first, touch always available — patients can speak or tap.
Large, visual controls — suitable for elderly and low-literacy users.
Minimal typing — use speech, icons, chips, and predefined options.
Local-language first — language selection happens immediately.
Progress visibility — show patients how much of the intake is completed.
Clinical information stays hidden from other patients — privacy-aware screen design.
Human escalation always available — “Need Help?” should be accessible throughout.
No medical jargon in patient-facing screens.
Calm visual language — healthcare-oriented without looking intimidating.
2. Main Patient Flow
WELCOME
   ↓
SELECT LANGUAGE
   ↓
CONSENT & PRIVACY
   ↓
IDENTIFICATION
   ↓
BASIC DETAILS
   ↓
CHIEF COMPLAINT
   ↓
AI CONVERSATION
   ↓
SYMPTOM-SPECIFIC QUESTIONS
   ↓
MEDICAL HISTORY
   ↓
DOCUMENT SCANNING
   ↓
REVIEW
   ↓
AI SUMMARY
   ↓
SUBMIT & ROUTE
   ↓
"YOUR DOCTOR HAS YOUR INFORMATION"

For AYUSH:

Chief Complaint
      ↓
Ayurvedic History
      ↓
Prakriti / Vikriti
      ↓
Agni / Koshtha
      ↓
Ahara-Vihara
      ↓
Dashavidha Pariksha
3. Screen-by-Screen UI
Screen 01 — Welcome

The first screen should be extremely simple.

UI

Logo

MediKiosk
Your health history, ready for your doctor.

Large central button:

🎙️ Start My Health History

Secondary:

🔄 Change Language

Bottom:

Need help? Ask a staff member

Design
Very large typography
High contrast
Large touch targets
No menus
No unnecessary illustrations
Optional animated microphone showing that the kiosk is ready
4. Language Selection
“Which language would you like to use?”

Display language cards rather than a dropdown.

┌──────────────┐  ┌──────────────┐
│     हिन्दी    │  │   English    │
│     हिंदी     │  │              │
└──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐
│    বাংলা      │  │    தமிழ்     │
└──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐
│   తెలుగు      │  │   ಕನ್ನಡ      │
└──────────────┘  └──────────────┘

Use language + native script, not just English names.

After selection:

“You can speak normally. I will ask you a few questions.”

5. Consent Screen

This is particularly important for the product.

Header

Before we begin

Three simple cards:

🔒 Your information is private

🎙️ We will record your health information

📄 You can share your previous medical documents

Then:

▶ Listen to this information

Large buttons:

I Agree & Continue

I Don't Agree

The consent explanation should be available through audio in the selected language.

Avoid presenting a wall of legal text to the patient.

6. Identification Screen
Header

Let's find your health record

Options:

┌─────────────────────────────┐
│     Scan ABHA QR Code       │
└─────────────────────────────┘

┌─────────────────────────────┐
│     Enter ABHA Number       │
└─────────────────────────────┘

┌─────────────────────────────┐
│     New Patient             │
└─────────────────────────────┘

If the hospital supports appropriate identity/registration alternatives, they can be presented here without confusing them with ABHA itself.

7. Patient Profile

Don't create a conventional 15-field registration form.

Instead:

“Let's confirm a few details”
Name
[ Ramesh Kumar              ]

Age
[ 56 ]

Sex
[ Male ▼ ]

Phone
[ ********21 ]

         ✓ Looks correct

             Continue →

Use large controls and automatically populate information wherever the hospital's approved identity flow permits.

8. Chief Complaint Screen

This should be one of the most important UX moments.

Header

What brings you to the hospital today?

Large microphone:

          🎙️
     Tap and speak

"I'm having pain in my chest
 since yesterday."

Below:

Or choose an option

🤕 Pain
🌡️ Fever
😮‍💨 Breathing problem
🤢 Stomach problem
🤧 Cold / cough
🩸 Bleeding
😵 Dizziness
🧠 Other

The patient doesn't need to know the medical terminology.

9. Conversational AI Screen

This should feel more like a guided conversation than a chatbot.

Layout
┌─────────────────────────────────────────┐
│  MediKiosk                    42% ●     │
├─────────────────────────────────────────┤
│                                         │
│     👩‍⚕️                                 │
│     I want to understand your chest     │
│     pain better.                        │
│                                         │
│     When did the pain start?             │
│                                         │
│                                         │
│              🎙️                         │
│          Tap to speak                    │
│                                         │
│     ┌──────────┐ ┌──────────┐            │
│     │ Today    │ │ Yesterday│            │
│     └──────────┘ └──────────┘            │
│                                         │
│  🔊 Hear question again     Need help?  │
└─────────────────────────────────────────┘
Key UX feature

Every question should support three interaction methods:

Speak
Tap an answer
Hear the question again

This is much more inclusive than a conventional chatbot.

10. Dynamic Questioning

The UI should change according to the patient's answer.

For example:

“I have stomach pain.”

MediKiosk asks:

Where does it hurt?

        👤
   ┌────────────┐
   │     HEAD   │
   │            │
   │ LEFT RIGHT │
   │            │
   │   STOMACH  │
   └────────────┘

Patient taps the location.

Next:

How would you describe the pain?

Sharp       Burning
Dull        Cramping
Heavy       Other

Then:

When did it start?

Today
Yesterday
A few days ago
More than a week ago
I don't remember

This makes complex medical history feel simple.

11. Progress Indicator

Don't use:

Question 17 of 84

That can discourage users.

Instead:

Your health history

●━━━━━━━━━━━━━━○

Symptoms ✓
Medical history
Medicines
Allergies
Previous records
Review

Use encouraging language:

“You're doing great — almost finished.”

12. Medication Screen
“Do you currently take any medicines?”
┌────────────────────────────┐
│       💊                   │
│ Yes, I take medicines      │
└────────────────────────────┘

┌────────────────────────────┐
│       ✓                    │
│ No medicines               │
└────────────────────────────┘

┌────────────────────────────┐
│       ?                    │
│ I'm not sure               │
└────────────────────────────┘

If yes:

“You can show me your medicine strip or prescription.”

Then camera/scanner interface.

13. Allergy Screen

Use very clear visual hierarchy.

“Are you allergic to any medicine or food?”
🟢 No known allergies

🔴 Yes, I have an allergy

🟡 I'm not sure

If yes:

“Tell me the name, or show me the medicine/package.”

14. Document Scanning UX

This can become one of MediKiosk's strongest differentiators.

Document Center
“Do you have previous medical documents?”
📄 Prescription

🧪 Lab Report

🏥 Discharge Summary

🩻 Scan / Imaging Report

💊 Medicine List

📋 Other

Then:

Scan screen
        ┌───────────────────┐
        │                   │
        │    DOCUMENT       │
        │    ALIGN HERE     │
        │                   │
        └───────────────────┘

        📷 Scanning...

     Keep the document flat

After scanning:

Document captured ✓

Buttons:

Scan another

I'm finished

15. OCR Verification

This is important for clinical safety.

Don't simply show:

“Prescription successfully processed.”

Instead:

“We found these medicines”
Medicine              Dose

Metformin             500 mg
Amlodipine             5 mg
Atorvastatin           10 mg

With:

“Please check if this looks correct.”

And:

Looks correct ✓

Something is wrong ✎

The original document should remain accessible alongside extracted information.

16. Medical Timeline

A very strong physician-facing UX feature:

MEDICAL HISTORY

2026
│
├── Aug 12
│   Blood test
│   HbA1c: 8.2% ⚠
│
├── Jul 03
│   Prescription
│   Metformin 500 mg
│
├── Mar 18
│   Hospital discharge
│   Diagnosis: ...
│
2025
│
└── Nov 21
    Previous consultation

This converts a pile of paper into a chronological clinical story.

17. AYUSH Mode

Don't simply add AYUSH fields into the allopathic interface.

Create a clearly differentiated AYUSH clinical intake pathway.

Example

“Now I will ask about your daily habits and body characteristics.”

Then visual cards:

🌿 Prakriti

🔥 Agni

🌀 Koshtha

🍚 Ahara

🧘 Vihara

⚖️ Vikriti

For Dashavidha Pariksha, use guided visual questions rather than displaying Sanskrit terminology alone.

For example:

“How is your appetite usually?”

Very low
   ↓
Low
   ↓
Normal
   ↓
Strong
   ↓
Very strong

The underlying system can map the response to the appropriate structured AYUSH field.

18. Red-Flag Screen

This needs a completely different visual state.

If the system detects a potentially urgent symptom, don't continue the normal questionnaire.

Screen

🔴 Please wait — a healthcare staff member is coming

Based on what you told us, you may need immediate medical attention.

Do not leave this area.

A staff alert is simultaneously generated.

Importantly, the patient should not be shown a definitive diagnosis such as “You are having a heart attack.”

19. Review Screen

Before submission:

“Let's check your information”

Sections:

Main problem
Chest pain — started yesterday

Other symptoms
Breathlessness, fatigue

Medical history
Diabetes

Medicines
3 medicines recorded

Allergies
No known allergies

Previous records
5 documents uploaded

Each section:

Edit ✎

At the bottom:

“Your doctor will review this information.”

Submit My History →

20. Physician Dashboard

The physician interface should be completely different from the patient UI.

Think:

Epic-style clinical dashboard + concise AI briefing.

Top
Ramesh Kumar | 56 M
Token #124
Cardiology OPD

⚠ 2 items requiring attention
AI-generated summary
CHIEF COMPLAINT
Chest pain × 1 day

HPI
Central chest pain beginning yesterday evening.
Patient describes pain as pressure-like...

Then:

PAST HISTORY
✓ Diabetes
✓ Hypertension
✗ No known CKD

MEDICATIONS
Metformin 500 mg
Amlodipine 5 mg
Atorvastatin 10 mg

ALLERGIES
No known drug allergies

INVESTIGATIONS
HbA1c: 8.2% ⚠
Creatinine: 1.1 mg/dL

DOCUMENTS
5 documents available
[View Timeline]
21. Source Traceability

One of the most important UI features for an AI healthcare product:

Every AI-generated statement should be traceable.

For example:

History of diabetes — 8 years

Clicking the information could show:

SOURCE

Patient response:
"I was diagnosed with diabetes
around 8 years ago."

Source: Conversational History
Confidence: High

For extracted information:

Source: Prescription
Date: 12 Aug 2026
[View Original Document]

This builds physician trust.

22. Physician AI Controls

Never make the physician feel that the AI has taken control.

Use:

✓ Confirm Summary

✎ Edit

↻ Regenerate

⚠ Report Error

□ Save to Patient Record

And clearly label:

AI-generated draft — physician verification required

23. Design System
Colors

I'd recommend a restrained healthcare palette:

Primary: Deep Teal #087F8C
Secondary: Blue #2563EB
Background: #F7FAFC
Success: #16A34A
Warning: #F59E0B
Critical: #DC2626
Text: #172033

Avoid excessive blue gradients and “AI neon” aesthetics.

Typography

For patient UI:

Heading: 32–40 px
Question: 28–32 px
Button: 24–28 px
Supporting text: 20–24 px

For physician UI:

Heading: 24–28 px
Body: 16–18 px
Dense clinical data: 14–16 px

For Indian-language support, use fonts with strong Indic-script coverage such as Noto Sans family or an equivalent UI font system.

24. Component Library

Your Figma/design system should have reusable components for:

Language card
Primary CTA
Secondary CTA
Voice input button
Audio playback control
Answer chips
Icon-based answer cards
Body-map selector
Yes/No/Unsure cards
Progress indicator
Document scanner
OCR result card
Timeline event
AI summary card
Warning/red-flag banner
Consent card
Patient profile card
Physician summary panel
Source/provenance popup
Edit/confirm controls
Help button
Session timeout dialog
25. Figma Screen Structure

I'd organize the Figma file like this:

01 — Design System
    ├── Colors
    ├── Typography
    ├── Icons
    ├── Buttons
    └── Components

02 — Patient Flow
    ├── Welcome
    ├── Language
    ├── Consent
    ├── Identification
    ├── Profile
    ├── Chief Complaint
    ├── AI Interview
    ├── Medical History
    ├── Medication
    ├── Allergy
    ├── Document Scan
    ├── OCR Verification
    ├── Review
    └── Completion

03 — AYUSH Flow
    ├── AYUSH Introduction
    ├── Prakriti
    ├── Vikriti
    ├── Agni
    ├── Koshtha
    ├── Ahara
    ├── Vihara
    └── Dashavidha Pariksha

04 — Physician Portal
    ├── OPD Queue
    ├── Patient Overview
    ├── AI Summary
    ├── Medical Timeline
    ├── Documents
    ├── Investigation Results
    └── Review / Confirm

05 — Exceptional States
    ├── Red Flag
    ├── OCR Failure
    ├── Voice Not Recognized
    ├── Network Failure
    ├── Session Timeout
    ├── Staff Assistance
    └── System Error
The key UX idea

The product shouldn't feel like “filling out a medical form.”

It should feel like:

“A friendly health assistant is asking me a few simple questions, listening to my answers, organizing my old medical papers, and preparing everything for my doctor.”

That distinction is especially important for MediKiosk's target users—elderly, low-literacy, first-time, multilingual OPD patients. The complexity should live inside the AI and clinical data layer, not in the patient's interface