const geminiProvider = require('./geminiProvider');
const groqProvider = require('./groqProvider');
const { SUPPORTED_SPECIALTIES } = require('../../config/specialtiesConfig');

/**
 * Resolves natural language date terms relative to the Asia/Kolkata timezone
 * Supports: 'today', 'tomorrow', 'day after tomorrow', 'this friday', 'next monday', YYYY-MM-DD
 */
const resolveDateInKolkata = (dateTerm) => {
  const now = new Date();
  const kolkataDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
  const [year, month, day] = kolkataDateStr.split('-').map(Number);
  const kolkataDate = new Date(Date.UTC(year, month - 1, day));

  const term = (dateTerm || '').toLowerCase().trim();

  if (term === 'today') {
    return kolkataDate.toISOString().slice(0, 10);
  }

  if (term === 'tomorrow') {
    const tomorrow = new Date(kolkataDate);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  }

  if (term.includes('day after tomorrow')) {
    const dat = new Date(kolkataDate);
    dat.setUTCDate(dat.getUTCDate() + 2);
    return dat.toISOString().slice(0, 10);
  }

  // Check weekday names (e.g. "this friday", "next monday", "wednesday")
  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < weekdays.length; i++) {
    if (term.includes(weekdays[i])) {
      const currentDay = kolkataDate.getUTCDay();
      let diff = i - currentDay;
      if (diff <= 0) diff += 7; // Next occurrence
      const targetDay = new Date(kolkataDate);
      targetDay.setUTCDate(targetDay.getUTCDate() + diff);
      return targetDay.toISOString().slice(0, 10);
    }
  }

  // Check if it's already YYYY-MM-DD format
  const ymdMatch = term.match(/\b(202\d-\d{2}-\d{2})\b/);
  if (ymdMatch) {
    return ymdMatch[1];
  }

  // Default to tomorrow if unspecified for booking requests
  const defaultTomorrow = new Date(kolkataDate);
  defaultTomorrow.setUTCDate(defaultTomorrow.getUTCDate() + 1);
  return defaultTomorrow.toISOString().slice(0, 10);
};

/**
 * Validates and maps extracted specialty text to one of the 15 supported specialties
 */
const matchSupportedSpecialty = (specialtyCandidate) => {
  if (!specialtyCandidate) return null;
  const clean = specialtyCandidate.toLowerCase().trim();

  // 1. Exact Name or Slug match (Highest priority)
  for (const s of SUPPORTED_SPECIALTIES) {
    if (s.name.toLowerCase() === clean || s.slug === clean) {
      return s;
    }
  }

  // 2. Exact keyword list match
  for (const s of SUPPORTED_SPECIALTIES) {
    if (s.keywords.includes(clean)) {
      return s;
    }
  }

  // 3. Word boundary keyword search
  for (const s of SUPPORTED_SPECIALTIES) {
    for (const kw of s.keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(clean)) {
        return s;
      }
    }
  }

  return null;
};

/**
 * Deterministic rule-based intent and specialty extractor for all 15 specialties
 */
const deterministicExtractIntent = (text) => {
  const lower = (text || '').toLowerCase();

  // Detect intent
  let intent = 'unknown';
  if (
    lower.includes('book') ||
    lower.includes('schedule') ||
    lower.includes('appointment') ||
    lower.includes('doctor') ||
    lower.includes('specialist') ||
    lower.includes('consult') ||
    lower.includes('need') ||
    lower.includes('find')
  ) {
    intent = 'book_appointment';
  } else if (lower.includes('cancel')) {
    intent = 'cancel_appointment';
  } else if (lower.includes('confirm') || lower.includes('yes') || lower.includes('proceed')) {
    intent = 'confirm_booking';
  } else if (lower.includes('no') || lower.includes('reject') || lower.includes('different') || lower.includes('another') || lower.includes('alternative')) {
    intent = 'reject_slot';
  }

  // Detect medical specialty across all 15 supported specialties
  let matchedSpecialty = null;
  for (const s of SUPPORTED_SPECIALTIES) {
    for (const kw of s.keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(lower)) {
        matchedSpecialty = s;
        break;
      }
    }
    if (matchedSpecialty) break;
  }

  // Detect date term
  let dateTerm = null;
  if (lower.includes('tomorrow')) dateTerm = 'tomorrow';
  else if (lower.includes('today')) dateTerm = 'today';
  else if (lower.includes('day after tomorrow')) dateTerm = 'day after tomorrow';
  else {
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (const w of weekdays) {
      if (lower.includes(w)) {
        dateTerm = w;
        break;
      }
    }
  }
  const resolvedDate = resolveDateInKolkata(dateTerm);

  // Detect time preference, e.g. "after 3 PM", "after 4 pm", "after 15:00", "after 16:00"
  let timeAfter = null;
  const timePmMatch = lower.match(/after\s+(\d{1,2})(?::(\d{2}))?\s*(pm|am)?/i);
  if (timePmMatch) {
    let hour = parseInt(timePmMatch[1], 10);
    const minute = timePmMatch[2] ? timePmMatch[2] : '00';
    const ampm = timePmMatch[3] ? timePmMatch[3].toLowerCase() : (hour < 12 && hour >= 1 && hour <= 7 ? 'pm' : '');
    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;
    timeAfter = `${hour.toString().padStart(2, '0')}:${minute}`;
  } else if (lower.includes('after 3')) {
    timeAfter = '15:00';
  } else if (lower.includes('after 4')) {
    timeAfter = '16:00';
  }

  // Detect location / city
  let location = null;
  const cities = ['pune', 'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata'];
  for (const c of cities) {
    if (new RegExp(`\\b${c}\\b`, 'i').test(lower)) {
      location = c.charAt(0).toUpperCase() + c.slice(1);
      break;
    }
  }
  if (!location && (lower.includes('near me') || lower.includes('nearby') || lower.includes('around me') || lower.includes('close to me'))) {
    location = 'Pune';
  }

  // Detect phone number (10 digits)
  let phone = null;
  const phoneMatch = text.match(/(?:phone(?:\s*number)?[:\s]+|contact[:\s]+)?((?:\+91[\-\s]?)?[6789]\d{9})/i);
  if (phoneMatch) {
    phone = phoneMatch[1] || phoneMatch[0];
  }

  // Detect patient name (Requires proper case capitalized names to avoid matching common words)
  let patientName = null;
  const namePatterns = [
    /(?:my name is|i am|patient(?:\s+name)?(?:\s+is)?[:\s]+|for patient\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/,
    /(?:for\s+)([A-Z][a-z]+\s+[A-Z][a-z]+)/,
    /(?:name:\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
    // Match 2-word proper noun at start of text e.g. "Rahul Sharma phone 9876543210" or "Rahul Sharma"
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/,
    // Match 2-word proper noun before phone or punctuation
    /\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b(?=\s*(?:,|phone|contact|\+?91|\d{10}))/i,
  ];
  for (const p of namePatterns) {
    const match = text.match(p);
    if (match && match[1]) {
      const cleanName = match[1].replace(/\s+(phone|contact|tomorrow|after|in|at)\b.*$/i, '').trim();
      const forbidden = [
        'stomach', 'a tooth', 'consultation', 'child', 'kid',
        'pune maharashtra', 'ruby hall', 'deenanath mangeshkar', 'jehangir hospital',
        'jupiter hospital', 'manipal hospital', 'heart center', 'cardiology care',
        'orthopedic doctor', 'general medicine', 'open streetmap', 'earliest slot'
      ];
      if (cleanName.length > 2 && !forbidden.includes(cleanName.toLowerCase())) {
        patientName = cleanName;
        break;
      }
    }
  }

  return {
    intent,
    specialty: matchedSpecialty ? matchedSpecialty.name : null,
    specialtySlug: matchedSpecialty ? matchedSpecialty.slug : null,
    isSpecialtyAmbiguous: !matchedSpecialty && intent === 'book_appointment',
    date: dateTerm || 'tomorrow',
    resolvedDate,
    timePreference: timeAfter ? `after ${timeAfter}` : null,
    timeAfter: timeAfter,
    location,
    patientName,
    phone,
    source: 'deterministic_engine',
  };
};

/**
 * High-level AI extractor: attempts Gemini -> Groq -> Deterministic
 */
const extractStructuredIntent = async (userPrompt) => {
  const specialtiesList = SUPPORTED_SPECIALTIES.map((s) => s.name).join(', ');
  const systemInstruction = `You are the CardioCare AI Multi-Specialty Clinical Intent Extraction Engine.
Analyze the user's hospital appointment booking request and extract structured JSON matching this schema:
{
  "intent": "book_appointment" | "cancel_appointment" | "confirm_booking" | "reject_slot" | "general_inquiry",
  "specialty": string matching one of [${specialtiesList}] or null if unspecified/ambiguous,
  "date": "tomorrow" | "today" | "this Friday" | "YYYY-MM-DD" | null,
  "timePreference": string (e.g. "after 15:00") | null,
  "timeAfter": "HH:mm" (24hr, e.g. "15:00" for after 3 PM, "16:00" for after 4 PM) | null,
  "location": "City Name" (e.g. "Pune") | null,
  "patientName": "Full Name" | null,
  "phone": "Phone Number" | null
}
Ensure timeAfter is formatted as 24-hour HH:mm. Return only pure JSON without markdown fences.`;

  // Try Gemini if available
  if (geminiProvider.isAvailable()) {
    try {
      const extracted = await geminiProvider.generateJson(systemInstruction, userPrompt);
      const matched = matchSupportedSpecialty(extracted.specialty);
      extracted.specialty = matched ? matched.name : null;
      extracted.specialtySlug = matched ? matched.slug : null;
      extracted.isSpecialtyAmbiguous = !matched && extracted.intent === 'book_appointment';
      extracted.resolvedDate = resolveDateInKolkata(extracted.date);
      extracted.source = 'gemini_api';
      return extracted;
    } catch (geminiErr) {
      console.warn('[AIProvider] Gemini generation failed:', geminiErr.message, 'Trying fallback...');
    }
  }

  // Try Groq if available
  if (groqProvider.isAvailable()) {
    try {
      const extracted = await groqProvider.generateJson(systemInstruction, userPrompt);
      const matched = matchSupportedSpecialty(extracted.specialty);
      extracted.specialty = matched ? matched.name : null;
      extracted.specialtySlug = matched ? matched.slug : null;
      extracted.isSpecialtyAmbiguous = !matched && extracted.intent === 'book_appointment';
      extracted.resolvedDate = resolveDateInKolkata(extracted.date);
      extracted.source = 'groq_api';
      return extracted;
    } catch (groqErr) {
      console.warn('[AIProvider] Groq generation failed:', groqErr.message, 'Falling back to deterministic parser...');
    }
  }

  // Deterministic rule-based extraction
  return deterministicExtractIntent(userPrompt);
};

module.exports = {
  extractStructuredIntent,
  deterministicExtractIntent,
  resolveDateInKolkata,
  matchSupportedSpecialty,
};
