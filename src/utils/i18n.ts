import { LanguageCode } from '../types'

export const STRINGS: Record<string, Record<string, string>> = {
  en: {
    appName: 'MediKiosk',
    appSub: 'Multilingual OPD Patient Intake & Clinical Documentation Kiosk',
    sihBadge: 'SIH PSID 26047 · Ministry of Ayush',
    startIntake: 'Start My Health Intake',
    changeLanguage: 'भाषा बदलें / Change Language',
    needHelp: 'Need Help?',
    helpTitle: 'How can we assist you?',
    repeatQuestion: 'Hear this question again',
    speakSlowly: 'Speak more slowly',
    callStaff: 'Call kiosk assistant to this booth',
    goBack: 'Go back one step',
    close: 'Close',
    beforeWeBegin: 'Before We Begin — Privacy & Consent',
    consentPrivate: 'Your information is confidential and visible only to your consulting physician.',
    consentPurpose: 'This kiosk structures your medical history so your doctor can spend more time examining and caring for you.',
    consentRecords: 'You may share previous paper prescriptions or discharge summaries to build your timeline.',
    listenAudio: '🔊 Listen to this information',
    agreeContinue: 'I Agree & Continue →',
    declineConsent: 'I prefer to speak with a human receptionist',
    idTitle: 'How would you like to identify yourself?',
    idSub: 'Choose your preferred health identification method.',
    abhaScan: 'ABHA ID / QR',
    phoneOption: 'Phone Number',
    newPatient: 'First-time Patient',
    confirmDetails: "Let's confirm a few basic details",
    fullName: 'Full Name',
    age: 'Age',
    gender: 'Gender',
    phone: 'Phone Number',
    clinicChoice: 'Which clinic are you visiting today?',
    ayushOpd: 'AYUSH OPD',
    ayushSub: 'Ayurveda · Yoga · Unani · Siddha · Homeopathy',
    ayushDesc: 'Holistic constitutional intake: Prakriti, Agni (digestion), Koshtha (bowel), and dietary lifestyle assessment.',
    allopathyOpd: 'General Medicine / Cardiology OPD',
    allopathySub: 'Modern Medicine · Cardiology · Orthopedics',
    allopathyDesc: 'Standard clinical triage focusing on acute symptoms, current pharmaceutical prescriptions, and vitals.',
    complaintTitle: 'What brings you to the hospital today?',
    voicePrimary: 'Tap the microphone and speak normally',
    listening: 'Listening... please speak your symptom',
    iHeard: 'I heard:',
    correctBtn: '✓ Correct',
    tryAgainBtn: '↻ Try Again',
    orChoose: 'Or choose a primary concern',
    dontKnow: "I don't know / Not sure",
    medicinesTitle: 'Do you currently take any medicines?',
    yes: 'Yes',
    no: 'No',
    allergiesTitle: 'Are you allergic to any medicine or food?',
    noKnownAllergies: 'No known drug or food allergies (NKDA)',
    hasAllergy: 'Yes, I have an allergy',
    documentsTitle: 'Do you have previous medical documents?',
    scanDoc: 'Place document on scanner',
    verifyOcr: 'Verify Extracted Medicines (OCR)',
    reviewTitle: "Let's check your information",
    reviewConfirmNotice: 'I have reviewed this information and confirm it is ready for my doctor.',
    submitHistory: 'Submit My Health Intake →',
    tokenTitle: 'Your health history is ready for your doctor!',
    tokenSub: 'Your information has been sent to the clinical queue. Please take a seat in the waiting area.',
    yourToken: 'Your OPD Token',
    redFlagAlert: 'Please wait — a healthcare staff member is coming to assist you',
    redFlagSub: 'Based on what you told us, you may need immediate clinical attention. Please do not leave this kiosk area.',
    demoNotice: 'DEMO DATA — Smart India Hackathon Prototype · AI Assists, Physician Verifies',
    vitalsTitle: 'Record Vital Signs (Optional)',
    vitalsSub: 'Blood pressure, heart rate, and oxygen levels',
    printSlip: 'Print Token Slip (पर्ची प्रिंट करें)',
    sendSms: 'Send Slip via SMS / WhatsApp',
    smsSent: 'Token details sent to your registered phone number!',
    uploadDoc: 'Upload Prescription / Lab Report',
    ocrProcessing: 'Gemini Vision AI is extracting medicines...',
    ocrDone: 'Prescription Analyzed Successfully',
    scanAbhaCard: 'Scan ABHA Card / QR Code'
  },
  hi: {
    appName: 'मेडीकियोस्क (MediKiosk)',
    appSub: 'बहुभाषी ओपीडी मरीज पंजीकरण एवं आयुष केस-टेकिंग कियोस्क',
    sihBadge: 'एसआईएच समस्या 26047 · आयुष मंत्रालय',
    startIntake: 'स्वास्थ्य विवरण दर्ज करना शुरू करें',
    changeLanguage: 'भाषा बदलें / Change Language',
    needHelp: 'मदद चाहिए?',
    helpTitle: 'हम आपकी क्या सहायता कर सकते हैं?',
    repeatQuestion: 'यह सवाल दोबारा सुनें',
    speakSlowly: 'धीमी आवाज़ में बोलें',
    callStaff: 'सहायक कर्मी को यहाँ बुलाएँ',
    goBack: 'एक कदम पीछे जाएँ',
    close: 'बंद करें',
    beforeWeBegin: 'शुरू करने से पहले — गोपनीयता व सहमति',
    consentPrivate: 'आपकी जानकारी पूरी तरह गोपनीय है और केवल आपके डॉक्टर ही इसे देख सकेंगे।',
    consentPurpose: 'यह कियोस्क आपकी बीमारी का इतिहास तैयार करता है ताकि डॉक्टर आपको अधिक समय दे सकें।',
    consentRecords: 'आप अपनी पुरानी पर्चियां या रिपोर्ट स्कैन कर सकते हैं।',
    listenAudio: '🔊 यह जानकारी बोलकर सुनें',
    agreeContinue: 'मैं सहमत हूँ, आगे बढ़ें →',
    declineConsent: 'मैं सीधे अस्पताल कर्मी से बात करना चाहता हूँ',
    idTitle: 'आप अपनी पहचान कैसे दर्ज करना चाहेंगे?',
    idSub: 'अपनी पहचान का पसंदीदा तरीका चुनें।',
    abhaScan: 'आभा आईडी / क्यूआर (ABHA)',
    phoneOption: 'मोबाइल नंबर',
    newPatient: 'पहली बार आए हैं',
    confirmDetails: 'कृपया अपनी सामान्य जानकारी की पुष्टि करें',
    fullName: 'पूरा नाम',
    age: 'उम्र (वर्ष)',
    gender: 'लिंग',
    phone: 'मोबाइल नंबर',
    clinicChoice: 'आज आप किस ओपीडी में दिखाना चाहते हैं?',
    ayushOpd: 'आयुष ओपीडी (AYUSH)',
    ayushSub: 'आयुर्वेद · योग · यूनानी · सिद्ध · होम्योपैथी',
    ayushDesc: 'शरीर प्रकृति, अग्नि (पाचन), कोष्ठ (पेट साफ होना) तथा खान-पान की दिनचर्या का विवरण।',
    allopathyOpd: 'जनरल मेडिसिन / कार्डियोलॉजी ओपीडी',
    allopathySub: 'एलोपैथिक मेडिसिन · हृदय रोग · हड्डी रोग',
    allopathyDesc: 'तीव्र लक्षण, वर्तमान दवाइयाँ और स्वास्थ्य जांच।',
    complaintTitle: 'आज आपको अस्पताल में क्या मुख्य परेशानी है?',
    voicePrimary: 'माइक दबाएं और सामान्य रूप से बोलें',
    listening: 'सुन रहे हैं... कृपया अपनी परेशानी बताएं',
    iHeard: 'मैंने सुना:',
    correctBtn: '✓ सही है',
    tryAgainBtn: '↻ दोबारा बोलें',
    orChoose: 'या इनमें से कोई मुख्य लक्षण चुनें',
    dontKnow: 'मुझे नहीं पता / अनिश्चित',
    medicinesTitle: 'क्या आप वर्तमान में कोई दवाइयाँ ले रहे हैं?',
    yes: 'हाँ',
    no: 'नहीं',
    allergiesTitle: 'क्या आपको किसी दवा या भोजन से एलर्जी है?',
    noKnownAllergies: 'कोई ज्ञात एलर्जी नहीं है',
    hasAllergy: 'हाँ, मुझे एलर्जी है',
    documentsTitle: 'क्या आपके पास पुरानी चिकित्सीय पर्चियां हैं?',
    scanDoc: 'दस्तावेज स्कैनर पर रखें',
    verifyOcr: 'दवाइयों की पुष्टि करें (ओसीआर)',
    reviewTitle: 'कृपया अपनी भरी हुई जानकारी की जाँच करें',
    reviewConfirmNotice: 'मैंने यह जानकारी देख ली है और पुष्टि करता हूँ कि यह डॉक्टर को भेजने हेतु तैयार है।',
    submitHistory: 'विवरण डॉक्टर को भेजें →',
    tokenTitle: 'आपका स्वास्थ्य इतिहास डॉक्टर के पास पहुँच गया है!',
    tokenSub: 'आपकी जानकारी ओपीडी कतार में जोड़ दी गई है। कृपया प्रतीक्षा कक्ष में बैठें।',
    yourToken: 'आपका ओपीडी टोकन नंबर',
    redFlagAlert: 'कृपया यहीं रुकें — स्वास्थ्य कर्मी आपकी सहायता हेतु आ रहे हैं',
    redFlagSub: 'आपके बताए लक्षणों के आधार पर आपको तत्काल चिकित्सीय देखभाल की आवश्यकता हो सकती है।',
    demoNotice: 'डेमो डेटा — स्मार्ट इंडिया हैकाथॉन प्रोटोटाइप · एआई सहायता करता है, डॉक्टर निर्णय लेते हैं',
    vitalsTitle: 'शारीरिक महत्वपूर्ण माप (वाइटल्स)',
    vitalsSub: 'रक्तचाप, नाड़ी और ऑक्सीजन स्तर की जांच',
    printSlip: 'टोकन पर्ची प्रिंट करें',
    sendSms: 'मोबाइल पर एसएमएस भेजें',
    smsSent: 'टोकन विवरण आपके पंजीकृत फोन पर भेज दिया गया है!',
    uploadDoc: 'पर्ची या रिपोर्ट अपलोड करें',
    ocrProcessing: 'जेमिनी विज़न एआई दवाइयों का विवरण पढ़ रहा है...',
    ocrDone: 'पर्ची का विश्लेषण पूरा हुआ',
    scanAbhaCard: 'आभा कार्ड / क्यूआर स्कैन करें'
  }
}

/**
 * Text-to-Speech using browser Web Speech API
 */
export function speakText(text: string, lang: LanguageCode = 'en') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('[Speech] Speech synthesis not supported in this environment.')
    return
  }

  window.speechSynthesis.cancel() // stop any active audio
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
  utterance.rate = 0.9 // speak slightly slower for clarity
  utterance.pitch = 1.0

  window.speechSynthesis.speak(utterance)
}

/**
 * Stops any active speech audio
 */
export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}
