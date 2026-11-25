export interface ParsedVaccineCard {
  vaccineName: string;
  previousDate: string | null; // YYYY-MM-DD
  nextDueDate: string; // YYYY-MM-DD
  vetClinic: string;
  explanation: string;
  detectedConfidence: 'high' | 'medium' | 'fallback';
  rawText: string;
}

const KNOWN_VACCINES: { pattern: RegExp; label: string; monthsInterval: number }[] = [
  { pattern: /\brabies\b/i, label: 'Rabies Booster', monthsInterval: 12 },
  { pattern: /\b(dhpp|dhlpp|dapp|da2pp|distemper|parvo|parvovirus|5[- ]?in[- ]?1)\b/i, label: 'DHPP Core Vaccine', monthsInterval: 12 },
  { pattern: /\b(fvrcp|feline\s*core|3[- ]?in[- ]?1|panleukopenia|calici)\b/i, label: 'FVRCP Core Vaccine', monthsInterval: 12 },
  { pattern: /\b(bordetella|kennel\s*cough)\b/i, label: 'Bordetella (Kennel Cough)', monthsInterval: 6 },
  { pattern: /\b(leptospirosis|lepto)\b/i, label: 'Leptospirosis Vaccine', monthsInterval: 12 },
  { pattern: /\b(felv|leukemia)\b/i, label: 'FeLV (Feline Leukemia)', monthsInterval: 12 },
  { pattern: /\b(lyme)\b/i, label: 'Lyme Vaccine', monthsInterval: 12 },
  { pattern: /\b(deworm|worming|parasite)\b/i, label: 'Deworming & Checkup', monthsInterval: 3 },
];

const MONTHS: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

function toIsoDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function addMonths(d: Date, months: number): Date {
  const res = new Date(d.getTime());
  res.setMonth(res.getMonth() + months);
  return res;
}

function makeValidDate(year: number, monthIndex: number, day: number): Date | null {
  if (year < 2000 || year > 2040 || monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) {
    return null;
  }
  const d = new Date(year, monthIndex, day);
  if (d.getFullYear() !== year || d.getMonth() !== monthIndex || d.getDate() !== day) {
    return null;
  }
  return d;
}

interface ExtractedDate {
  date: Date;
  iso: string;
  line: string;
}

function extractDatesWithContext(text: string): ExtractedDate[] {
  const lines = text.split(/\r?\n/);
  const found: ExtractedDate[] = [];
  const seenIso = new Set<string>();

  const pushIfValid = (d: Date | null, line: string) => {
    if (!d) return;
    const iso = toIsoDate(d);
    if (!seenIso.has(iso)) {
      seenIso.add(iso);
      found.push({ date: d, iso, line });
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // 1. YYYY-MM-DD or YYYY/MM/DD
    for (const m of line.matchAll(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/g)) {
      pushIfValid(makeValidDate(Number(m[1]), Number(m[2]) - 1, Number(m[3])), line);
    }

    // 2. DD/MM/YYYY or MM/DD/YYYY or DD-MM-YY
    for (const m of line.matchAll(/\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2}|\d{2})\b/g)) {
      const a = Number(m[1]);
      const b = Number(m[2]);
      let yr = Number(m[3]);
      if (yr < 100) yr += 2000;

      // Disambiguate DD/MM vs MM/DD: default DD/MM unless second part > 12
      let day = a;
      let month = b;
      if (b > 12 && a <= 12) {
        month = a;
        day = b;
      }
      pushIfValid(makeValidDate(yr, month - 1, day), line);
    }

    // 3. "20 Nov 2025" or "20 November, 2025"
    for (const m of line.matchAll(/\b(\d{1,2})\s+([A-Za-z]{3,9}),?\s+(20\d{2}|\d{2})\b/g)) {
      const mon = MONTHS[m[2].toLowerCase()];
      if (mon !== undefined) {
        let yr = Number(m[3]);
        if (yr < 100) yr += 2000;
        pushIfValid(makeValidDate(yr, mon, Number(m[1])), line);
      }
    }

    // 4. "Nov 20, 2025" or "November 20 2025"
    for (const m of line.matchAll(/\b([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(20\d{2}|\d{2})\b/g)) {
      const mon = MONTHS[m[1].toLowerCase()];
      if (mon !== undefined) {
        let yr = Number(m[3]);
        if (yr < 100) yr += 2000;
        pushIfValid(makeValidDate(yr, mon, Number(m[2])), line);
      }
    }
  }

  return found;
}

/**
 * Parses OCR text from a photographed pet vaccination card / vet receipt.
 * Automatically identifies vaccine name, previous administered date, next due deadline,
 * and clinic name.
 */
export function parseVaccineCardText(rawText: string, petSpecies = 'dog'): ParsedVaccineCard {
  const defaultInterval = 12;
  let vaccineName = petSpecies.toLowerCase() === 'cat' ? 'FVRCP Core Vaccine' : 'Rabies Booster';
  let intervalMonths = defaultInterval;
  let matchedVaccine = false;

  for (const v of KNOWN_VACCINES) {
    if (v.pattern.test(rawText)) {
      vaccineName = v.label;
      intervalMonths = v.monthsInterval;
      matchedVaccine = true;
      break;
    }
  }

  // Extract Vet Clinic name if mentioned
  let vetClinic = '';
  for (const line of rawText.split(/\r?\n/)) {
    const clean = line.trim();
    if (clean.length >= 4 && clean.length <= 60 && /\b(clinic|vet|veterinary|hospital|pet\s*care|animal|dr\.)\b/i.test(clean)) {
      vetClinic = clean.replace(/[^A-Za-z0-9\s.&'-]/g, '').trim();
      break;
    }
  }

  const dates = extractDatesWithContext(rawText);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let explicitDue: ExtractedDate | null = null;
  let explicitPrev: ExtractedDate | null = null;

  const dueKeywords = /\b(next|due|valid|exp|expiry|expires|booster|revaccin|follow[- ]?up|until)\b/i;
  const prevKeywords = /\b(given|admin|administered|date|vaccin|done|shot|immuniz|prev)\b/i;

  for (const item of dates) {
    if (dueKeywords.test(item.line) && !explicitDue) {
      explicitDue = item;
    } else if (prevKeywords.test(item.line) && !explicitPrev) {
      explicitPrev = item;
    }
  }

  // Heuristic if keywords were missed by OCR
  if (!explicitDue && !explicitPrev && dates.length > 0) {
    const sorted = [...dates].sort((a, b) => a.date.getTime() - b.date.getTime());
    const future = sorted.filter((d) => d.date.getTime() > today.getTime());
    const past = sorted.filter((d) => d.date.getTime() <= today.getTime());

    if (future.length > 0) {
      explicitDue = future[0];
      if (past.length > 0) explicitPrev = past[past.length - 1];
    } else if (past.length > 0) {
      explicitPrev = past[past.length - 1];
    }
  }

  if (explicitDue) {
    return {
      vaccineName,
      previousDate: explicitPrev ? explicitPrev.iso : null,
      nextDueDate: explicitDue.iso,
      vetClinic,
      detectedConfidence: matchedVaccine ? 'high' : 'medium',
      explanation: explicitPrev
        ? `Read previous shot (${explicitPrev.iso}) and next due deadline (${explicitDue.iso}) directly from your vet paper.`
        : `Read next due deadline (${explicitDue.iso}) directly from your vet paper.`,
      rawText,
    };
  }

  if (explicitPrev) {
    const computedNext = addMonths(explicitPrev.date, intervalMonths);
    const computedIso = toIsoDate(computedNext);
    return {
      vaccineName,
      previousDate: explicitPrev.iso,
      nextDueDate: computedIso,
      vetClinic,
      detectedConfidence: matchedVaccine ? 'high' : 'medium',
      explanation: `Found previous vaccination date (${explicitPrev.iso}) — automatically set your ${intervalMonths}-month booster deadline to ${computedIso}.`,
      rawText,
    };
  }

  // Graceful fallback: save photo & set suggested reminder 1 year from today so user can pick date in 1 tap
  const fallbackDue = toIsoDate(addMonths(today, 12));
  return {
    vaccineName,
    previousDate: null,
    nextDueDate: fallbackDue,
    vetClinic,
    detectedConfidence: 'fallback',
    explanation: 'Your vet paper photo is ready to save! We could not read the handwritten date clearly — please confirm or pick the exact date below.',
    rawText,
  };
}
